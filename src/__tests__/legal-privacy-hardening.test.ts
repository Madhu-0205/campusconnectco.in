import fs from "fs";
import path from "path";

import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST as profilePostHandler } from "../app/api/user/profile/route";
import { POST as unsubscribeHandler } from "../app/api/user/unsubscribe/route";
import { sendMarketingEmail, sendTransactionalEmail } from "../lib/email/resend";
import { createUnsubscribeToken, isUnsubscribeSecretValid, verifyUnsubscribeToken } from "../lib/email/tokens";
import { assertPaymentsEnabled, PAYMENTS_ENABLED } from "../lib/payments/config";
import { sanitizeSentryBreadcrumb, sanitizeSentryEvent, scrubUrlString } from "../lib/telemetry/sentry-privacy";
import { proxy as middleware } from "../middleware";

// Mock dependencies
vi.mock("../lib/supabase/middleware", () => ({
  updateSession: vi.fn().mockImplementation((request) => {
    const { NextResponse } = require("next/server");
    const res = NextResponse.next({
      request: { headers: request.headers },
    });
    res.headers.set("x-nonce", request.headers.get("x-nonce") || "");
    return Promise.resolve(res);
  }),
}));

vi.mock("../lib/rate-limit", () => ({
  generalApiLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true, limit: 100, remaining: 99, reset: 60 }) },
  paymentLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
  authLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
  aiLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
  resumeParseLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
  searchLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
  uploadLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
  publicFormLimiter: { checkWithInfo: vi.fn().mockResolvedValue({ ok: true }) },
}));

vi.mock("../lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: "11111111-1111-1111-1111-111111111111",
            email: "test@example.com",
            user_metadata: { full_name: "Test User" },
          },
        },
        error: null,
      }),
    },
  }),
}));

vi.mock("../lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn().mockResolvedValue({
        id: "11111111-1111-1111-1111-111111111111",
        email: "test@example.com",
        name: "Test User",
        role: "STUDENT",
      }),
      update: vi.fn().mockResolvedValue({
        id: "11111111-1111-1111-1111-111111111111",
        marketingConsent: false,
      }),
    },
  },
}));

