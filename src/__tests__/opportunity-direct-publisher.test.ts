import { describe, it, expect } from "vitest";

import {
  publishOpportunityDirectly,
  type DirectPublisherPrismaDelegate
} from "@/lib/automation/direct-publisher";
import { type EvaluatedCandidate } from "@/lib/automation/publisher-decision";
import { SourceConfig } from "@/lib/automation/types";

describe("Phase 16D: Direct Database Publisher (Phase 2)", () => {
  const mockNow = new Date("2026-09-25T12:00:00.000Z");

  const baseOfficialSource: SourceConfig = {
    source: "official_careers_portal",
    sourceName: "Official University Careers",
    category: "UNIVERSITY",
    discoveryMethod: "structured_api",
    defaultTrust: "OFFICIAL",
    scheduleMinutes: 360,
    endpointUrl: "https://careers.university.edu/api/jobs",
    enabled: true,
    maxItemsPerRun: 20,
    applicationUrlPolicy: "DIRECT",
    policy: {
      directApplicationRequired: true,
      requiresFreshnessEvidence: true,
      allowedOpportunityTypes: ["INTERNSHIP", "JOB"]
    }
  };

  const baseValidCandidate: EvaluatedCandidate = {
    source: "official_careers_portal",
    sourceName: "Official University Careers",
    sourceUrl: "https://careers.university.edu/jobs/se-intern-2026",
    externalId: "univ-job-90210",
    canonicalUrl: "https://jobs.lever.co/acme/f47ac10b-58cc-4372-a567-0e02b2c3d479",
    canonicalHash: "hash_90210_valid",
    applicationUrl: "https://jobs.lever.co/acme/f47ac10b-58cc-4372-a567-0e02b2c3d479",
    title: "Software Engineering Intern - Summer 2026",
    normalizedTitle: "software engineering intern summer 2026",
    company: "Acme Technologies",
    normalizedCompany: "acme",
    description: "Join Acme Technologies for a comprehensive 12-week summer internship working on distributed systems and cloud infrastructure with our core engineering teams.",
    opportunityType: "INTERNSHIP",
    subtypes: ["STUDENT_JOB", "CAMPUS"],
    tags: ["tech", "engineering"],
    location: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    country: "India",
    workMode: "hybrid",
    compensation: 45000,
    currency: "INR",
    skills: "TypeScript, Node.js, PostgreSQL",
    duration: "3 months",
    deadline: new Date("2026-11-30T23:59:59.000Z"),
    startDate: new Date("2026-05-01T00:00:00.000Z"),
    sourceTrust: "OFFICIAL",
    verificationState: "OFFICIAL_SOURCE_CONFIRMED",
    qualityScore: 92,
    spamRiskScore: 0,
    status: "PROCESSING",
    discoveredAt: mockNow,
    lastSeenAt: mockNow
  };

  /**
   * Creates an in-memory mock store that adheres to DirectPublisherPrismaDelegate
   */
  function createMockPrisma(initialStore: any[] = []) {
    const store = [...initialStore];
    let shouldFailWrite = false;

    const delegate: DirectPublisherPrismaDelegate & {
      _getStore: () => any[];
      _setFailWrite: (fail: boolean) => void;
    } = {
      internship: {
        findFirst: async ({ where }: any) => {
          return (
            store.find((rec) => {
              // Match ID directly if querying by ID
              if (where.id && rec.id === where.id) return true;
              // Exclude records that are deleted
              if (where.deletedAt === null && rec.deletedAt !== null) return false;
              // Exclude records with disallowed statuses
              if (where.status?.notIn && where.status.notIn.includes(rec.status)) return false;
              // Match externalId
              if (where.externalId && rec.externalId === where.externalId) return true;
              // Match applicationLink
              if (where.applicationLink && rec.applicationLink === where.applicationLink) return true;
              // Match title and company
              if (
                where.title &&
                where.company &&
                rec.title.toLowerCase() === where.title.toLowerCase() &&
                rec.company.toLowerCase() === where.company.toLowerCase()
              ) {
                return true;
              }
              return false;
            }) || null
          );
        },
        create: async ({ data }: any) => {
          if (shouldFailWrite) {
            throw new Error("Simulated database failure during INSERT into Internship");
          }
          const newRecord = {
            id: `internship-uuid-${store.length + 1}`,
            ...data
          };
          store.push(newRecord);
          return {
            id: newRecord.id,
            externalId: newRecord.externalId,
            applicationLink: newRecord.applicationLink
          };
        },
        update: async ({ where, data }: any) => {
          if (shouldFailWrite) {
            throw new Error("Simulated database failure during UPDATE of Internship");
          }
          const index = store.findIndex((r) => r.id === where.id);
          if (index === -1) throw new Error("Record not found for update");
          store[index] = { ...store[index], ...data };
          return {
            id: store[index].id,
            externalId: store[index].externalId,
            applicationLink: store[index].applicationLink
          };
        }
      },
      gig: {
        findFirst: async () => null
      },
      $transaction: async (fn: any) => fn(delegate),
      _getStore: () => store,
      _setFailWrite: (fail: boolean) => {
        shouldFailWrite = fail;
      }
    };

    return delegate;
  }

  // ==========================================================================
  // 1. AUTO_PUBLISH -> Creates Record
  // ==========================================================================
  it("AUTO_PUBLISH -> creates record in Internship table with exact fields", async () => {
    const mockPrisma = createMockPrisma([]);

    const res = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true,
      botUserId: "bot-uuid-999"
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe("CREATED");
    expect(res.recordId).toBeDefined();
    expect(res.publishedUrl).toBe(`/internships/${res.recordId}`);

    // Verify database record
    const store = mockPrisma._getStore();
    expect(store).toHaveLength(1);
    const created = store[0];
    expect(created.id).toBe(res.recordId);
    expect(created.title).toBe("Software Engineering Intern - Summer 2026");
    expect(created.company).toBe("Acme Technologies");
    expect(created.externalId).toBe("univ-job-90210");
    expect(created.applicationLink).toBe("https://jobs.lever.co/acme/f47ac10b-58cc-4372-a567-0e02b2c3d479");
    expect(created.status).toBe("OPEN");
    expect(created.posted_by).toBe("bot-uuid-999");
    expect(created.deletedAt).toBeNull();
    expect(created.deadline).toEqual(new Date("2026-11-30T23:59:59.000Z"));
  });

  // ==========================================================================
  // 2. AUTO_PUBLISH -> Repeated Invocation Remains Idempotent
  // ==========================================================================
  it("AUTO_PUBLISH -> repeated invocation remains idempotent (zero duplicate listings)", async () => {
    const mockPrisma = createMockPrisma([]);

    // First call: creates record
    const firstRes = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });
    expect(firstRes.action).toBe("CREATED");
    expect(mockPrisma._getStore()).toHaveLength(1);

    // Second call: same candidate
    const secondRes = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    // Idempotent: refreshed without creating duplicate
    expect(secondRes.success).toBe(true);
    expect(secondRes.action).toBe("UPDATED");
    expect(secondRes.recordId).toBe(firstRes.recordId);
    expect(mockPrisma._getStore()).toHaveLength(1); // Store length invariant maintained
  });

  // ==========================================================================
  // 3. Existing externalId -> No Duplicate
  // ==========================================================================
  it("existing externalId -> detects active record and does not duplicate", async () => {
    const existing = {
      id: "existing-uuid-11",
      externalId: "univ-job-90210",
      title: "Previous Title",
      company: "Acme Technologies",
      applicationLink: "https://jobs.lever.co/acme/old-link",
      status: "OPEN",
      deletedAt: null
    };
    const mockPrisma = createMockPrisma([existing]);

    const res = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe("UPDATED");
    expect(res.recordId).toBe("existing-uuid-11");
    expect(mockPrisma._getStore()).toHaveLength(1);
  });

  // ==========================================================================
  // 4. Existing Canonical URL -> No Duplicate
  // ==========================================================================
  it("existing canonical URL -> detects match without externalId and prevents duplicate", async () => {
    const existing = {
      id: "existing-uuid-22",
      externalId: null,
      title: "Software Engineering Intern - Summer 2026",
      company: "Acme Technologies",
      applicationLink: baseValidCandidate.canonicalUrl,
      status: "OPEN",
      deletedAt: null
    };
    const mockPrisma = createMockPrisma([existing]);

    const candidateWithoutId: EvaluatedCandidate = {
      ...baseValidCandidate,
      externalId: null
    };

    const res = await publishOpportunityDirectly({
      candidate: candidateWithoutId,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe("UPDATED");
    expect(res.recordId).toBe("existing-uuid-22");
    expect(mockPrisma._getStore()).toHaveLength(1);
  });

  // ==========================================================================
  // 5. Existing Active Company / Title -> Duplicate Handling
  // ==========================================================================
  it("existing active company/title -> prevents duplicate creation", async () => {
    const existing = {
      id: "existing-uuid-33",
      externalId: "legacy-ext-id",
      title: baseValidCandidate.title,
      company: baseValidCandidate.company,
      applicationLink: "https://jobs.lever.co/acme/diff-slug",
      status: "OPEN",
      deletedAt: null
    };
    const mockPrisma = createMockPrisma([existing]);

    const res = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe("UPDATED");
    expect(res.recordId).toBe("existing-uuid-33");
    expect(mockPrisma._getStore()).toHaveLength(1);
  });

  // ==========================================================================
  // 6. Rejected / Deleted Records
  // ==========================================================================
  it("rejected/deleted records -> do not block new listing and are not revived", async () => {
    const inactiveRecord = {
      id: "inactive-uuid-44",
      externalId: "old-abandoned-id",
      title: baseValidCandidate.title,
      company: baseValidCandidate.company,
      applicationLink: "https://jobs.lever.co/acme/old",
      status: "DELETED",
      deletedAt: new Date("2026-01-01T00:00:00.000Z")
    };
    const mockPrisma = createMockPrisma([inactiveRecord]);

    // Candidate has a new externalId and new application link
    const res = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe("CREATED");
    // New active record was created
    expect(mockPrisma._getStore()).toHaveLength(2);
    // Inactive record was NOT revived or modified
    const store = mockPrisma._getStore();
    const oldRec = store.find((r) => r.id === "inactive-uuid-44");
    expect(oldRec.status).toBe("DELETED");
    expect(oldRec.deletedAt).not.toBeNull();
  });

  // ==========================================================================
  // 7. Unsupported Opportunity Type
  // ==========================================================================
  it("unsupported opportunity type -> fails cleanly without creating fake records", async () => {
    const mockPrisma = createMockPrisma([]);

    const candidate: EvaluatedCandidate = {
      ...baseValidCandidate,
      opportunityType: "GIG" // Peer-to-peer gig not supported for external auto-publish
    };

    const res = await publishOpportunityDirectly({
      candidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(false);
    expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(res.errorClassification).toBe("PERSISTENCE_UNSUPPORTED");
    expect(mockPrisma._getStore()).toHaveLength(0); // Zero database writes
  });

  // ==========================================================================
  // 8. Missing Optional Deadline Remains Null
  // ==========================================================================
  it("missing optional deadline remains null without fabricating date", async () => {
    const mockPrisma = createMockPrisma([]);

    const candidate: EvaluatedCandidate = {
      ...baseValidCandidate,
      deadline: null
    };

    const res = await publishOpportunityDirectly({
      candidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(true);
    expect(res.action).toBe("CREATED");

    const created = mockPrisma._getStore()[0];
    expect(created.deadline).toBeNull();
  });

  // ==========================================================================
  // 9. Database Failure Handling
  // ==========================================================================
  it("database failure -> returns structured failure telemetry without reporting success", async () => {
    const mockPrisma = createMockPrisma([]);
    mockPrisma._setFailWrite(true); // Simulate database outage/error

    const res = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(false);
    expect(res.action).toBe("FAILED_DATABASE_ERROR");
    expect(res.errorClassification).toBe("DATABASE_ERROR");
    expect(res.reason).toContain("Database persistence error");
    expect(res.telemetry.candidateIdentity).toBeDefined();
    expect(mockPrisma._getStore()).toHaveLength(0);
  });

  // ==========================================================================
  // 10. Decision != AUTO_PUBLISH
  // ==========================================================================
  it("decision != AUTO_PUBLISH -> rejected candidate is never published", async () => {
    const mockPrisma = createMockPrisma([]);

    const incompleteCandidate: EvaluatedCandidate = {
      ...baseValidCandidate,
      title: "Dev" // Title < 5 chars, fails Gate 4
    };

    const res = await publishOpportunityDirectly({
      candidate: incompleteCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(false);
    expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(res.errorClassification).toBe("DECISION_REJECTED");
    expect(mockPrisma._getStore()).toHaveLength(0);
  });

  // ==========================================================================
  // 11. Feature Flag OFF
  // ==========================================================================
  it("feature flag OFF -> routes to NEEDS_REVIEW and skips database publication", async () => {
    const mockPrisma = createMockPrisma([]);

    const res = await publishOpportunityDirectly({
      candidate: baseValidCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: false // Feature flag OFF
    });

    expect(res.success).toBe(false);
    expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(res.errorClassification).toBe("FEATURE_FLAG_DISABLED");
    expect(res.reason).toContain("not eligible for automated publishing");
    expect(mockPrisma._getStore()).toHaveLength(0);
  });

  // ==========================================================================
  // 12. Fabricated Identity Never Reaches Publication
  // ==========================================================================
  it("fabricated identity never reaches publication", async () => {
    const mockPrisma = createMockPrisma([]);

    const fabricatedCandidate: EvaluatedCandidate = {
      ...baseValidCandidate,
      externalId: "fabricated_ext_id_123",
      isFabricatedExternalId: true
    };

    const res = await publishOpportunityDirectly({
      candidate: fabricatedCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(false);
    expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(res.decisionResult.gates.provenance.code).toBe("PROVENANCE_FABRICATED_EXTERNAL_ID");
    expect(mockPrisma._getStore()).toHaveLength(0);
  });

  // ==========================================================================
  // 13. Publisher Cannot Bypass Phase 1
  // ==========================================================================
  it("publisher cannot bypass Phase 1 security / scam / SSRF gates", async () => {
    const mockPrisma = createMockPrisma([]);

    const ssrfCandidate: EvaluatedCandidate = {
      ...baseValidCandidate,
      canonicalUrl: "http://169.254.169.254/latest/meta-data/",
      applicationUrl: "http://169.254.169.254/latest/meta-data/"
    };

    const res = await publishOpportunityDirectly({
      candidate: ssrfCandidate,
      sourceConfig: baseOfficialSource,
      now: mockNow,
      prismaClient: mockPrisma,
      isAutoPublishEnabledOverride: true
    });

    expect(res.success).toBe(false);
    expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
    expect(res.decisionResult.decision).toBe("QUARANTINE");
    expect(res.decisionResult.gates.urlSafety.code).toBe("URL_UNSAFE_OR_SSRF");
    expect(mockPrisma._getStore()).toHaveLength(0);
  });

  // ==========================================================================
  // 14. Target Verification: Update & Merge Semantics (A through F)
  // ==========================================================================
  describe("Update & Merge Semantics (Hardened Invariants)", () => {
    // A. Existing deadline + incoming deadline -> update behavior
    it("UPDATE-SEMANTICS A: existing deadline + incoming deadline updates to new active deadline", async () => {
      const existing = {
        id: "deadline-rec-1",
        externalId: "univ-job-90210",
        title: baseValidCandidate.title,
        company: baseValidCandidate.company,
        applicationLink: baseValidCandidate.canonicalUrl,
        deadline: new Date("2026-10-31T23:59:59.000Z"),
        status: "OPEN",
        deletedAt: null
      };
      const mockPrisma = createMockPrisma([existing]);

      const candidateWithNewDeadline: EvaluatedCandidate = {
        ...baseValidCandidate,
        deadline: new Date("2026-12-15T23:59:59.000Z") // Extended deadline
      };

      const res = await publishOpportunityDirectly({
        candidate: candidateWithNewDeadline,
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.success).toBe(true);
      expect(res.action).toBe("UPDATED");
      const updated = mockPrisma._getStore().find((r) => r.id === "deadline-rec-1");
      expect(updated.deadline).toEqual(new Date("2026-12-15T23:59:59.000Z"));
    });

    // B. Existing deadline + incoming deadline=null -> MUST NOT be silently erased
    it("UPDATE-SEMANTICS B: existing deadline + incoming deadline=null MUST NOT be silently erased", async () => {
      const originalDeadline = new Date("2026-11-30T23:59:59.000Z");
      const existing = {
        id: "deadline-rec-2",
        externalId: "univ-job-90210",
        title: baseValidCandidate.title,
        company: baseValidCandidate.company,
        applicationLink: baseValidCandidate.canonicalUrl,
        deadline: originalDeadline,
        status: "OPEN",
        deletedAt: null
      };
      const mockPrisma = createMockPrisma([existing]);

      // Incoming candidate from run where source omitted deadline
      const candidateWithNullDeadline: EvaluatedCandidate = {
        ...baseValidCandidate,
        deadline: null
      };

      const res = await publishOpportunityDirectly({
        candidate: candidateWithNullDeadline,
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.success).toBe(true);
      expect(res.action).toBe("UPDATED");
      const record = mockPrisma._getStore().find((r) => r.id === "deadline-rec-2");
      // Critical invariant: existing valid deadline is preserved, NOT erased to null
      expect(record.deadline).toEqual(originalDeadline);
      expect(record.deadline).not.toBeNull();
    });

    // C. Existing description + incoming description=null/empty -> MUST NOT be silently erased
    it("UPDATE-SEMANTICS C: existing description + incoming description=null/empty MUST NOT be silently erased", async () => {
      const richOriginalDescription =
        "Original comprehensive description containing over 120 characters describing distributed systems work, mentoring, and competitive stipend.";
      const existing = {
        id: "desc-rec-1",
        externalId: "univ-job-90210",
        title: baseValidCandidate.title,
        company: baseValidCandidate.company,
        description: richOriginalDescription,
        applicationLink: baseValidCandidate.canonicalUrl,
        status: "OPEN",
        deletedAt: null
      };
      const mockPrisma = createMockPrisma([existing]);

      const candidateWithEmptyDesc: EvaluatedCandidate = {
        ...baseValidCandidate,
        description: "" // Empty description
      };

      const res = await publishOpportunityDirectly({
        candidate: candidateWithEmptyDesc,
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockPrisma,
        isAutoPublishEnabledOverride: true
      });

      // Gate 4 fails on empty description -> SKIPPED_NOT_PUBLISHABLE
      expect(res.success).toBe(false);
      expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
      const record = mockPrisma._getStore().find((r) => r.id === "desc-rec-1");
      // Critical invariant: original rich description remains intact
      expect(record.description).toBe(richOriginalDescription);
    });

    // D. Existing stronger provenance/source + incoming weaker source
    it("UPDATE-SEMANTICS D: existing stronger provenance (OFFICIAL) + incoming weaker source (KNOWN_AGGREGATOR) preserves stronger provenance", async () => {
      const existing = {
        id: "prov-rec-1",
        externalId: "univ-job-90210",
        source: "official_careers_portal",
        title: baseValidCandidate.title,
        company: baseValidCandidate.company,
        description: baseValidCandidate.description,
        applicationLink: baseValidCandidate.canonicalUrl,
        status: "OPEN",
        deletedAt: null
      };
      const mockPrisma = createMockPrisma([existing]);

      const weakerAggregatorSource: SourceConfig = {
        ...baseOfficialSource,
        source: "generic_aggregator",
        defaultTrust: "KNOWN_AGGREGATOR",
        policy: {
          allowedOpportunityTypes: ["INTERNSHIP", "JOB"],
          directApplicationRequired: false
        }
      };

      const candidateFromWeakerSource: EvaluatedCandidate = {
        ...baseValidCandidate,
        source: "generic_aggregator",
        sourceTrust: "KNOWN_AGGREGATOR"
      };

      const res = await publishOpportunityDirectly({
        candidate: candidateFromWeakerSource,
        sourceConfig: weakerAggregatorSource,
        now: mockNow,
        prismaClient: mockPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.success).toBe(true);
      expect(res.action).toBe("UPDATED");
      const record = mockPrisma._getStore().find((r) => r.id === "prov-rec-1");
      // Critical invariant: source remains official_careers_portal, not downgraded to aggregator
      expect(record.source).toBe("official_careers_portal");
    });

    // E. Existing active listing + incoming duplicate updates only permitted fields (anchor fields immutable)
    it("UPDATE-SEMANTICS E: updates only permitted non-anchor fields (id, company, externalId remain immutable)", async () => {
      const existing = {
        id: "anchor-rec-1",
        externalId: "univ-job-90210",
        company: "Acme Technologies",
        title: baseValidCandidate.title,
        skills: "TypeScript, Node.js",
        applicationLink: baseValidCandidate.canonicalUrl,
        status: "OPEN",
        deletedAt: null
      };
      const mockPrisma = createMockPrisma([existing]);

      const candidateWithNewSkills: EvaluatedCandidate = {
        ...baseValidCandidate,
        skills: "TypeScript, Node.js, GraphQL, PostgreSQL"
      };

      const res = await publishOpportunityDirectly({
        candidate: candidateWithNewSkills,
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.success).toBe(true);
      expect(res.action).toBe("UPDATED");
      const record = mockPrisma._getStore().find((r) => r.id === "anchor-rec-1");
      // Anchor fields unchanged
      expect(record.id).toBe("anchor-rec-1");
      expect(record.company).toBe("Acme Technologies");
      expect(record.externalId).toBe("univ-job-90210");
      // Permitted non-anchor field updated
      expect(record.skills).toBe("TypeScript, Node.js, GraphQL, PostgreSQL");
    });

    // F. Existing expired/closed evidence: Phase 2 must not silently revive or corrupt lifecycle state
    it("UPDATE-SEMANTICS F: existing expired/closed record is NEVER silently revived to OPEN", async () => {
      const existingClosed = {
        id: "closed-rec-1",
        externalId: "univ-job-90210",
        company: baseValidCandidate.company,
        title: baseValidCandidate.title,
        applicationLink: baseValidCandidate.canonicalUrl,
        status: "CLOSED", // Inactive lifecycle state
        deletedAt: null
      };
      const mockPrisma = createMockPrisma([existingClosed]);

      const res = await publishOpportunityDirectly({
        candidate: baseValidCandidate,
        sourceConfig: baseOfficialSource,
        now: mockNow,
        prismaClient: mockPrisma,
        isAutoPublishEnabledOverride: true
      });

      expect(res.success).toBe(false);
      expect(res.action).toBe("SKIPPED_NOT_PUBLISHABLE");
      expect(res.reason).toContain("inactive lifecycle status");
      // Record status must remain CLOSED, never revived to OPEN
      const record = mockPrisma._getStore().find((r) => r.id === "closed-rec-1");
      expect(record.status).toBe("CLOSED");
    });
  });
});
