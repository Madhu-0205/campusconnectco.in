import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  fetchMohanCareersItems,
  extractApplicationUrl,
  extractCompanyAndRole,
  extractExplicitDeadline,
  determineWorkModeAndLocation,
  decodeHtmlEntities,
  processPostsToRawItems
} from "@/lib/automation/sources/mohan-careers";
import { getSourceConfig, APPROVED_SOURCES } from "@/lib/automation/sources/registry";
import { classifyOpportunity } from "@/lib/automation/classifier";
import { evaluateAuthenticity } from "@/lib/automation/authenticity";
import { evaluateQuality, isAutoPublishEnabled, determineOpportunityRouting } from "@/lib/automation/quality";
import { SourceConfig } from "@/lib/automation/types";

describe("Phase 16D: Mohan Careers (mohancareers.com) Opportunity Source Integration", () => {
  const mockConfig: SourceConfig = {
    source: "mohan_careers",
    sourceName: "Mohan Careers",
    category: "CAREERS",
    discoveryMethod: "structured_api",
    defaultTrust: "UNKNOWN",
    scheduleHours: 6,
    scheduleMinutes: 360,
    endpointUrl: "https://mohancareers.com/wp-json/wp/v2/posts",
    enabled: true,
    maxItemsPerRun: 15,
    applicationUrlPolicy: "DIRECT",
    attributionRequired: true,
    attributionName: "Mohan Careers",
    policy: {
      directApplicationRequired: false,
      requiresFreshnessEvidence: true,
      maxStalenessMinutes: 1440,
      allowedOpportunityTypes: ["JOB", "INTERNSHIP", "APPRENTICESHIP"]
    }
  };

  // Realistic fixture based on actual mohancareers.com posts
  const sampleJioPost = {
    id: 5078,
    date: "2026-09-18T05:15:13",
    slug: "jio-mass-hiring-for-freshers-womens-2026",
    link: "https://mohancareers.com/jio-mass-hiring-for-freshers-womens-2026/",
    title: { rendered: "Jio mass hiring for freshers/women&#8217;s 2026" },
    content: {
      rendered: `
        <p>Jio is actively looking for committed individuals to become part of their team as Customer support.</p>
        <p>COMPANY : Jio limited is a global information technology, consulting, and business process services company headquartered in Delhi, India.</p>
        <p>JOB ROLE : BPM/ABPM</p>
        <p>More Details &amp; Apply Link : <a href="https://careers.jio.com/frmfuncwisejob.aspx?func=KXDwg1INMo8%3d&amp;desc=test" target="_blank" rel="noopener">click here</a></p>
      `
    },
    categories: [1, 3]
  };

  const sampleDeloittePost = {
    id: 5076,
    date: "2026-09-17T20:50:21",
    slug: "deloitte-recruitment-2026-latest-deloitte-hiring-freshers",
    link: "https://mohancareers.com/deloitte-recruitment-2026-latest-deloitte-hiring-freshers/",
    title: { rendered: "Deloitte Recruitment 2026 | Analyst – Site Reliability Engineering | Apply Now" },
    content: {
      rendered: `
        <h3>Deloitte Recruitment 2026: Analyst – Site Reliability Engineering</h3>
        <p>Deloitte is hiring for the position of Analyst – Site Reliability Engineering in Bengaluru.</p>
        <p>Apply Link🔗: <a href="https://southasiacareers.deloitte.com/job/Bengaluru-Analyst-Site-Reliability/58895344/" target="_blank" rel="noopener">Click Here</a></p>
      `
    },
    categories: [3]
  };

  const sampleRemotePost = {
    id: 5073,
    date: "2026-09-17T13:12:32",
    slug: "teleperformance-recruitment-2026-wfh",
    link: "https://mohancareers.com/teleperformance-recruitment-2026-wfh/",
    title: { rendered: "Teleperformance Recruitment 2026 | Customer Support | Remote Job" },
    content: {
      rendered: `
        <p>Teleperformance offers work from home opportunities in India.</p>
        <p>Apply link🔗: <a href="https://www.naukri.com/job-listings-customer-support-executive-work-from-home-tp-chennai" target="_blank">Click Here</a></p>
      `
    },
    categories: [4] // Category 4 = Work From Home Jobs
  };

  const sampleInternshipPost = {
    id: 5024,
    date: "2026-09-10T10:00:00",
    slug: "amazon-internship-2026",
    link: "https://mohancareers.com/amazon-internship-2026/",
    title: { rendered: "Amazon Recruitment 2026 | Software Engineering Intern | Apply Now" },
    content: {
      rendered: `
        <p>Amazon is hiring interns for Summer 2026.</p>
        <p>Application Deadline: 30 October 2026</p>
        <p>Apply Link: <a href="https://www.amazon.jobs/en/jobs/3134242/intern" target="_blank">Click Here</a></p>
      `
    },
    categories: [3]
  };

  // ==========================================================================
  // 1. Source Registry & Configuration
  // ==========================================================================
  describe("1. Source Registry Configuration", () => {
    it("registers mohan_careers in APPROVED_SOURCES", () => {
      const config = getSourceConfig("mohan_careers");
      expect(config).toBeDefined();
      expect(config?.source).toBe("mohan_careers");
      expect(config?.sourceName).toBe("Mohan Careers");
      expect(config?.category).toBe("CAREERS");
      expect(config?.discoveryMethod).toBe("structured_api");
      expect(config?.enabled).toBe(true);
      expect(config?.attributionRequired).toBe(true);
    });

    it("enforces initial source trust as strictly UNKNOWN", () => {
      const config = getSourceConfig("mohan_careers");
      expect(config?.defaultTrust).toBe("UNKNOWN");
      // Must not be auto-promoted to trusted
      expect(config?.defaultTrust).not.toBe("OFFICIAL");
      expect(config?.defaultTrust).not.toBe("TRUSTED");
    });
  });

  // ==========================================================================
  // 2. Field Extraction & Normalization
  // ==========================================================================
  describe("2. Field Extraction & Normalization", () => {
    it("extracts direct employer application links from HTML content", () => {
      const urlJio = extractApplicationUrl(sampleJioPost.content.rendered);
      expect(urlJio).toBe("https://careers.jio.com/frmfuncwisejob.aspx?func=KXDwg1INMo8%3d&desc=test");

      const urlDeloitte = extractApplicationUrl(sampleDeloittePost.content.rendered);
      expect(urlDeloitte).toBe("https://southasiacareers.deloitte.com/job/Bengaluru-Analyst-Site-Reliability/58895344/");
    });

    it("filters out social media and internal links", () => {
      const htmlWithSpamAndSocial = `
        <p>Join our Telegram: <a href="https://t.me/mohancareers_updates">Join Telegram</a></p>
        <p>Join WhatsApp: <a href="https://whatsapp.com/channel/xyz">Join WhatsApp</a></p>
        <p>Check other jobs: <a href="https://mohancareers.com/other-job/">Other Job</a></p>
        <p>Google Ad: <a href="https://google.com/adclick">Ad</a></p>
        <p>Apply Link: <a href="https://job-boards.greenhouse.io/freshprints/jobs/12345">Click Here</a></p>
      `;
      const url = extractApplicationUrl(htmlWithSpamAndSocial);
      expect(url).toBe("https://job-boards.greenhouse.io/freshprints/jobs/12345");
    });

    it("returns null when no valid external application link is present", () => {
      const htmlNoApplyLink = `
        <p>This is an informational article about exam preparation tips.</p>
        <p>Join our Telegram: <a href="https://t.me/updates">Join</a></p>
        <p>Visit homepage: <a href="https://mohancareers.com/">Home</a></p>
      `;
      const url = extractApplicationUrl(htmlNoApplyLink);
      expect(url).toBeNull();
    });

    it("extracts clean company and role from post titles", () => {
      const jio = extractCompanyAndRole(sampleJioPost.title.rendered, sampleJioPost.content.rendered);
      expect(jio.company).toBe("Jio");
      expect(jio.role).toBe("BPM/ABPM");

      const deloitte = extractCompanyAndRole(sampleDeloittePost.title.rendered, sampleDeloittePost.content.rendered);
      expect(deloitte.company).toBe("Deloitte");
      expect(deloitte.role).toBe("Analyst – Site Reliability Engineering");
    });

    it("decodes HTML entities properly", () => {
      const decoded = decodeHtmlEntities("Women&#8217;s &amp; Men&#8217;s Careers &quot;2026&quot;");
      expect(decoded).toBe('Women\'s & Men\'s Careers "2026"');
    });

    it("extracts explicit deadlines without confusing post publication date", () => {
      // Post without explicit deadline: must be null
      const deadlineNone = extractExplicitDeadline(sampleJioPost.content.rendered);
      expect(deadlineNone).toBeNull();

      // Post with explicit deadline in text
      const deadlineExplicit = extractExplicitDeadline(sampleInternshipPost.content.rendered);
      expect(deadlineExplicit).not.toBeNull();
      expect(deadlineExplicit?.getFullYear()).toBe(2026);
      expect(deadlineExplicit?.getMonth()).toBe(9); // October = index 9
    });

    it("determines work mode and location accurately", () => {
      const remote = determineWorkModeAndLocation(sampleRemotePost.categories, sampleRemotePost.title.rendered, sampleRemotePost.content.rendered);
      expect(remote.workMode).toBe("remote");
      expect(remote.location).toBe("Remote (India)");

      const onsite = determineWorkModeAndLocation(sampleDeloittePost.categories, sampleDeloittePost.title.rendered, sampleDeloittePost.content.rendered);
      expect(onsite.workMode).toBe("on-site");
      expect(onsite.location).toBe("Bengaluru, India");
    });

    it("preserves provenance: source URL and externalId", () => {
      const items = processPostsToRawItems([sampleDeloittePost], mockConfig, 10);
      expect(items.length).toBe(1);
      expect(items[0].source).toBe("mohan_careers");
      expect(items[0].sourceName).toBe("Mohan Careers");
      expect(items[0].sourceUrl).toBe("https://mohancareers.com/deloitte-recruitment-2026-latest-deloitte-hiring-freshers/");
      expect(items[0].externalId).toBe("5076");
      expect(items[0].applicationUrl).toBe("https://southasiacareers.deloitte.com/job/Bengaluru-Analyst-Site-Reliability/58895344/");
    });

    it("ignores posts without application links to prevent non-actionable blog staging", () => {
      const postWithoutLink = {
        id: 9999,
        date: "2026-09-18T00:00:00",
        title: { rendered: "How to prepare for IT interviews in 2026" },
        content: { rendered: "<p>Read books and practice DSA.</p>" },
        link: "https://mohancareers.com/interview-prep/"
      };
      const items = processPostsToRawItems([postWithoutLink], mockConfig, 10);
      expect(items.length).toBe(0);
    });
  });

  // ==========================================================================
  // 3. Security, SSRF & Scam Protections
  // ==========================================================================
  describe("3. Security, SSRF & Scam Protections", () => {
    it("rejects loopback and private IP application URLs (SSRF protection)", () => {
      const ssrfHtml = `<p>Apply here: <a href="http://127.0.0.1:8080/apply">Click Here</a></p>`;
      expect(extractApplicationUrl(ssrfHtml)).toBeNull();

      const awsMetaHtml = `<p>Apply here: <a href="http://169.254.169.254/latest/meta-data/">Click Here</a></p>`;
      expect(extractApplicationUrl(awsMetaHtml)).toBeNull();

      const localhostHtml = `<p>Apply here: <a href="http://localhost:3000/internal">Click Here</a></p>`;
      expect(extractApplicationUrl(localhostHtml)).toBeNull();
    });

    it("rejects non-http/https schemes (javascript:, file:, data:)", () => {
      const jsHtml = `<p><a href="javascript:alert(1)">Click Here</a></p>`;
      expect(extractApplicationUrl(jsHtml)).toBeNull();

      const fileHtml = `<p><a href="file:///etc/passwd">Click Here</a></p>`;
      expect(extractApplicationUrl(fileHtml)).toBeNull();
    });

    it("detects scam/fraud terms and assigns high spam risk in evaluateQuality", () => {
      const auth = evaluateAuthenticity(
        "Fake Company",
        "https://legit-job.com/apply",
        "https://mohancareers.com/fake-job",
        "Mohan Careers"
      );

      const scamQuality = evaluateQuality(
        {
          title: "Make 5000 Daily Data Entry Guaranteed Income",
          description: "Pay 500 registration fee and security deposit. WhatsApp only contact.",
          applicationUrl: "https://legit-job.com/apply",
          company: "Fake Company",
          location: "Remote"
        },
        auth,
        {
          sourceTrust: "UNKNOWN"
        }
      );

      expect(scamQuality.spamRiskScore).toBeGreaterThanOrEqual(70);
      expect(scamQuality.riskFlags).toContain("REGISTRATION_FEE");
      expect(scamQuality.riskFlags).toContain("SECURITY_DEPOSIT");
      expect(scamQuality.riskFlags).toContain("WHATSAPP_ONLY");
      expect(scamQuality.riskFlags).toContain("GUARANTEED_INCOME");
      expect(scamQuality.isEligibleForAutoPublish).toBe(false);
    });
  });

  // ==========================================================================
  // 4. Classification & Authenticity
  // ==========================================================================
  describe("4. Classification & Authenticity", () => {
    it("classifies standard recruitment posts as JOB", () => {
      const classification = classifyOpportunity({
        title: "Deloitte - Analyst – Site Reliability Engineering",
        description: "Deloitte is hiring early-career candidates for Site Reliability Engineering.",
        applicationUrl: "https://southasiacareers.deloitte.com/job/123",
        sourceCategory: "CAREERS"
      });
      expect(classification.opportunityType).toBe("JOB");
    });

    it("classifies internship posts as INTERNSHIP", () => {
      const classification = classifyOpportunity({
        title: "Amazon - Software Engineering Intern",
        description: "Student internship opportunity at Amazon for summer 2026.",
        applicationUrl: "https://www.amazon.jobs/en/jobs/3134242",
        sourceCategory: "CAREERS"
      });
      expect(classification.opportunityType).toBe("INTERNSHIP");
    });

    it("evaluates authenticity accurately distinguishing official employer domains", () => {
      const authenticity = evaluateAuthenticity(
        "Deloitte",
        "https://southasiacareers.deloitte.com/job/123",
        "https://mohancareers.com/deloitte-job",
        "Mohan Careers"
      );
      // Because applicationUrl is on deloitte.com, it detects official organization association
      expect(authenticity.verificationState).toBe("OFFICIAL_SOURCE_CONFIRMED");
      expect(authenticity.isOfficialAssociation).toBe(true);

      // But for an aggregator or unknown domain without exact company match
      const unverifiedAuth = evaluateAuthenticity(
        "Unknown Startup",
        "https://some-random-domain.xyz/apply",
        "https://mohancareers.com/startup-job",
        "Mohan Careers"
      );
      expect(unverifiedAuth.verificationState).toBe("UNVERIFIED");
      expect(unverifiedAuth.isOfficialAssociation).toBe(false);
    });

    it("routes all Mohan Careers opportunities to NEEDS_REVIEW", () => {
      const auth = evaluateAuthenticity(
        "Deloitte",
        "https://southasiacareers.deloitte.com/job/123",
        "https://mohancareers.com/deloitte-job",
        "Mohan Careers"
      );

      const quality = evaluateQuality(
        {
          title: "Deloitte Recruitment 2026",
          description: "Analyst role at Deloitte.",
          applicationUrl: "https://southasiacareers.deloitte.com/job/123",
          company: "Deloitte",
          location: "Bengaluru, India"
        },
        auth,
        {
          sourceTrust: "UNKNOWN"
        }
      );

      const routingStatus = determineOpportunityRouting(quality, auth);

      // Must strictly route to NEEDS_REVIEW (never auto-approve or auto-publish)
      expect(routingStatus).toBe("NEEDS_REVIEW");
    });

    it("confirms OPPORTUNITY_AUTOPUBLISH_ENABLED is strictly disabled", () => {
      expect(isAutoPublishEnabled()).toBe(false);
    });
  });

  // ==========================================================================
  // 5. API Collector & Network Edge Cases
  // ==========================================================================
  describe("5. API Collector & Network Edge Cases", () => {
    it("handles mock posts array directly without network call", async () => {
      const items = await fetchMohanCareersItems(mockConfig, {
        mockPosts: [sampleJioPost, sampleDeloittePost, sampleRemotePost]
      });

      expect(items.length).toBe(3);
      expect(items[0].company).toBe("Jio");
      expect(items[1].company).toBe("Deloitte");
      expect(items[2].company).toBe("Teleperformance");
    });

    it("handles empty API response without throwing", async () => {
      const items = await fetchMohanCareersItems(mockConfig, {
        mockPosts: []
      });
      expect(items).toEqual([]);
    });

    it("handles malformed items gracefully", async () => {
      const malformedPosts = [
        null,
        undefined,
        {},
        { id: 123 }, // missing title and content
        sampleDeloittePost
      ];

      const items = await fetchMohanCareersItems(mockConfig, {
        mockPosts: malformedPosts
      });

      // Only the valid post should be extracted
      expect(items.length).toBe(1);
      expect(items[0].company).toBe("Deloitte");
    });

    it("handles API HTTP 500 error gracefully by throwing descriptive error", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error"
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(fetchMohanCareersItems(mockConfig)).rejects.toThrow("HTTP 500: Internal Server Error");

      vi.unstubAllGlobals();
    });

    it("handles API HTTP 403 Forbidden error gracefully", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: "Forbidden"
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(fetchMohanCareersItems(mockConfig)).rejects.toThrow("HTTP 403: Forbidden");

      vi.unstubAllGlobals();
    });

    it("handles API timeout via AbortController", async () => {
      const mockFetch = vi.fn().mockImplementation(() => {
        const error = new Error("The operation was aborted");
        error.name = "AbortError";
        return Promise.reject(error);
      });
      vi.stubGlobal("fetch", mockFetch);

      await expect(fetchMohanCareersItems(mockConfig, { timeoutMs: 50 })).rejects.toThrow(
        "Mohan Careers API request timed out"
      );

      vi.unstubAllGlobals();
    });
  });
});
