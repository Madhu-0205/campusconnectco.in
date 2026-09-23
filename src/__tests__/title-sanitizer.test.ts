import { describe, expect, it } from "vitest";
import {
  sanitizeGeneratedTitleSuffix,
  normalizeTitle,
  STAGING_TIMESTAMP_MIN_DATE,
  STAGING_TIMESTAMP_MAX_DATE
} from "@/lib/automation/normalizer";
import { loadSnapshot, simulateRollback } from "../../scratch/rollback_title_cleanup";

describe("Title Sanitizer — Generated Numeric Suffixes & Strict Validation", () => {
  describe("1. Generated Timestamp Suffixes", () => {
    it("removes valid 13-digit millisecond timestamps within staging era", () => {
      // 1789473398384 -> 2026-09-15T11:56:38.384Z
      const res = sanitizeGeneratedTitleSuffix("ML Research Intern Pilot 1789473398384");
      expect(res.wasSanitized).toBe(true);
      expect(res.cleanTitle).toBe("ML Research Intern Pilot");
      expect(res.extractedSuffix).toBe("1789473398384");
      expect(res.isPlausibleTimestamp).toBe(true);
      expect(res.timestampDate?.getFullYear()).toBe(2026);
    });

    it("removes valid 13-digit millisecond timestamps when staging/test evidence is present", () => {
      // In title: contains "AgentReach"
      const resCompany = sanitizeGeneratedTitleSuffix("AgentReach Corp 1789538166184");
      expect(resCompany.wasSanitized).toBe(true);
      expect(resCompany.cleanTitle).toBe("AgentReach Corp");
      expect(resCompany.extractedSuffix).toBe("1789538166184");

      // In company context: company is "AgentReach Corp"
      const resTitle = sanitizeGeneratedTitleSuffix("Distributed Systems Research Intern 1789538166184", {
        company: "AgentReach Corp"
      });
      expect(resTitle.wasSanitized).toBe(true);
      expect(resTitle.cleanTitle).toBe("Distributed Systems Research Intern");
      expect(resTitle.extractedSuffix).toBe("1789538166184");
    });

    it("removes valid 10-digit second timestamps within staging era when staging evidence is present", () => {
      // Contains "Test"
      const res = sanitizeGeneratedTitleSuffix("Publisher Test 1782221837");
      expect(res.wasSanitized).toBe(true);
      expect(res.cleanTitle).toBe("Publisher Test");
      expect(res.extractedSuffix).toBe("1782221837");
      expect(res.isPlausibleTimestamp).toBe(true);
      expect(res.timestampDate?.getFullYear()).toBe(2026);

      // Contains "FutureLabs"
      const resComp = sanitizeGeneratedTitleSuffix("FutureLabs 1782221837");
      expect(resComp.wasSanitized).toBe(true);
      expect(resComp.cleanTitle).toBe("FutureLabs");
      expect(resComp.extractedSuffix).toBe("1782221837");
    });

    it("PRESERVES a valid timestamp if it LACKS staging/test origin evidence (protects genuine employer role codes)", () => {
      // Genuine employer title with a 13-digit code but zero staging keywords
      const genuineJob = sanitizeGeneratedTitleSuffix("Principal Cloud Architect 1789538166184", {
        company: "Google Cloud"
      });
      expect(genuineJob.wasSanitized).toBe(false);
      expect(genuineJob.cleanTitle).toBe("Principal Cloud Architect 1789538166184");
      expect(genuineJob.requiresManualReview).toBe(true);
    });

    it("supports various delimiter styles when staging context is confirmed", () => {
      const opts = { isStagingContext: true };
      const hyphen = sanitizeGeneratedTitleSuffix("Software Engineer - 1789538166184", opts);
      expect(hyphen.wasSanitized).toBe(true);
      expect(hyphen.cleanTitle).toBe("Software Engineer");

      const hash = sanitizeGeneratedTitleSuffix("Software Engineer #1789538166184", opts);
      expect(hash.wasSanitized).toBe(true);
      expect(hash.cleanTitle).toBe("Software Engineer");

      const parens = sanitizeGeneratedTitleSuffix("Software Engineer (1789538166184)", opts);
      expect(parens.wasSanitized).toBe(true);
      expect(parens.cleanTitle).toBe("Software Engineer");

      const colon = sanitizeGeneratedTitleSuffix("Software Engineer: 1789538166184", opts);
      expect(colon.wasSanitized).toBe(true);
      expect(colon.cleanTitle).toBe("Software Engineer");

      const slash = sanitizeGeneratedTitleSuffix("Software Engineer / 1789538166184", opts);
      expect(slash.wasSanitized).toBe(true);
      expect(slash.cleanTitle).toBe("Software Engineer");
    });

    it("handles lower boundary timestamp (2024-01-01) with staging evidence", () => {
      const lowerBoundarySec = Math.floor(STAGING_TIMESTAMP_MIN_DATE.getTime() / 1000); // 1704067200
      const res = sanitizeGeneratedTitleSuffix(`Engineering Intern Test ${lowerBoundarySec}`);
      expect(res.wasSanitized).toBe(true);
      expect(res.cleanTitle).toBe("Engineering Intern Test");
      expect(res.extractedSuffix).toBe(String(lowerBoundarySec));
    });

    it("handles upper boundary timestamp (2030-01-01) with staging evidence", () => {
      const upperBoundarySec = Math.floor(STAGING_TIMESTAMP_MAX_DATE.getTime() / 1000); // 1893456000
      const res = sanitizeGeneratedTitleSuffix(`Engineering Intern Pilot ${upperBoundarySec}`);
      expect(res.wasSanitized).toBe(true);
      expect(res.cleanTitle).toBe("Engineering Intern Pilot");
      expect(res.extractedSuffix).toBe(String(upperBoundarySec));
    });

    it("does NOT remove timestamps outside the allowed staging era", () => {
      // 1000000000 -> 2001 (before 2024)
      const pastSec = sanitizeGeneratedTitleSuffix("Role 1000000000");
      expect(pastSec.wasSanitized).toBe(false);
      expect(pastSec.cleanTitle).toBe("Role 1000000000");
      expect(pastSec.requiresManualReview).toBe(true);

      // 1999999999 -> 2033 (after 2030)
      const futureSec = sanitizeGeneratedTitleSuffix("Role 1999999999");
      expect(futureSec.wasSanitized).toBe(false);
      expect(futureSec.cleanTitle).toBe("Role 1999999999");
      expect(futureSec.requiresManualReview).toBe(true);

      // 9999999999999 -> year 2286
      const futureMs = sanitizeGeneratedTitleSuffix("Role 9999999999999");
      expect(futureMs.wasSanitized).toBe(false);
      expect(futureMs.cleanTitle).toBe("Role 9999999999999");
      expect(futureMs.requiresManualReview).toBe(true);
    });

    it("does NOT remove non-10/13 digit numeric suffixes (8, 11, 12, 14, 16 digits)", () => {
      // 8 digits
      const d8 = sanitizeGeneratedTitleSuffix("Senior Developer 12345678");
      expect(d8.wasSanitized).toBe(false);
      expect(d8.cleanTitle).toBe("Senior Developer 12345678");

      // 11 digits
      const d11 = sanitizeGeneratedTitleSuffix("Senior Developer 12345678901");
      expect(d11.wasSanitized).toBe(false);
      expect(d11.cleanTitle).toBe("Senior Developer 12345678901");

      // 12 digits
      const d12 = sanitizeGeneratedTitleSuffix("Senior Developer 123456789012");
      expect(d12.wasSanitized).toBe(false);
      expect(d12.cleanTitle).toBe("Senior Developer 123456789012");

      // 14 digits
      const d14 = sanitizeGeneratedTitleSuffix("Senior Developer 12345678901234");
      expect(d14.wasSanitized).toBe(false);
      expect(d14.cleanTitle).toBe("Senior Developer 12345678901234");

      // 16 digits
      const d16 = sanitizeGeneratedTitleSuffix("Senior Developer 1234567890123456");
      expect(d16.wasSanitized).toBe(false);
      expect(d16.cleanTitle).toBe("Senior Developer 1234567890123456");
    });
  });

  describe("2. Legitimate Numeric Titles & Numbers Preserved", () => {
    it("preserves job levels like 'SDE 2' and 'Python Developer 3'", () => {
      const sde2 = sanitizeGeneratedTitleSuffix("SDE 2");
      expect(sde2.wasSanitized).toBe(false);
      expect(sde2.cleanTitle).toBe("SDE 2");

      const py3 = sanitizeGeneratedTitleSuffix("Python Developer 3");
      expect(py3.wasSanitized).toBe(false);
      expect(py3.cleanTitle).toBe("Python Developer 3");

      const l1 = sanitizeGeneratedTitleSuffix("Level 1 Support Engineer");
      expect(l1.wasSanitized).toBe(false);
      expect(l1.cleanTitle).toBe("Level 1 Support Engineer");

      const assoc4 = sanitizeGeneratedTitleSuffix("Associate 4");
      expect(assoc4.wasSanitized).toBe(false);
      expect(assoc4.cleanTitle).toBe("Associate 4");
    });

    it("preserves years in titles like 'Summer Internship 2026' and 'Batch of 2025'", () => {
      const yr2026 = sanitizeGeneratedTitleSuffix("Summer Internship 2026");
      expect(yr2026.wasSanitized).toBe(false);
      expect(yr2026.cleanTitle).toBe("Summer Internship 2026");

      const yr2025 = sanitizeGeneratedTitleSuffix("Batch of 2025");
      expect(yr2025.wasSanitized).toBe(false);
      expect(yr2025.cleanTitle).toBe("Batch of 2025");

      const fall2024 = sanitizeGeneratedTitleSuffix("Fall Cohort 2024");
      expect(fall2024.wasSanitized).toBe(false);
      expect(fall2024.cleanTitle).toBe("Fall Cohort 2024");
    });

    it("preserves company and brand names containing numbers like '1XL.com' and 'Web3 Developer'", () => {
      const xl = sanitizeGeneratedTitleSuffix("1XL.com");
      expect(xl.wasSanitized).toBe(false);
      expect(xl.cleanTitle).toBe("1XL.com");

      const web3 = sanitizeGeneratedTitleSuffix("Web3 Developer");
      expect(web3.wasSanitized).toBe(false);
      expect(web3.cleanTitle).toBe("Web3 Developer");

      const iso = sanitizeGeneratedTitleSuffix("ISO 9001 Lead Auditor");
      expect(iso.wasSanitized).toBe(false);
      expect(iso.cleanTitle).toBe("ISO 9001 Lead Auditor");
    });

    it("preserves numbers within the body of the title", () => {
      const translate = sanitizeGeneratedTitleSuffix("Translate 5 pages English to Telugu");
      expect(translate.wasSanitized).toBe(false);
      expect(translate.cleanTitle).toBe("Translate 5 pages English to Telugu");

      const ppt = sanitizeGeneratedTitleSuffix("10-slide PowerPoint for project presentation");
      expect(ppt.wasSanitized).toBe(false);
      expect(ppt.cleanTitle).toBe("10-slide PowerPoint for project presentation");

      const dsa = sanitizeGeneratedTitleSuffix("Explain DSA concepts (1-hour session)");
      expect(dsa.wasSanitized).toBe(false);
      expect(dsa.cleanTitle).toBe("Explain DSA concepts (1-hour session)");
    });
  });

  describe("3. Sanitizer Idempotency & Edge Cases", () => {
    it("is completely idempotent when called repeatedly", () => {
      const input = "ML Research Intern Pilot 1789538166184";
      const first = sanitizeGeneratedTitleSuffix(input);
      const second = sanitizeGeneratedTitleSuffix(first.cleanTitle);
      const third = sanitizeGeneratedTitleSuffix(second.cleanTitle);

      expect(first.cleanTitle).toBe("ML Research Intern Pilot");
      expect(second.cleanTitle).toBe("ML Research Intern Pilot");
      expect(second.wasSanitized).toBe(false);
      expect(third.cleanTitle).toBe("ML Research Intern Pilot");
      expect(third.wasSanitized).toBe(false);
    });

    it("handles null, undefined, empty, and whitespace strings gracefully", () => {
      expect(sanitizeGeneratedTitleSuffix(null).cleanTitle).toBe("");
      expect(sanitizeGeneratedTitleSuffix(undefined).cleanTitle).toBe("");
      expect(sanitizeGeneratedTitleSuffix("").cleanTitle).toBe("");
      expect(sanitizeGeneratedTitleSuffix("   ").cleanTitle).toBe("");
    });

    it("does NOT sanitize if removing suffix leaves fewer than 3 characters", () => {
      // "AB 1789538166184" -> clean candidate "AB" has length 2 < 3
      const res = sanitizeGeneratedTitleSuffix("AB 1789538166184");
      expect(res.wasSanitized).toBe(false);
      expect(res.cleanTitle).toBe("AB 1789538166184");
      expect(res.requiresManualReview).toBe(true);
    });
  });

  describe("4. Deduplication Stability & Canonical Matching", () => {
    it("normalizeTitle produces stable matching strings without test timestamp jitter", () => {
      const raw1 = "ML Research Intern Pilot 1789470112068";
      const raw2 = "ML Research Intern Pilot 1789473398384";
      const clean = "ML Research Intern Pilot";

      const norm1 = normalizeTitle(raw1);
      const norm2 = normalizeTitle(raw2);
      const normClean = normalizeTitle(clean);

      expect(norm1).toBe("ml research intern pilot");
      expect(norm2).toBe("ml research intern pilot");
      expect(normClean).toBe("ml research intern pilot");
      expect(norm1).toBe(norm2);
    });
  });

  describe("5. Snapshot & Rollback Verification", () => {
    it("validates that pre-cleanup snapshot contains exactly the 6 target records", () => {
      const snapshot = loadSnapshot();
      expect(snapshot).toHaveLength(6);

      const ids = snapshot.map((s) => s.id);
      expect(ids).toContain("ebcbfbba-1b35-46a7-b007-d6dc8c4a6250");
      expect(ids).toContain("591a4ed3-1d32-43db-8225-688672baed41");
      expect(ids).toContain("07fab83e-41cb-41a9-8632-7195c26562de");
      expect(ids).toContain("8f77c66c-ddbb-4365-99b6-b244c34701be");
      expect(ids).toContain("57831efd-6018-4b41-bf2f-fc33b0b18821");
      expect(ids).toContain("a8b93e43-fbfa-42be-931a-b9c7b6949456");

      for (const record of snapshot) {
        expect(record.externalId).toBeNull();
        expect(["OPEN", "PENDING_APPROVAL"]).toContain(record.status);
      }
    });

    it("verifies rollback simulation targets only the 6 snapshot records", async () => {
      const sim = await simulateRollback();
      expect(sim.targetCount).toBe(6);
      expect(sim.updates).toHaveLength(6);

      const targetIds = sim.updates.map((u) => u.id);
      expect(targetIds).toContain("ebcbfbba-1b35-46a7-b007-d6dc8c4a6250");
      expect(targetIds).toContain("a8b93e43-fbfa-42be-931a-b9c7b6949456");
    });
  });
});
