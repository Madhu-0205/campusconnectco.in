# Razorpay Integration & E2E Webhook Architecture

CampusConnect handles payments via Razorpay. The system strictly isolates payment verification from business logic using Webhooks and HMAC signatures.

## Architecture & State Transitions

1. **Order Creation (`/api/checkout/create-order`)**
   - Creates a transaction in the database with status `PENDING`.
   - Calls Razorpay API to generate an `order_id`.
   - Responds to the client to initialize the Razorpay checkout overlay.

2. **Webhook Reception (`/api/checkout/webhook`)**
   - Receives `order.paid` or `payment.captured` events.
   - **Signature Verification:** Validates `x-razorpay-signature` using HMAC SHA256 and `RAZORPAY_WEBHOOK_SECRET`.
   - **Idempotency & Concurrency Guard:** Uses `prisma.transaction.updateMany` targeting `status: PENDING`. If the row was already updated to `PAID` by a concurrent webhook or retry, `updateResult.count` will be 0, effectively preventing duplicate processing.
   - **State Transition:** 
     - Transaction `status` -> `PAID`.
     - Creates `Escrow` record with status `LOCKED`.
     - Updates `Gig` status to `IN_PROGRESS`.
     - Logs the transition to `TransactionAudit`.

## Testing the Webhook Locally

Without external Dashboard access, you can securely verify webhook logic in a local or mock environment.

### 1. Configure Secrets
Ensure you have the following in your `.env.local`:
```env
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
RAZORPAY_WEBHOOK_SECRET="your_secure_local_secret"
```

### 2. Triggering Webhooks Locally
If you are developing locally and want to test the full E2E flow without exposing your local server to the internet, use the Razorpay CLI or Stripe CLI (equivalent) or ngrok.

```bash
ngrok http 3000
# Update Razorpay Webhook settings to point to https://<ngrok_url>/api/checkout/webhook
```

### 3. Automated Test Verification
Run the regression suite to verify webhook signature validation:
```bash
npm run test -- src/__tests__/webhook.test.ts
npm run test -- src/__tests__/checkout-payouts.test.ts
```

## Security Posture
- **Never trust client-side success:** The system ignores frontend success callbacks for state changes. It relies strictly on the cryptographically signed webhook.
- **Replay Attacks:** Addressed by the idempotent `status: PENDING` guard in Prisma. Even if an attacker replays the exact payload and signature, the state transition will be rejected.
- **Data Scrubbing:** Logging strips sensitive PCI/payment instrument details. Only standard order entities and hashes are logged.
