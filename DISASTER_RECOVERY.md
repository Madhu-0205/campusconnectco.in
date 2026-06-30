# CampusConnect Disaster Recovery Plan

This document establishes the recovery objectives, strategies, and procedures for critical outage scenarios.

---

## 🏁 Operational Metrics
* **Recovery Time Objective (RTO):** `< 30 Minutes` (Max target time to restore services after a major outage).
* **Recovery Point Objective (RPO):** `< 24 Hours` (Maximum acceptable data loss window).

---

## 🌪 Outage Scenarios & Mitigation

### 1. Database Outage (Supabase)
* **Strategy:** Supabase runs automated daily backups with PITR (Point-in-Time Recovery) enabled.
* **Action:**
  1. Redirect traffic to a read-only landing page.
  2. Initiate restore from the last clean PITR snapshot on the Supabase Dashboard.
  3. Validate database integrity using Prisma health check: `GET /api/ready`.

### 2. Payment Gateway Failure (Razorpay)
* **Strategy:** Graceful degradation. If checkout operations fail or gateway is unreachable:
  1. Transaction records remain safely locked in `PENDING` states.
  2. The webhook handler retries payment reconciliation once gateway access is restored.

### 3. AI Service Outage (Groq / OpenAI)
* **Strategy:** Automated fallback layers.
  * Embeddings generation falls back to our local unit-normalized vector generation logic, keeping core searching algorithms operational without throwing runtime exceptions.
