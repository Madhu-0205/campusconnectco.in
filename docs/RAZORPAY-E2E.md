# Razorpay Webhook E2E Verification

Validating the payment state machine requires confirming that the production environment can successfully receive, cryptographically verify, and process webhooks from Razorpay.

## E2E Procedure (Test Mode)

1. **Enable Test Mode**: Log into the Razorpay Dashboard. Toggle the environment to **Test Mode**.
2. **Configure Webhook**: Ensure the Webhook URL is set to `https://www.campusconnectco.in/api/payments/escrow/release` (or the relevant webhook route) with the correct `RAZORPAY_WEBHOOK_SECRET`.
3. **Initiate Payment**: Through the CampusConnect UI, create a ₹1 (test card) escrow payment.
4. **Complete Payment**: Enter the test card details and simulate a successful payment.
5. **Dashboard Verification**: 
   - Observe the `payment.captured` event firing in the Razorpay Webhooks tab.
   - Verify the delivery status shows `HTTP 200`.
6. **CampusConnect Verification**:
   - Verify the Database state transition (e.g. Escrow marked as `FUNDED` or `RELEASED`).
   - Re-send the *exact same webhook* from the Razorpay dashboard. Verify that CampusConnect returns an `HTTP 200` but gracefully skips processing due to idempotency checks (no duplicate funds released).
   
> [!CAUTION]
> If the webhook returns a 401/400 during testing, the HMAC signature validation is failing. Verify `RAZORPAY_WEBHOOK_SECRET` strictly matches between Vercel and the Razorpay Dashboard.
