# AUDIT CHECKPOINT 11 — PAYMENTS + ESCROW + FINANCIAL SECURITY

## Executive Summary
This audit evaluated the CampusConnect financial ecosystem, encompassing checkout, payments, escrow, refunds, disputes, transaction history, and founder metrics. The platform utilizes Razorpay as its primary payment provider, with webhooks and a local testing bypass mechanism.

Overall, the financial architecture exhibits **strong baseline security**: amount tampering is prevented by deriving amounts from trusted server records (Gig budgets), webhooks have robust replay protection via atomic `updateMany` constraints, and refunds/disputes are properly scoped to the involved parties.

However, **CRITICAL vulnerabilities** exist in Founder financial dashboards (Cross-Founder Data Exposure / IDOR) and race conditions during Escrow Release (Double Release Attack). The system also lacks idempotency on escrow releases, potentially allowing gamers to inflate their earnings metrics.

## Complete Payment Inventory

| Route / Component | Purpose | Provider | Auth | Authorization | DB Models | Webhook | Implemented? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/api/checkout/create-order` | Initiate gig checkout | Razorpay | Yes | Gig Owner | `Transaction` | N/A | Yes |
| `/api/payments/escrow/create-order` | Alternative checkout | Razorpay | Yes | Client/Founder | `Transaction`, `Escrow` | N/A | Yes |
| `/api/checkout/webhook` | Process payment | Razorpay | No* | Signature check | `Transaction`, `Escrow` | Yes | Yes |
| `/api/payments/escrow/release` | Release escrow funds | N/A | Yes | Gig Owner | `Escrow`, `Gamification` | N/A | Yes |
| `/api/checkout/refund` | Refund transaction | Razorpay | Yes | Buyer / Admin | `Transaction`, `Escrow` | N/A | Yes |
| `/api/checkout/dispute` | Dispute transaction | N/A | Yes | Buyer / Seller| `Dispute`, `Transaction` | N/A | Yes |
| `/api/cron/release-payments` | Auto-release payouts | RazorpayX | Yes | Cron Secret | `Transaction` | N/A | Yes |
| `/api/founder/escrow` | View escrow stats | N/A | Yes | FOUNDER Role | `Escrow` | N/A | Yes |
| `/api/founder/volume` | View volume stats | N/A | Yes | FOUNDER Role | `Transaction` | N/A | Yes |
| `/api/founder/audit` | View audit logs | N/A | Yes | FOUNDER Role | `TransactionAudit` | N/A | Yes |

## Payment Providers
**Razorpay** is the active provider.
- SDK: `razorpay` Node SDK.
- Secret Handling: Keys pulled from `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.
- Webhooks: Uses `RAZORPAY_WEBHOOK_SECRET` with HMAC SHA-256 signature verification.
- Testing: Bypasses to a simulated local mock mode if keys are missing or set to `rzp_test_placeholder`.
Stripe, UPI (direct), and DodoPayments (found in schema defaults) are inactive or not fully implemented.

## Checkout Flow
1. Client selects Gig and Assigned Worker.
2. Server verifies ownership and derives budget from `Gig` model.
3. Server generates Razorpay Order (or mock order).
4. `Transaction` and `Escrow` (in some routes) are created as `PENDING`.
5. Client completes Razorpay flow.
6. Razorpay Webhook triggers `order.paid` or `payment.captured`.
7. Webhook verifies signature, uses atomic lock to update `Transaction` to `PAID`, creates/updates `Escrow` to `LOCKED`.
8. Escrow release moves money to Worker via Cron or manual release.

## Amount Tampering
**VERIFIED**: The server derives the payment amount strictly from `gig.budget`. It computes the 10% platform fee server-side. The client cannot supply a custom amount or price payload to tamper with the transaction.

## Currency
**VERIFIED**: Currency is hardcoded to `"INR"` across all provider requests and database creations. 

## Escrow
Prisma models involve `Escrow` and `Transaction`. 
Lifecycle: `PENDING` -> `LOCKED` -> `RELEASED` / `REFUNDED`.
A race condition exists on the `RELEASED` transition. 

## Escrow Authorization
**VERIFIED**: The `/api/payments/escrow/release` route successfully scopes to `clientId: user.id`. Users cannot release escrow funds for gigs they do not own.

## Escrow IDOR
**VERIFIED**: Escrow retrieval and updates generally enforce `clientId: user.id` or `workerId: user.id`. However, see "Founder Financial Dashboard" for a critical read IDOR.

