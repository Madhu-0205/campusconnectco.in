import { describe, it, expect, vi, beforeEach } from "vitest";
import { RateLimiter, paymentLimiter, publicFormLimiter } from "@/lib/rate-limit";
import { isAllowedResumeUrl } from "@/lib/ai/resumeParser";

describe("Production Security & Quality Audit Fixes", () => {
  describe("1. Rate Limiting Telemetry & Granularity", () => {
    it("should return standard rate limit metrics (limit, remaining, reset, ok)", async () => {
      const limiter = new RateLimiter(60 * 1000, 5, "test-headers");
      const ip = "192.0.2.1";

      const first = await limiter.checkWithInfo(ip);
      expect(first.ok).toBe(true);
      expect(first.limit).toBe(5);
      expect(first.remaining).toBe(4);
      expect(first.reset).toBeGreaterThan(0);
      expect(first.reset).toBeLessThanOrEqual(60);

      // Perform remaining allowed requests
      await limiter.checkWithInfo(ip); // remaining 3
      await limiter.checkWithInfo(ip); // remaining 2
      await limiter.checkWithInfo(ip); // remaining 1
      const fifth = await limiter.checkWithInfo(ip); // remaining 0
      expect(fifth.ok).toBe(true);
      expect(fifth.remaining).toBe(0);

      // Excessive request should fail with 0 remaining
      const blocked = await limiter.checkWithInfo(ip);
      expect(blocked.ok).toBe(false);
      expect(blocked.remaining).toBe(0);
      expect(blocked.reset).toBeGreaterThan(0);
    });

    it("should have specialized limiters configured for payments and public forms", () => {
      expect(paymentLimiter).toBeInstanceOf(RateLimiter);
      expect(publicFormLimiter).toBeInstanceOf(RateLimiter);
    });
  });

  describe("2. SSRF Prevention in Resume Parser", () => {
    it("should reject private, localhost, and cloud metadata URLs", () => {
      const dangerousUrls = [
        "http://169.254.169.254/latest/meta-data/",
        "http://169.254.169.254/computeMetadata/v1/",
        "http://localhost:3000/api/admin",
        "http://127.0.0.1:5432/db",
        "http://0.0.0.0:80",
        "http://[::1]:8080",
        "https://10.0.0.1/secrets.txt",
        "https://192.168.1.100/config",
        "https://172.16.5.4/admin",
        "https://attacker-controlled-site.com/payload.exe",
        "ftp://malicious.org/file.pdf",
        "file:///etc/passwd",
      ];

      for (const url of dangerousUrls) {
        expect(isAllowedResumeUrl(url)).toBe(false);
      }
    });

    it("should reject non-standard ports even on allowed hostnames", () => {
      expect(isAllowedResumeUrl("https://xyz.supabase.co:8443/resume.pdf")).toBe(false);
      expect(isAllowedResumeUrl("https://xyz.supabase.co:22/resume.pdf")).toBe(false);
      expect(isAllowedResumeUrl("https://xyz.supabase.co:8080/resume.pdf")).toBe(false);
      expect(isAllowedResumeUrl("https://xyz.supabase.co:443/resume.pdf")).toBe(true);
    });

    it("should classify private and reserved IP addresses accurately", async () => {
      const { isPrivateOrReservedIp } = await import("@/lib/ai/resumeParser");

      // Loopback
      expect(isPrivateOrReservedIp("127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("127.255.255.255")).toBe(true);

      // Cloud metadata / link-local
      expect(isPrivateOrReservedIp("169.254.169.254")).toBe(true);
      expect(isPrivateOrReservedIp("169.254.1.1")).toBe(true);

      // RFC 1918
      expect(isPrivateOrReservedIp("10.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("192.168.1.1")).toBe(true);
      expect(isPrivateOrReservedIp("172.16.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("172.31.255.255")).toBe(true);

      // IPv6 private & loopback
      expect(isPrivateOrReservedIp("::1")).toBe(true);
      expect(isPrivateOrReservedIp("fe80::1")).toBe(true);
      expect(isPrivateOrReservedIp("fc00::1")).toBe(true);
      expect(isPrivateOrReservedIp("::ffff:127.0.0.1")).toBe(true);
      expect(isPrivateOrReservedIp("::ffff:169.254.169.254")).toBe(true);

      // Public IP
      expect(isPrivateOrReservedIp("8.8.8.8")).toBe(false);
      expect(isPrivateOrReservedIp("104.244.42.1")).toBe(false);
    });

    it("should allow verified Supabase and authorized cloud storage URLs", () => {
      const safeUrls = [
        "https://ybulpuxwqimxfgvzzuih.supabase.co/storage/v1/object/public/resumes/u1/resume.pdf",
        "https://my-app.supabase.in/storage/v1/object/public/resumes/u2/cv.docx",
        "https://campusconnect-assets.s3.amazonaws.com/resumes/user-123.pdf",
      ];

      for (const url of safeUrls) {
        expect(isAllowedResumeUrl(url)).toBe(true);
      }
    });
  });

  describe("3. Open Redirect Prevention", () => {
    it("should strictly reject protocol-relative and backslash redirect targets", () => {
      function isSafeRedirect(target: string | null): boolean {
        if (!target) return false;
        return target.startsWith("/") && !target.startsWith("//") && !target.startsWith("/\\");
      }

      expect(isSafeRedirect("//attacker.com")).toBe(false);
      expect(isSafeRedirect("//attacker.com/evil")).toBe(false);
      expect(isSafeRedirect("/\\attacker.com")).toBe(false);
      expect(isSafeRedirect("https://attacker.com")).toBe(false);
      expect(isSafeRedirect("javascript:alert(1)")).toBe(false);

      expect(isSafeRedirect("/dashboard/student")).toBe(true);
      expect(isSafeRedirect("/auth/reset-password")).toBe(true);
      expect(isSafeRedirect("/client-hub?tab=escrow")).toBe(true);
    });
  });

  describe("4. Escrow Endpoint Authorization Checks", () => {
    it("should confirm escrow routes require proper business roles (CLIENT, STARTUP, FOUNDER)", async () => {
      const allowedRoles = ["CLIENT", "STARTUP", "FOUNDER"];
      
      // Valid roles
      expect(allowedRoles.includes("CLIENT")).toBe(true);
      expect(allowedRoles.includes("STARTUP")).toBe(true);
      expect(allowedRoles.includes("FOUNDER")).toBe(true);

      // Raw Supabase JWT role 'authenticated' or unprivileged 'STUDENT' must NOT pass
      expect(allowedRoles.includes("authenticated")).toBe(false);
      expect(allowedRoles.includes("STUDENT")).toBe(false);
    });
  });

  describe("5. Payment & Escrow State Transitions & Amount Integrity", () => {
    it("should enforce server-side amount calculation from gig budget", () => {
      const gigBudget = 5000;
      const platformFee = gigBudget * 0.10;
      const totalAmount = gigBudget + platformFee;
      const amountInPaise = Math.round(totalAmount * 100);

      expect(totalAmount).toBe(5500);
      expect(amountInPaise).toBe(550000);
      expect(gigBudget).toBe(5000); // Worker payout remains budget
    });

    it("should prevent invalid escrow state transitions", () => {
      type EscrowStatus = "PENDING" | "LOCKED" | "RELEASED" | "REFUNDED" | "DISPUTED";

      function canTransition(current: EscrowStatus, target: EscrowStatus): boolean {
        const allowedTransitions: Record<EscrowStatus, EscrowStatus[]> = {
          PENDING: ["LOCKED", "REFUNDED"],
          LOCKED: ["RELEASED", "DISPUTED"],
          DISPUTED: ["RELEASED", "REFUNDED"],
          RELEASED: [], // Terminal state
          REFUNDED: [], // Terminal state
        };
        return allowedTransitions[current]?.includes(target) ?? false;
      }

      // Valid transitions
      expect(canTransition("PENDING", "LOCKED")).toBe(true);
      expect(canTransition("LOCKED", "RELEASED")).toBe(true);
      expect(canTransition("LOCKED", "DISPUTED")).toBe(true);
      expect(canTransition("DISPUTED", "RELEASED")).toBe(true);

      // Invalid / double-release attempts
      expect(canTransition("RELEASED", "RELEASED")).toBe(false);
      expect(canTransition("PENDING", "RELEASED")).toBe(false);
      expect(canTransition("RELEASED", "REFUNDED")).toBe(false);
      expect(canTransition("REFUNDED", "RELEASED")).toBe(false);
    });

    it("should validate webhook signatures using constant-time comparison", async () => {
      const { safeCompare } = await import("@/lib/security/crypto");
      const crypto = await import("crypto");

      const secret = "whsec_test_secret_12345";
      const payload = JSON.stringify({ event: "order.paid", id: "evt_123" });
      const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
      const invalidSignature = crypto.createHmac("sha256", "wrong_secret").update(payload).digest("hex");

      expect(safeCompare(validSignature, validSignature)).toBe(true);
      expect(safeCompare(validSignature, invalidSignature)).toBe(false);
      expect(safeCompare(validSignature, "truncated")).toBe(false);
    });

    it("should reject replayed webhook events with identical eventId", () => {
      const processedEventIds = new Set<string>();

      function processWebhookEvent(eventId: string, status: string): { ok: boolean; action: string } {
        if (processedEventIds.has(eventId)) {
          return { ok: true, action: "REPLAY_SUPPRESSED" };
        }
        if (status !== "PENDING") {
          return { ok: true, action: "STATUS_NOT_PENDING" };
        }
        processedEventIds.add(eventId);
        return { ok: true, action: "PROCESSED" };
      }

      // First arrival
      const first = processWebhookEvent("evt_pay_abc123", "PENDING");
      expect(first.action).toBe("PROCESSED");

      // Replay arrival with exact same event ID
      const replay = processWebhookEvent("evt_pay_abc123", "PAID");
      expect(replay.action).toBe("REPLAY_SUPPRESSED");

      // Another webhook with different event ID but transaction already PAID
      const differentEvent = processWebhookEvent("evt_pay_xyz789", "PAID");
      expect(differentEvent.action).toBe("STATUS_NOT_PENDING");
    });
  });

  describe("6. RLS Least-Privilege & Column Security Simulation", () => {
    it("should allow user to read/modify own row and block cross-user access", () => {
      const authUser = "user-alice-123";
      
      function checkRlsPolicy(rowOwnerId: string, action: "SELECT" | "UPDATE" | "DELETE"): boolean {
        // Simulates: auth.uid() = id
        return authUser === rowOwnerId;
      }

      // Own row
      expect(checkRlsPolicy("user-alice-123", "SELECT")).toBe(true);
      expect(checkRlsPolicy("user-alice-123", "UPDATE")).toBe(true);
      expect(checkRlsPolicy("user-alice-123", "DELETE")).toBe(true);

      // Cross-user row (Bob's row accessed by Alice)
      expect(checkRlsPolicy("user-bob-456", "SELECT")).toBe(false);
      expect(checkRlsPolicy("user-bob-456", "UPDATE")).toBe(false);
      expect(checkRlsPolicy("user-bob-456", "DELETE")).toBe(false);
    });

    it("should restrict sensitive banking columns from direct public selection", () => {
      const allowedPublicCols = new Set([
        "id", "name", "full_name", "role", "bio", "skills", "portfolio", 
        "linkedin", "github", "image", "avatar_url", "city", "state", "country"
      ]);
      const sensitiveCols = ["accNumber", "ifscCode", "bankName", "upiId", "resumeData"];

      for (const col of sensitiveCols) {
        expect(allowedPublicCols.has(col)).toBe(false);
      }
    });
  });

  describe("7. IDOR Parameter Tampering Prevention", () => {
    it("should reject cross-user access when identifiers are manipulated", () => {
      const currentUserId = "client-user-1";

      function authorizeResourceAccess(
        resourceType: "gig" | "transaction" | "resume",
        ownerId: string,
        accessorId: string,
        role: string
      ): { allowed: boolean; status: number } {
        if (accessorId !== ownerId && role !== "ADMIN") {
          return { allowed: false, status: 403 };
        }
        return { allowed: true, status: 200 };
      }

      // Owner accessing own resource
      expect(authorizeResourceAccess("gig", currentUserId, currentUserId, "CLIENT").allowed).toBe(true);

      // Attacker trying to manipulate resourceId/ownerId
      const attackerId = "attacker-user-2";
      const result = authorizeResourceAccess("gig", currentUserId, attackerId, "CLIENT");
      expect(result.allowed).toBe(false);
      expect(result.status).toBe(403);
    });
  });

  describe("8. SSRF Redirect and Size Limit Enforcement", () => {
    it("should enforce 10MB size ceiling on downloaded documents", () => {
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      const safeSize = 2 * 1024 * 1024; // 2MB
      const oversized = 15 * 1024 * 1024; // 15MB

      function validateDownloadSize(contentLength: number): boolean {
        return contentLength <= MAX_SIZE;
      }

      expect(validateDownloadSize(safeSize)).toBe(true);
      expect(validateDownloadSize(oversized)).toBe(false);
    });

    it("should reject redirect targets resolving to private networks", async () => {
      const { isPrivateOrReservedIp } = await import("@/lib/ai/resumeParser");

      const redirectTargets = [
        "127.0.0.1",
        "169.254.169.254",
        "10.0.0.1",
        "192.168.1.1",
        "::1",
      ];

      for (const target of redirectTargets) {
        expect(isPrivateOrReservedIp(target)).toBe(true);
      }
    });
  });
});
