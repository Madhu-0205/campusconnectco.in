# CampusConnect Security Guide

This document outlines the security architecture, compliance standards, and policies implemented to secure the CampusConnect marketplace.

---

## 🔒 1. Content Security Policy (CSP) & Nonces
- Enforced dynamically in [middleware.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/middleware.ts).
- Every HTML document delivery generates a secure cryptographic nonce injected into both the script context and CSP headers (`script-src 'self' 'nonce-...'`).
- External script executions are strictly forbidden unless explicitly whitelisted (e.g., Google Analytics, Razorpay checkout scripts).

---

## 🛡 2. Network & Transport Security Headers
The platform automatically sends the following headers on all responses:
- `Strict-Transport-Security` (HSTS): 2 years age, forcing HTTPS connections.
- `X-Frame-Options: DENY`: Blocks clickjacking and framing attacks.
- `X-Content-Type-Options: nosniff`: Prevents MIME-sniffing exploits.
- `Referrer-Policy: strict-origin-when-cross-origin`: Controls referrer data leakage.

---

## 📊 3. Row-Level Security (RLS) & DB Security
- Supabase PostgreSQL database tables have RLS enabled.
- Data access policies are documented in [supabase_rls_policies.sql](file:///Users/madhu/Downloads/campusconnectco.in-main/prisma/supabase_rls_policies.sql).
- Parameterized database operations prevent SQL Injection vectors.

---

## 🛑 4. Rate Limiting & Abuse Defense
- Rate limits are applied globally to protect API and login endpoints (via Redis-backed Token Buckets in [rate-limit.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/lib/rate-limit.ts)).
- File uploads are validated server-side for size limits (5MB for resumes, 2MB for images) and MIME/extensions checks.
