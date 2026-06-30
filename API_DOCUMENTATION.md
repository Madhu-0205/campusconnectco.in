# CampusConnect API Documentation

All API requests expect and return JSON payloads. Authentication is handled via session headers or JWT validation in middleware.

---

## 🟢 Public & Integration Endpoints

### Liveness Probe
- **URL:** `GET /api/live`
- **Response:** `200 OK`
  ```json
  { "status": "live", "timestamp": "2026-06-25T12:00:00.000Z" }
  ```

### Readiness Probe
- **URL:** `GET /api/ready`
- **Response:** `200 OK`
  ```json
  {
    "status": "ready",
    "timestamp": "2026-06-25T12:00:00.000Z",
    "checks": { "database": "connected", "redis": "connected" }
  }
  ```

---

## 🔒 Protected Core Endpoints

### Create Gig Checkout Order
- **URL:** `POST /api/checkout/create-order`
- **Role:** `CLIENT` / `FOUNDER`
- **Payload:**
  ```json
  { "gigId": "gig-uuid", "applicationId": "app-uuid" }
  ```
- **Response:** `200 OK`
  ```json
  { "id": "order_id", "amount": 50000, "currency": "INR" }
  ```

### Parse Resume File
- **URL:** `POST /api/ai/parse-file`
- **Role:** `STUDENT` / `FOUNDER`
- **Payload:** `FormData` containing a `file` field (PDF, DOCX, or TXT; max 5MB).
- **Response:** `200 OK`
  ```json
  { "success": true, "text": "Extracted resume content...", "charCount": 1450 }
  ```

---

## 👑 Admin Endpoints (Founder Only)

### Retrieve Audit Logs
- **URL:** `GET /api/admin/audit-logs`
- **Response:** `200 OK`
  ```json
  {
    "success": true,
    "logs": [
      {
        "id": "log-uuid",
        "event": "SEC:AUTH_LOGIN_FAILED",
        "data": { "userId": "user-uuid", "ipAddress": "127.0.0.1" },
        "createdAt": "2026-06-25T12:00:00Z"
      }
    ]
  }
  ```