## Refunds
**VERIFIED**: 
- Scoped to `buyerId`.
- Updates `Transaction` and `Escrow` states atomically.
- Cannot refund twice due to status gate `status === PAID || IN_PROGRESS || DISPUTED`.
- Refunds the exact provider transaction.

## Disputes
**VERIFIED**:
- Properly scopes to `buyerId` or `sellerId`.
- Prevents duplicate disputes via unique constraints.
- Correctly freezes gig and updates statuses.

## Webhook Security
**VERIFIED**: Signatures are verified using crypto HMAC SHA-256. If in production, missing signatures correctly throw `401 Unauthorized`.

## Webhook Replay Protection
**VERIFIED**: Webhook handlers are idempotent and protect against replays via an atomic `updateMany` constraint:
`where: { id: transaction.id, status: TransactionStatus.PENDING }`
If a webhook fires twice simultaneously, the second will fail the count check and abort gracefully.

## Payment State Machine
Database statuses align fairly well, but there is some divergence: `gig.status` vs `transaction.status` vs `escrow.status`. In refunds, `Gig` goes to `OPEN` while `Escrow` goes to `REFUNDED`. 

## Database Transactions
**VERIFIED**: Most complex financial operations use `prisma.$transaction`. However, see "Concurrency" below.

## Concurrency
**CRITICAL**: `api/payments/escrow/release` uses `findFirst` to verify the escrow is `LOCKED`, and then uses an independent `prisma.$transaction` to apply the `RELEASED` state without an atomic `status: "LOCKED"` condition. If two requests hit simultaneously, it could result in double-awarding of `userGamification.totalEarned`.

## Payment Identity
**VERIFIED**: Transactions tightly couple `buyerId`, `sellerId`, and `gigId`. 

## Client Trust
**SAFE**: Checkout logic does not trust client-supplied amounts. All derivations occur on the server.

## Payment UI
**MOCKED / STATIC**: The actual payout to the worker via Razorpay is heavily mocked/commented out in the direct release API, though the cron job implements `razorpay.payouts`. 

## Transaction History
Transaction history APIs for founders are completely unscoped (see below).

## Founder Financial Dashboard
**CRITICAL — CROSS-FOUNDER DATA LEAK**: 
Routes `/api/founder/escrow`, `/api/founder/volume`, and `/api/founder/audit` check that the user has the `FOUNDER` role, but **fail to scope the queries to the specific founder's ID**. 
Any founder can see every transaction, every escrow, total platform volume, and the audit logs of every user on the platform.

## Student Financial Dashboard
Not deeply implemented beyond basic transaction history (which is generally scoped).

## Admin Financial Access
Admin roles are not distinctly separated from Founders in the volume/escrow endpoints, leading to the IDOR mentioned above.

## API Authorization Matrix
| Operation | Student | Founder | College | Admin |
| --- | --- | --- | --- | --- |
| Checkout | Yes | Yes | No | Yes |
| Release escrow | No | Yes (if owner) | No | No |
| Refund | No | Yes (if owner) | No | Yes |
| Dispute | Yes (if worker) | Yes (if owner) | No | Yes |
| View Volume/Audit| No | **Yes (ALL DATA)**| No | Yes |

## Payment Secrets
**VERIFIED**: API keys and webhook secrets are correctly loaded from environment variables and never logged or exposed.

## Logging
Logs only output `transaction.id`, `gigId`, and safe statuses. Sensitive PII/card details are entirely handled by Razorpay and do not touch the server.

## Rate Limiting
**UNVERIFIED / NOT IMPLEMENTED**: There are no explicit rate limits on checkout or refund endpoints, leaving them open to spam (though financial cost mitigates checkout spam).

## Error Handling
Standard error handling is utilized. Does not leak stack traces.

## Account Deletion + Payments
**VERIFIED**: The `Transaction` and `Escrow` models do **NOT** have `onDelete: Cascade` for the `client`/`buyer` relations. This physically prevents a user from deleting their account if they have active financial records (Prisma will throw a foreign key constraint violation). This is technically a safeguard against orphaned escrows.

## Database Constraints
`Transaction` has `@unique` on `paymentId` and `paymentIntentId`. 
Relations enforce referential integrity.

## Webhook → Database Consistency
Consistency is maintained via Prisma transactions.

## Test Coverage
**UNVERIFIED**: No automated test suites for financial endpoints were observed in this audit slice.

---

