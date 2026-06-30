# Changelog

All notable changes to the CampusConnect project will be documented in this file.

---

## [1.2.0] - 2026-06-25
### Added
- Created a custom root-layout Next.js error boundary at [global-error.tsx](file:///Users/madhu/Downloads/campusconnectco.in-main/src/app/global-error.tsx) to capture layout crashes.
- Implemented structured logging with request and correlation IDs support in [logger.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/lib/logger.ts).
- Added readiness check `/api/ready` and liveness check `/api/live` endpoints.
- Implemented dynamic feature flagging framework [featureFlags.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/lib/featureFlags.ts) with cache fallbacks.
- Created admin audit logs trail endpoint `/api/admin/audit-logs`.

### Changed
- Refactored [middleware.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/middleware.ts) to generate and forward Request IDs (`x-request-id`) and Correlation IDs (`x-correlation-id`).
- Upgraded file parsing checks in [parse-file/route.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/app/api/ai/parse-file/route.ts) with a strict server-side **5MB size cap** and MIME validations.
- Extended the security auditor [audit.ts](file:///Users/madhu/Downloads/campusconnectco.in-main/src/lib/security/audit.ts) to track signups, gig creations, applications, and payouts.

### Fixed
- Fixed strict TypeScript type mismatches on Prisma mock objects in the test suite files.
