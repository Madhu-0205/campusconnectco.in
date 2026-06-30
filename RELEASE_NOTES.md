# CampusConnect Release Notes - v1.2.0

CampusConnect version `1.2.0` introduces enterprise-grade observability, health indicators, feature flags toggling, extended security audit logging, and upload constraint checks.

---

## 🌟 Key Updates

### 📊 1. Enterprise Observability & Tracing
Every request processed by Next.js now receives a unique Request ID and Correlation ID injected by the middleware. The new structured logger in [logger.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/lib/logger.ts) outputs logs in JSON formats, enabling integration with Sentry, Grafana, Datadog, or AWS CloudWatch.

### 🛡 2. Server-side File Upload Defense
To protect the server from memory bloat and Denial of Service (DoS) attacks, the resume parsing API enforces a strict **5MB size cap** and verifies PDF, DOCX, and TXT MIME formats before loading the files.

### 🚩 3. Real-time Feature Flags
A dynamic feature flag checker was created to let administrators enable or disable core application modules (e.g. AI Copilot, Payments, Mock Interviews) without requiring a server redeployment.

### 🏥 4. Subsystem Probes
Liveness (`/api/live`) and readiness (`/api/ready`) endpoints have been added to facilitate container orchestrations (Kubernetes/Vercel) and verify DB/Redis reachabilities.
