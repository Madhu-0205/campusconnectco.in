# CampusConnect Admin & Operations Guide

This guide details administrative functions, feature flags control, moderation, and user management.

---

## 🔐 Administrative Access
1. Users must have the `FOUNDER` role in the database (`User` model) to access the administrative dashboard.
2. The administrative URL routes are structured under:
   - `/dashboard/founder` (Overview & Volume Stats)
   - `/dashboard/founder/settings` (Feature Flags & Configurations)
   - `/dashboard/founder/users` (Account Moderation)
   - `/dashboard/founder/reports` (Disputes & Escrows Audit Trail)

---

## 🚩 Dynamic Feature Flags
CampusConnect implements real-time feature flags stored in the `PlatformSetting` model. These flags can be toggled without redeploying code.

### Managing Flags via API
Toggle features using `/api/admin/feature-flags` (Founder credentials required):

#### List all flags
- **Endpoint:** `GET /api/admin/feature-flags`
- **Output:**
  ```json
  {
    "success": true,
    "flags": [
      { "key": "ai_copilot", "value": true, "updatedAt": "2026-06-25T12:00:00Z" }
    ]
  }
  ```

#### Toggle a flag
- **Endpoint:** `POST /api/admin/feature-flags`
- **Payload:**
  ```json
  {
    "key": "ai_copilot",
    "value": false
  }
  ```

---

## 🔎 Moderation & Disputes
- **Dispute Resolution:** In the `/dashboard/founder/reports` panel, administrators can audit transactional disputes. Selecting "Refund Buyer" or "Release to Seller" triggers internal database calls to release funds from escrow.
- **Audit Trails:** Raw security events can be monitored by query-logging or fetching `GET /api/admin/audit-logs`.
