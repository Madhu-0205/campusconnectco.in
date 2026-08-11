# AUDIT MASTER INVENTORY

## 1. Complete Route Tree (App Router)
- `/`: Public Landing
- `/auth/sign-in`, `/auth/sign-up`: Authentication
- `/client-hub/onboarding`: User Onboarding
- `/dashboard/student`: Student Portal (Resume, Copilot, Roadmap, etc.)
- `/dashboard/founder`: Founder Portal (Internships, Gigs, Applications, Escrow, etc.)
- `/dashboard/college`: College Portal (Analytics, Students, Opportunities, etc.)
- `/internships`, `/browse-gigs`, `/freelance-jobs`: Public/Authenticated Discovery
- `/privacy`, `/terms`, `/contact`, `/about`: Marketing / Legal

## 2. Complete API Route Inventory (Under `/api`)
- **Admin**: `/api/admin/*`
- **AI/LLM**: `/api/ai/*` (SmartMatch, parsing, resume-analysis, mock-interview, etc.)
- **Analytics**: `/api/analytics/*`
- **Applications**: `/api/applications/*`, `/api/application/*`
- **Career**: `/api/career-roadmap/*`, `/api/skills/*`, `/api/recommendations/*`
- **College**: `/api/college/*`, `/api/colleges/*`
- **Core Entities**: `/api/gigs/*`, `/api/internships/*`, `/api/posts/*`, `/api/user/*`
- **Founder**: `/api/founder/*`, `/api/employer/*`
- **Gamification**: `/api/gamification/*`
- **Messaging/Social**: `/api/messages/*`, `/api/conversations/*`, `/api/network/*`, `/api/notifications/*`
- **Payments/Escrow**: `/api/payments/*`, `/api/checkout/*`, `/api/cron/*`
- **System**: `/api/health/*`, `/api/internal/*`, `/api/stats/*`, `/api/upload/*`

## 3. Complete Prisma Model Inventory
`User`, `Follows`, `ConnectionRequest`, `Notification`, `Project`, `Gig`, `Application`, `Escrow`, `Transaction`, `TransactionAudit`, `Dispute`, `Post`, `PostLike`, `Conversation`, `Message`, `Skill`, `UserSkill`, `GigSkill`, `Internship`, `SavedInternship`, `SavedGig`, `Announcement`, `PlatformSetting`, `Review`, `Endorsement`, `Task`, `Startup`, `ResumeAnalysis`, `Analytics`, `CareerRoadmap`, `UserEmbedding`, `GigEmbedding`, `Organization`, `Member`, `Subscription`, `CampusDrive`, `MockInterview`, `CopilotSession`, `UserGamification`, `XpEvent`, `Badge`, `UserBadge`, `CampusLeaderboard`, `Referral`, `Ambassador`, `ShareCard`, `GrowthEvent`, `College`.

## 4. Prisma Enum Inventory
`TransactionStatus`, `DisputeStatus`, `EscrowStatus`, `TransactionType`, `MemberRole`, `SubscriptionTier`, `SubscriptionStatus`, `DriveStatus`.

## 5. Supabase Tables used from client
None detected. Prisma is used via server routes primarily.

## 6. Supabase Storage buckets
`resumes` (Used in `/api/upload`)

## 7. Authentication Flows
- Email/Password and Google OAuth via `@supabase/ssr`. 
- Session middleware in `middleware.ts`.
- Fallback profile creation via Prisma in `lib/auth-checks.ts`.

## 8. Authorization Mechanisms
- Server-side role resolution `getUserRoleFromDb` in `lib/auth-checks.ts`.
- `protectApi(Role)` higher-order wrapper used in some APIs.
- Next.js server components using `await getSession()`.

## 9. Middleware Behavior
- Found in `src/middleware.ts`.
- Handles session refresh.
- Enforces strict CSP with nonces.
- Enforces IP-based Rate Limiting (Upstash Redis + memory fallback).
- Secures standard HTTP headers (HSTS, etc).

## 10. Rate-Limit Implementations
- `authLimiter`, `generalApiLimiter`, `aiLimiter`, `resumeParseLimiter`, `searchLimiter`, `uploadLimiter` via `src/lib/rate-limit.ts`.

## 11. AI Endpoints
- Under `/api/ai/*`: uses Gemini models for structured object generation (Zod validation generally present but needs strict auditing).

## 12. Payment Endpoints
- Under `/api/payments/*` and `/api/checkout/*` (DodoPayments integration and Razorpay routing).

## 13. Messaging Endpoints
- `/api/conversations/*`, `/api/messages/*`.

## 14. Notification Endpoints
- `/api/notifications/*`.

## 15. Location/Map Components
- Uses MapLibre GL JS, OpenStreetMap, Nominatim, OpenRouteService.
- Stored as `latitude`, `longitude`, `city`, `state` in Prisma models (`User`, `Gig`, `Internship`).

## 16. Public Profile Data Flows
- `/api/user/profile` (mass assignment risk exists with `resumeData`).

## 17. Founder Portal
- Under `/dashboard/founder/*`. IDOR vulnerabilities discovered in earlier audits.

## 18. College Portal
- Under `/dashboard/college/*`. Vulnerable to string-match leakage (`contains`).

## 19. Student Portal
- Under `/dashboard/student/*`. Safe profile isolation via strict ID checks.

## 20. Cron Jobs
- `/api/cron/release-payments` uses `CRON_SECRET` and timing safe string comparison.

## 21. Server Actions
- Found in various `/src/app` pages using `"use server"`. Needs security review against IDOR.

## 22. External APIs
- Supabase, Upstash Redis, DodoPayments, Razorpay, Gemini, MapLibre/Nominatim.

## 23. Environment Variables
- `DATABASE_URL`, `DIRECT_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `UPSTASH_REDIS_REST_URL`, `GEMINI_API_KEY`, `CRON_SECRET`, `HMAC_KEY`, `OPPORTUNITIES_AUTO_KEY`, etc.

## 24. Mock/Static Features
- To be determined via Phase 0 deep dive. Fraud Engine, ATS Score, etc.

## 25. Duplicate/Legacy Routes
- To be resolved (e.g. `/privacy` vs `/privacy-policy`).

## 26. Navigation Links
- Needs review for dead/broken paths (e.g., `/freelance-jobs`).

## 27. E2E Tests
- Playwright configured in `playwright.config.ts`, tests under `/e2e`. `e2e_runner.ts` exists.

## 28. Unit/Integration Tests
- Vitest configured in `vitest.config.ts`, tests under `/__tests__` and `src/__tests__`.

## 29. Build/Lint/Type-Check Configuration
- Next.js build, ESLint `eslint.config.mjs`, TypeScript `tsconfig.json`.
