import crypto from "crypto";

import { describe, it, expect } from "vitest";

// Extract signature check logic for testing
function verifySignature(bodyText: string, signature: string, secret: string): boolean {
  if (!signature || !secret) return false;
  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(bodyText);
  const digest = shasum.digest("hex");
  return digest === signature;
}

describe("Razorpay Webhook Signature Verification", () => {
  const secret = "test_webhook_secret_key_123";
  const payload = JSON.stringify({
    event: "order.paid",
    payload: {
      payment: {
        entity: {
          id: "pay_12345",
          amount: 50000,
          order_id: "order_67890",
        },
      },
    },
  });

  it("should verify correct signature successfully", () => {
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(payload);
    const validSignature = shasum.digest("hex");

    const isValid = verifySignature(payload, validSignature, secret);
    expect(isValid).toBe(true);
  });

  it("should fail validation with invalid signature", () => {
    const invalidSignature = "wrong_signature_hash";
    const isValid = verifySignature(payload, invalidSignature, secret);
    expect(isValid).toBe(false);
  });

  it("should reject verification when secret or signature is missing", () => {
    expect(verifySignature(payload, "", secret)).toBe(false);
    expect(verifySignature(payload, "sig", "")).toBe(false);
  });
});
