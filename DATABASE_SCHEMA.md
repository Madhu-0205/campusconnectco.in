# CampusConnect Database Schema

CampusConnect utilizes a PostgreSQL database managed via **Prisma ORM**.

---

## 📊 Core Models & Relations

### 1. User
- Stores credentials, profiles, college settings, and roles.
- **Enums:** `Role` (`STUDENT`, `FOUNDER`, `STARTUP`, `CLIENT`).
- **Relations:** One-to-many with `Gig`, `Application`, `Project`, and `Review`.

### 2. Gig
- Represents a job posting in the marketplace.
- **Fields:** `id`, `title`, `description`, `budget`, `status` (`active`, `completed`), `posted_by`.
- **Relations:** Linked to the poster (`User`) and applicants (`Application`).

### 3. Application
- Handles student applications to gigs.
- **Fields:** `id`, `status` (`PENDING`, `ACCEPTED`, `REJECTED`), `coverLetter`, `bidAmount`.

### 4. Escrow & Transaction
- Secure locked funds logs.
- **Fields:** `id`, `amount`, `status` (`LOCKED`, `RELEASED`, `REFUNDED`), `releaseAt`.

### 5. Analytics
- Generic audit log table.
- **Fields:** `id`, `event` (prefixed with `SEC:` for audit trails), `data` (JSON), `createdAt`.

---

## ⚡ Indexing & Performance
High-frequency queries are optimized using composite indexes:
- `@@index([userId])` in `Analytics` for fast audit checks.
- `@@index([status])` on `Gig` and `Internship` for browsing feeds.
- Indexes on foreign keys to eliminate full table scans.
