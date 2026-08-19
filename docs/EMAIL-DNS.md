# CampusConnect Email DNS Requirements

To ensure reliable transactional email delivery (authentication, password resets, application updates), CampusConnect requires DNS verification. The underlying infrastructure (e.g. Resend/SendGrid/Google Workspace) relies on these records to prevent your emails from hitting spam folders.

## 1. SPF (Sender Policy Framework)
Authorizes your email provider to send on behalf of `campusconnectco.in`.
- **Type**: TXT
- **Name**: `@` or `campusconnectco.in`
- **Value**: Obtain the exact string from your email provider dashboard (e.g. `v=spf1 include:_spf.google.com ~all`).

## 2. DKIM (DomainKeys Identified Mail)
Cryptographically signs outbound emails.
- **Type**: TXT or CNAME (depends on provider)
- **Name**: `<selector>._domainkey` (Your provider will assign the `<selector>`)
- **Value**: Obtain the exact key/value from your provider dashboard.

## 3. DMARC (Domain-based Message Authentication, Reporting, and Conformance)
Instructs receiving mail servers what to do if SPF or DKIM fail.
- **Type**: TXT
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=quarantine; rua=mailto:dmarc-reports@campusconnectco.in;`

**Recommended DMARC Progression:**
1. Start with `p=none` for the first 30 days. Monitor the DMARC reports.
2. Upgrade to `p=quarantine` to send spoofed emails to spam.
3. Eventually upgrade to `p=reject` to completely drop unauthenticated emails.

## Verification
You can manually verify propagation using the `dig` command in your terminal:
```bash
dig TXT campusconnectco.in
dig TXT _dmarc.campusconnectco.in
dig TXT <selector>._domainkey.campusconnectco.in
```