## CRITICAL Findings
- **Severity**: CRITICAL
- **Route/API**: `/api/founder/escrow`, `/api/founder/volume`, `/api/founder/audit`
- **Exact issue**: Complete lack of data isolation. The `findMany` and `aggregate` queries have no `where` clauses filtering by `buyerId` or `organizationId`.
- **User impact**: Any founder can view the financial details, volume, and escrows of every other founder and transaction on the platform.
- **Financial impact**: Exposes internal platform revenue and competitor metrics.
- **Security impact**: Massive IDOR / Data leak.
- **Recommended direction**: Add `where: { clientId: user.id }` (or similar relation) to every query in these files.

- **Severity**: HIGH
- **Route/API**: `/api/payments/escrow/release`
- **Exact issue**: Race condition in escrow release gamification updates.
- **User impact**: A student could double their reported earnings by spamming the release endpoint (if they control the client account).
- **Security impact**: Race condition (Double execution).
- **Recommended direction**: Add `where: { id: escrow.id, status: "LOCKED" }` inside the `tx.escrow.update` and throw if no rows are updated.

## HIGH Findings
- **Severity**: HIGH
- **Route/API**: `/api/cron/release-payments`
- **Exact issue**: Cron relies on hardcoded Payout Account number (`account_number: "23456789012"`). If this account goes empty or fails, payouts crash. Furthermore, it assumes `TransactionStatus.COMPLETED` means ready to payout, but `release/route.ts` already marks it `COMPLETED` and assumes manual payout in some cases.
- **Recommended direction**: Standardize the payout execution flow. 

## MEDIUM Findings
- **Severity**: MEDIUM
- **Route/API**: `/api/checkout/refund`
- **Exact issue**: No rate limiting or delay limits on refunds. 

## LOW Findings
- **Severity**: LOW
- **Route/API**: User Deletion
- **Exact issue**: A user with any past transaction cannot delete their account due to Prisma foreign key constraints.

## MOCKED / STATIC
- **Real Payouts via API**: The `/api/payments/escrow/release` endpoint manually notes: `// For development/MVP without KYC constraints, we mark the DB state as RELEASED.` and comments out actual Razorpay transfers.
- **Test Mode Bypass**: `rzp_test_placeholder` safely bypasses to a simulated environment.

## NOT IMPLEMENTED
- Automated resolution of Disputes (all dispute resolutions require manual database intervention currently).

## VERIFIED
- Amount Tampering Prevention.
- Webhook Signature Validation.
- Webhook Replay Protection.

## UNVERIFIED
- Real-world RazorpayX Payout behavior (Cron job).

---

## Top 20 Required Fixes
1. FIX: Scope `/api/founder/escrow` to `clientId: user.id`.
2. FIX: Scope `/api/founder/volume` to transactions involving the specific founder.
3. FIX: Scope `/api/founder/audit` to transactions owned by the specific founder.
4. FIX: Add atomic `status: "LOCKED"` condition to the `update` query in `/api/payments/escrow/release`.
5. FIX: Use Prisma atomic `increment` for `totalEarned` and `gigsCompleted` in Gamification instead of read-then-write.
6. FIX: Address account deletion 500 errors by either archiving users or anonymizing financial records.
7. FIX: Abstract the RazorpayX `account_number` into an environment variable in the cron job.
8. FIX: Implement actual Razorpay Route transfers in `/api/payments/escrow/release` rather than just updating DB state (when out of MVP).
9. FIX: Unify `api/checkout/create-order` and `api/payments/escrow/create-order` to prevent split-brain checkout logic.
10. FIX: Ensure gig statuses map perfectly 1:1 with transaction states (e.g., handling `REFUNDED` properly in Gig model).
11. FIX: Implement rate limiting on checkout endpoints to prevent order-creation spam.
12. FIX: Implement rate limiting on dispute endpoints.
13. FIX: Create an Admin UI/API for resolving disputes (currently manual DB update required).
14. FIX: Ensure all Cron payload variables (like Razorpay auth) gracefully fail instead of crashing.
15. FIX: Ensure `gig.status` handles multiple applications/transactions gracefully if one is refunded.
16. FIX: Standardize `platformFee` calculation logic in a single utility function rather than hardcoding `* 0.10` in multiple routes.
17. FIX: Prevent Refund initiation if a Dispute is actively `OPEN`.
18. FIX: Check for sufficient RazorpayX balance before attempting automated payouts.
19. FIX: Emit real-time WebSocket notifications upon Escrow release, not just Gamification updates.
20. FIX: Ensure `RAZORPAY_WEBHOOK_SECRET` is strongly validated at boot to prevent misconfiguration in production.