describe("Legal & Privacy Hardening Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.UNSUBSCRIBE_TOKEN_SECRET = "secure-test-unsubscribe-secret-32-chars-long!";
    process.env.COMPANY_PHYSICAL_POSTAL_ADDRESS = "123 Campus Way, Tech City, IN 560001";
  });

  describe("1. Third-Party Font Privacy & CSP", () => {
    it("strictly excludes fonts.googleapis.com and fonts.gstatic.com from CSP", async () => {
      const req = new NextRequest("http://localhost/dashboard/student", { method: "GET" });
      const response = await middleware(req);
      const csp = response.headers.get("Content-Security-Policy") || "";

      expect(csp).not.toContain("fonts.googleapis.com");
      expect(csp).not.toContain("fonts.gstatic.com");
      expect(csp).toContain("font-src 'self' data:");
      expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    });

    it("verifies zero Google Fonts imports or external font URLs exist in layout.tsx", () => {
      const layoutContent = fs.readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf-8");
      expect(layoutContent).not.toContain("next/font/google");
      expect(layoutContent).not.toContain("fonts.googleapis.com");
      expect(layoutContent).not.toContain("fonts.gstatic.com");
    });

    it("verifies safe system-font fallback variables configured in globals.css", () => {
      const cssContent = fs.readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf-8");
      expect(cssContent).not.toContain("fonts.googleapis.com");
      expect(cssContent).not.toContain("fonts.gstatic.com");
      expect(cssContent).toContain("-apple-system");
      expect(cssContent).toContain("BlinkMacSystemFont");
      expect(cssContent).toContain("ui-monospace");
    });
  });

  describe("2. Age-Assurance Server-Side Controls", () => {
    it("rejects new user registration if age eligibility attestation is missing", async () => {
      const prisma = (await import("../lib/prisma")).default;
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const req = new NextRequest("http://localhost/api/user/profile", {
        method: "POST",
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          email: "test@example.com",
          acceptedTerms: true,
          birthYear: "2000",
          ageEligibilityAttested: false, // missing affirmation
        }),
      });

      const res = await profilePostHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Age eligibility self-attestation is required");
    });

    it("rejects new user registration if birth year indicates user is under 13", async () => {
      const prisma = (await import("../lib/prisma")).default;
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const under13Year = (new Date().getFullYear() - 10).toString(); // 10 years old
      const req = new NextRequest("http://localhost/api/user/profile", {
        method: "POST",
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          email: "test@example.com",
          acceptedTerms: true,
          birthYear: under13Year,
          ageEligibilityAttested: true,
        }),
      });

      const res = await profilePostHandler(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toContain("Platform requires minimum age of 13");
    });

    it("accepts new user registration if birth year meets the minimum age requirement", async () => {
      const prisma = (await import("../lib/prisma")).default;
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const adultYear = (new Date().getFullYear() - 20).toString(); // 20 years old
      const req = new NextRequest("http://localhost/api/user/profile", {
        method: "POST",
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          email: "test@example.com",
          acceptedTerms: true,
          birthYear: adultYear,
          ageEligibilityAttested: true,
        }),
      });

      const res = await profilePostHandler(req);
      expect(res.status).toBe(201);
    });

    it("does not block existing users from profile updates", async () => {
      const prisma = (await import("../lib/prisma")).default;
      (prisma.user.findUnique as any).mockResolvedValue({
        id: "11111111-1111-1111-1111-111111111111",
        email: "test@example.com",
      });

      const req = new NextRequest("http://localhost/api/user/profile", {
        method: "POST",
        body: JSON.stringify({
          id: "11111111-1111-1111-1111-111111111111",
          email: "test@example.com",
          acceptedTerms: true,
          name: "Updated Name",
        }),
      });

      const res = await profilePostHandler(req);
      expect(res.status).toBe(201);
    });
  });

  describe("3. Email Compliance & Unsubscribe Security", () => {
    it("generates a valid tamper-resistant token and verifies it", () => {
      const userId = "user-12345";
      const token = createUnsubscribeToken(userId);
      const verification = verifyUnsubscribeToken(token);

      expect(verification.valid).toBe(true);
      expect(verification.userId).toBe(userId);
    });

    it("rejects a tampered unsubscribe token", () => {
      const token = createUnsubscribeToken("user-12345");
      const tampered = token.slice(0, -4) + "XXXX";
      const verification = verifyUnsubscribeToken(tampered);

      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("Invalid token signature");
    });

    it("rejects an expired unsubscribe token", () => {
      // Create token with negative expiration hours
      const token = createUnsubscribeToken("user-12345", -1);
      const verification = verifyUnsubscribeToken(token);

      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("expired");
    });

    it("fails closed when UNSUBSCRIBE_TOKEN_SECRET is missing", () => {
      delete process.env.UNSUBSCRIBE_TOKEN_SECRET;
      delete process.env.UNSUBSCRIBE_SIGNING_SECRET;

      expect(isUnsubscribeSecretValid().valid).toBe(false);
      expect(() => createUnsubscribeToken("user-123")).toThrow("UNSUBSCRIBE_TOKEN_SECRET is missing");
      const verification = verifyUnsubscribeToken("some.token");
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("missing");
    });

    it("fails closed when UNSUBSCRIBE_TOKEN_SECRET is weak (<32 chars)", () => {
      process.env.UNSUBSCRIBE_TOKEN_SECRET = "short-secret";

      expect(isUnsubscribeSecretValid().valid).toBe(false);
      expect(() => createUnsubscribeToken("user-123")).toThrow("at least 32 characters");
      const verification = verifyUnsubscribeToken("some.token");
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("at least 32 characters");
    });

    it("fails closed when UNSUBSCRIBE_TOKEN_SECRET is a placeholder", () => {
      process.env.UNSUBSCRIBE_TOKEN_SECRET = "placeholder-secret-that-is-32-characters-long!";

      expect(isUnsubscribeSecretValid().valid).toBe(false);
      expect(() => createUnsubscribeToken("user-123")).toThrow("cannot be a placeholder");
      const verification = verifyUnsubscribeToken("some.token");
      expect(verification.valid).toBe(false);
      expect(verification.error).toContain("cannot be a placeholder");
    });

    it("blocks commercial email delivery (fails closed) if UNSUBSCRIBE_TOKEN_SECRET is missing", async () => {
      delete process.env.UNSUBSCRIBE_TOKEN_SECRET;
      delete process.env.UNSUBSCRIBE_SIGNING_SECRET;

      const sent = await sendMarketingEmail({
        to: "recipient@example.com",
        subject: "Product Digest",
        react: { type: "div", props: {}, key: null },
      });

      expect(sent).toBe(false);
    });

    it("blocks commercial email delivery (fails closed) if physical postal address is missing", async () => {
      delete process.env.COMPANY_PHYSICAL_POSTAL_ADDRESS;

      const sent = await sendMarketingEmail({
        to: "recipient@example.com",
        subject: "Product Digest",
        react: { type: "div", props: {}, key: null },
      });

      expect(sent).toBe(false);
    });

    it("allows transactional email even if marketing postal address or unsubscribe secret is absent", async () => {
      delete process.env.UNSUBSCRIBE_TOKEN_SECRET;
      delete process.env.COMPANY_PHYSICAL_POSTAL_ADDRESS;

      const sent = await sendTransactionalEmail({
        to: "recipient@example.com",
        subject: "Verify Your Account",
        react: { type: "div", props: {}, key: null },
      });

      expect(sent).toBe(true);
    });

    it("provides anti-enumeration response on unsubscribe endpoint even if user does not exist", async () => {
      const prisma = (await import("../lib/prisma")).default;
      (prisma.user.update as any).mockRejectedValue(new Error("Record to update not found."));

      const token = createUnsubscribeToken("nonexistent-user");
      const req = new NextRequest("http://localhost/api/user/unsubscribe", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      const res = await unsubscribeHandler(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
      expect(data.message).toContain("Marketing email preferences have been successfully updated");
    });
  });

  describe("4. Subscription & Payment Freeze", () => {
    it("confirms payments remain strictly disabled (HTTP 503)", () => {
      const { errorResponse } = assertPaymentsEnabled();
      expect(PAYMENTS_ENABLED).toBe(false);
      expect(errorResponse).toBeDefined();
      expect(errorResponse?.status).toBe(503);
    });
  });

  describe("5. Sentry Telemetry Privacy & Sensitive-Data Redaction Pipeline", () => {
    const TEST_SECRET_SENTINEL = "sentinel_secret_987654321";
    const TEST_TOKEN_SENTINEL = "sentinel_token_abcdef123456";
    const TEST_PASSWORD_SENTINEL = "sentinel_password_P@ssw0rd!";
    const TEST_EMAIL_SENTINEL = "sentinel_user@testdomain.com";

    it("redacts sensitive query parameters from URLs", () => {
      const rawUrl = `https://www.campusconnectco.in/auth/callback?token=${TEST_TOKEN_SENTINEL}&email=${TEST_EMAIL_SENTINEL}&password=${TEST_PASSWORD_SENTINEL}&secret=${TEST_SECRET_SENTINEL}&normalParam=safe123`;
      const scrubbed = scrubUrlString(rawUrl);

      expect(scrubbed).not.toContain(TEST_TOKEN_SENTINEL);
      expect(scrubbed).not.toContain(TEST_EMAIL_SENTINEL);
      expect(scrubbed).not.toContain(TEST_PASSWORD_SENTINEL);
      expect(scrubbed).not.toContain(TEST_SECRET_SENTINEL);
      expect(scrubbed).toContain("token=%5BREDACTED%5D");
      expect(scrubbed).toContain("normalParam=safe123");
    });

    it("strips authorization headers, cookies, and bearer tokens from request", () => {
      const event = {
        request: {
          url: "https://www.campusconnectco.in/api/user/profile",
          headers: {
            "authorization": `Bearer ${TEST_TOKEN_SENTINEL}`,
            "cookie": `sb-auth-token=${TEST_SECRET_SENTINEL}`,
            "set-cookie": `session=${TEST_SECRET_SENTINEL}`,
            "x-supabase-auth": TEST_TOKEN_SENTINEL,
            "x-api-key": TEST_SECRET_SENTINEL,
            "content-type": "application/json",
            "accept": "application/json",
          },
        },
      };

      const sanitized = sanitizeSentryEvent(event);

      expect(sanitized.request.headers.authorization).toBeUndefined();
      expect(sanitized.request.headers.cookie).toBeUndefined();
      expect(sanitized.request.headers["set-cookie"]).toBeUndefined();
      expect(sanitized.request.headers["x-supabase-auth"]).toBeUndefined();
      expect(sanitized.request.headers["x-api-key"]).toBeUndefined();
      expect(sanitized.request.headers["content-type"]).toBe("application/json");
      expect(sanitized.request.headers["accept"]).toBe("application/json");
    });

    it("recursively scrubs sensitive keys in object request bodies", () => {
      const event = {
        request: {
          data: {
            name: "Safe Name",
            password: TEST_PASSWORD_SENTINEL,
            nested: {
              token: TEST_TOKEN_SENTINEL,
              financial: {
                upiId: TEST_SECRET_SENTINEL,
                accNumber: "1234567890",
              },
            },
          },
        },
      };

      const sanitized = sanitizeSentryEvent(event);

      expect(sanitized.request.data.password).toBe("[REDACTED]");
      expect(sanitized.request.data.nested.token).toBe("[REDACTED]");
      expect(sanitized.request.data.nested.financial.upiId).toBe("[REDACTED]");
      expect(sanitized.request.data.nested.financial.accNumber).toBe("[REDACTED]");
      expect(sanitized.request.data.name).toBe("Safe Name");
    });

    it("recursively scrubs serialized JSON string request bodies", () => {
      const rawBody = JSON.stringify({
        username: "testuser",
        password: TEST_PASSWORD_SENTINEL,
        secret: TEST_SECRET_SENTINEL,
      });

      const event = {
        request: {
          data: rawBody,
        },
      };

      const sanitized = sanitizeSentryEvent(event);
      const parsedBody = JSON.parse(sanitized.request.data);

      expect(parsedBody.password).toBe("[REDACTED]");
      expect(parsedBody.secret).toBe("[REDACTED]");
      expect(parsedBody.username).toBe("testuser");
    });

    it("scrubs extra metadata and contexts attached to error events", () => {
      const event = {
        extra: {
          userEmail: TEST_EMAIL_SENTINEL,
          clientSecret: TEST_SECRET_SENTINEL,
          safeExtra: "normal_info",
        },
        contexts: {
          customAuth: {
            token: TEST_TOKEN_SENTINEL,
            status: "active",
          },
        },
      };

      const sanitized = sanitizeSentryEvent(event);

      expect(sanitized.extra.clientSecret).toBe("[REDACTED]");
      expect(sanitized.extra.safeExtra).toBe("normal_info");
      expect(sanitized.contexts.customAuth.token).toBe("[REDACTED]");
      expect(sanitized.contexts.customAuth.status).toBe("active");
    });

    it("drops ui.input breadcrumbs and sanitizes network breadcrumb URLs", () => {
      const inputBreadcrumb = {
        category: "ui.input",
        message: "User typed into password field",
      };
      expect(sanitizeSentryBreadcrumb(inputBreadcrumb)).toBeNull();

      const networkBreadcrumb = {
        category: "xhr",
        data: {
          url: `/api/auth?token=${TEST_TOKEN_SENTINEL}&secret=${TEST_SECRET_SENTINEL}`,
        },
      };
      const sanitizedBreadcrumb = sanitizeSentryBreadcrumb(networkBreadcrumb);
      expect(sanitizedBreadcrumb).not.toBeNull();
      expect(sanitizedBreadcrumb.data.url).not.toContain(TEST_TOKEN_SENTINEL);
      expect(sanitizedBreadcrumb.data.url).not.toContain(TEST_SECRET_SENTINEL);
    });

    it("guarantees zero sentinel leakage across the entire serialized Sentry event payload", () => {
      const comprehensiveEvent = {
        message: "Unhandled test error",
        request: {
          url: `https://www.campusconnectco.in/api/v1/checkout?token=${TEST_TOKEN_SENTINEL}&email=${TEST_EMAIL_SENTINEL}`,
          headers: {
            authorization: `Bearer ${TEST_TOKEN_SENTINEL}`,
            cookie: `auth_jwt=${TEST_SECRET_SENTINEL}`,
            "x-supabase-auth": TEST_TOKEN_SENTINEL,
          },
          data: {
            credentials: {
              password: TEST_PASSWORD_SENTINEL,
              secretKey: TEST_SECRET_SENTINEL,
            },
          },
        },
        extra: {
          lastToken: TEST_TOKEN_SENTINEL,
        },
        breadcrumbs: [
          {
            category: "ui.input",
            message: TEST_PASSWORD_SENTINEL,
          },
          {
            category: "fetch",
            data: {
              url: `https://api.external.com/pay?key=${TEST_SECRET_SENTINEL}`,
            },
          },
        ],
      };

      const sanitized = sanitizeSentryEvent(comprehensiveEvent);
      const serialized = JSON.stringify(sanitized);

      expect(serialized).not.toContain(TEST_SECRET_SENTINEL);
      expect(serialized).not.toContain(TEST_TOKEN_SENTINEL);
      expect(serialized).not.toContain(TEST_PASSWORD_SENTINEL);
      expect(serialized).not.toContain(TEST_EMAIL_SENTINEL);
    });
  });
});
