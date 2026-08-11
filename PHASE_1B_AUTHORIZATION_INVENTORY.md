# PHASE 1B AUTHORIZATION INVENTORY

| Route | Methods | Auth | protectApi | Roles | Prisma | Zod | Potential IDOR |
|---|---|---|---|---|---|---|---|
| /admin/audit-logs | GET | ✅ | ✅ | ["FOUNDER"] | R | ❌ | REVIEW |
| /admin/feature-flags | GET,POST | ✅ | ✅ | ["FOUNDER"] | R | ❌ | REVIEW |
| /admin/moderation-events | GET,PATCH | ✅ | ✅ | ['FOUNDER'] | R,U,D | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /ai | POST | ✅ | ✅ | ["FOUNDER", "STUDENT"] |  | ✅ | REVIEW |
| /ai/career-guidance | POST | ✅ | ❌ |  | R,C | ❌ | REVIEW |
| /ai/chat | POST | ✅ | ❌ |  |  | ❌ | REVIEW |
| /ai/copilot/chat | POST | ❌ | ❌ |  |  | ❌ | REVIEW |
| /ai/copilot/sessions | GET,POST,DELETE | ✅ | ✅ | ["FOUNDER", "STUDENT", "STARTUP", "CLIENT"] | R,U,D,C | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /ai/cover-letter | POST | ✅ | ❌ |  | R | ❌ | REVIEW |
| /ai/embed/gig | POST | ✅ | ✅ | ["FOUNDER", "STUDENT", "STARTUP", "CLIENT"] |  | ❌ | REVIEW |
| /ai/embed/user | POST | ✅ | ✅ | ["FOUNDER", "STUDENT", "STARTUP", "CLIENT"] |  | ❌ | REVIEW |
| /ai/feed | GET | ✅ | ❌ |  |  | ❌ | REVIEW |
| /ai/match/gigs | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /ai/match/students | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /ai/mock-interview | GET,POST,PATCH | ✅ | ✅ | ["FOUNDER", "STUDENT"] | R,U,C | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /ai/moderate | POST | ✅ | ❌ |  | C | ❌ | REVIEW |
| /ai/parse-file | POST | ✅ | ✅ | ["FOUNDER", "STUDENT", "STARTUP", "CLIENT"] |  | ❌ | REVIEW |
| /ai/parse-resume | POST | ✅ | ❌ |  | U,C | ❌ | ⚠️ HIGH (Mutations without protectApi) |
| /ai/resume-analyze | POST,GET | ✅ | ✅ | ["FOUNDER", "STUDENT", "STARTUP", "CLIENT"] | R,C | ❌ | REVIEW |
| /ai/skill-gap | POST | ✅ | ✅ | ["FOUNDER", "STUDENT"] | R | ❌ | REVIEW |
| /ai/smartmatch | POST | ✅ | ✅ | ['FOUNDER', 'STUDENT'] | R | ❌ | REVIEW |
| /ai/trending | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /analytics/platform | GET | ✅ | ✅ | ["FOUNDER"] |  | ❌ | REVIEW |
| /analytics/revenue | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /analytics/track | POST | ❌ | ❌ |  |  | ❌ | REVIEW |
| /application/pending-count | GET | ✅ | ✅ | ["CLIENT", "FOUNDER"] |  | ❌ | REVIEW |
| /applications | GET,POST | ✅ | ❌ |  | R,C | ✅ | REVIEW |
| /applications/[id] | PATCH,GET,DELETE | ❌ | ❌ |  | R,U,D,C | ✅ | ⚠️ HIGH (Mutations without protectApi) |
| /applications/apply | POST | ✅ | ❌ |  | R,C | ✅ | REVIEW |
| /career-roadmap | GET,POST | ✅ | ✅ | ["FOUNDER", "STUDENT"] |  | ❌ | REVIEW |
| /checkout/create-order | POST | ✅ | ❌ |  | R,C | ✅ | REVIEW |
| /checkout/dispute | POST | ✅ | ❌ |  | R | ✅ | REVIEW |
| /checkout/refund | POST | ✅ | ❌ |  | R | ✅ | REVIEW |
| /checkout/webhook | POST | ❌ | ❌ |  | R | ❌ | REVIEW |
| /client-hub/applicants | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /college/analytics | GET | ✅ | ✅ | ["COLLEGE", "FOUNDER"] | R | ❌ | REVIEW |
| /college/students | GET | ✅ | ✅ | ["COLLEGE", "FOUNDER"] | R | ❌ | REVIEW |
| /colleges | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /colleges/reverse-geocode | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /colleges/submit | POST | ❌ | ❌ |  | R,C | ✅ | REVIEW |
| /conversations | GET,POST | ✅ | ❌ |  | R,C | ✅ | REVIEW |
| /conversations/[id] | GET,POST,PATCH | ❌ | ❌ |  | R,U,C | ✅ | ⚠️ HIGH (Mutations without protectApi) |
| /cron/release-payments | GET | ❌ | ❌ |  | R | ❌ | REVIEW |
| /cron/weekly-report | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /employer/drives | POST,GET | ✅ | ❌ |  |  | ✅ | REVIEW |
| /employer/organization | POST | ✅ | ❌ |  |  | ✅ | REVIEW |
| /employer/organization/[id] | PATCH | ✅ | ❌ |  |  | ✅ | REVIEW |
| /employer/talent-search | GET | ✅ | ✅ | ["FOUNDER", "STARTUP", "CLIENT"] | R | ❌ | REVIEW |
| /endorsement | POST | ✅ | ❌ |  | R,C | ❌ | REVIEW |
| /founder/announcements | GET,POST | ✅ | ✅ | ["ADMIN"] | R,C | ❌ | REVIEW |
| /founder/announcements/[id] | PATCH,DELETE | ✅ | ✅ | ["ADMIN"] | U,D | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /founder/approvals | GET,PATCH | ✅ | ✅ | ["ADMIN"] | R,U | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /founder/audit | GET | ✅ | ✅ | ["ADMIN"] | R | ❌ | REVIEW |
| /founder/disputes | GET,POST | ✅ | ✅ | ["ADMIN"] | R | ✅ | REVIEW |
| /founder/escrow | GET | ✅ | ✅ | ["ADMIN"] | R | ❌ | REVIEW |
| /founder/gigs | GET | ✅ | ✅ | ["ADMIN"] | R | ❌ | REVIEW |
| /founder/gigs/[id] | PATCH,DELETE | ✅ | ✅ | ["ADMIN"] | R,U,D | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /founder/internships | GET,POST | ✅ | ✅ | ["ADMIN"] | R,C | ❌ | REVIEW |
| /founder/internships/[id] | PATCH,DELETE | ✅ | ✅ | ["ADMIN"] | R,U | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /founder/monetize | POST | ✅ | ✅ | ["ADMIN"] | U | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /founder/preview | POST | ✅ | ❌ |  |  | ❌ | REVIEW |
| /founder/settings | GET,PATCH | ✅ | ✅ | ["ADMIN"] | R | ❌ | REVIEW |
| /founder/users | GET | ✅ | ✅ | ["ADMIN"] | R | ❌ | REVIEW |
| /founder/users/[id] | PATCH,DELETE | ✅ | ✅ | ["ADMIN"] | R,U | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /founder/verify-role | GET | ✅ | ✅ | ["ADMIN"] |  | ❌ | REVIEW |
| /founder/volume | GET | ✅ | ✅ | ["ADMIN"] | R | ❌ | REVIEW |
| /gamification/leaderboard | GET | ✅ | ❌ |  |  | ❌ | REVIEW |
| /gamification/profile | GET,POST | ✅ | ❌ |  |  | ❌ | REVIEW |
| /gigs | GET,POST,PATCH,DELETE | ✅ | ✅ | ["FOUNDER", "STARTUP", "ADMIN", "CLIENT"] | R,U,D,C | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /gigs/browse | GET | ❌ | ❌ |  | R | ❌ | REVIEW |
| /growth/referral | GET,POST | ✅ | ❌ |  | R | ❌ | REVIEW |
| /growth/referral/lookup | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /growth/referral/register | POST | ✅ | ❌ |  |  | ❌ | REVIEW |
| /growth/share-card | GET | ❌ | ❌ |  | R | ❌ | REVIEW |
| /health | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /internal/import-internship | POST | ❌ | ❌ |  | R,C | ❌ | REVIEW |
| /internal/opportunities | POST | ❌ | ❌ |  |  | ✅ | REVIEW |
| /internships | GET,POST,PATCH,DELETE | ✅ | ✅ | ["STUDENT", "FOUNDER"] | R,U,D,C | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /internships/[id] | GET | ❌ | ❌ |  | R | ✅ | REVIEW |
| /internships/[id]/engage | PATCH,GET | ✅ | ✅ | ["STUDENT", "FOUNDER"] | R | ✅ | REVIEW |
| /live | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /messages | POST | ❌ | ❌ |  | U,C | ✅ | ⚠️ HIGH (Mutations without protectApi) |
| /network/connections | GET,POST,PATCH | ❌ | ❌ |  | R,U,D,C | ❌ | ⚠️ HIGH (Mutations without protectApi) |
| /network/status | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /network/users | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /notifications | GET,PATCH | ✅ | ❌ |  | R,U | ❌ | ⚠️ HIGH (Mutations without protectApi) |
| /payments/escrow/create-order | POST | ✅ | ❌ |  | R | ❌ | REVIEW |
| /payments/escrow/release | POST | ✅ | ❌ |  | R | ❌ | REVIEW |
| /payments/escrow/verify | POST | ✅ | ❌ |  |  | ❌ | REVIEW |
| /posts | GET,POST,DELETE,PATCH | ✅ | ✅ | ["STUDENT", "FOUNDER"] | R,U,D,C | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /public/gigs/trending | GET | ❌ | ❌ |  | R | ❌ | REVIEW |
| /ready | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /recommendations | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /resumes/[userId]/[fileName] | GET | ❌ | ❌ |  | R | ✅ | REVIEW |
| /review | POST | ✅ | ❌ |  | R,C | ✅ | REVIEW |
| /search | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /skills/categories | GET | ❌ | ❌ |  |  | ❌ | REVIEW |
| /skills/suggestions | GET | ❌ | ❌ |  | R | ❌ | REVIEW |
| /stats | GET | ❌ | ❌ |  | R | ❌ | REVIEW |
| /tasks/cleanup | GET | ✅ | ✅ | ["ADMIN"] | D | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /upload | POST | ✅ | ❌ |  |  | ❌ | REVIEW |
| /user/delete | DELETE | ✅ | ✅ | ["STUDENT", "FOUNDER", "COLLEGE", "CLIENT", "STARTUP"] | D | ❌ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /user/follow | POST,DELETE | ✅ | ❌ |  | R | ❌ | REVIEW |
| /user/profile | POST,GET,PATCH,PUT | ✅ | ✅ | ["FOUNDER", "STUDENT", "STARTUP", "CLIENT"] | R,U,C | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |
| /user/projects | POST,DELETE | ❌ | ❌ |  | D,C | ✅ | ⚠️ HIGH (Mutations without protectApi) |
| /user/resume-history | GET | ✅ | ❌ |  | R | ❌ | REVIEW |
| /user/saved | GET,POST | ✅ | ✅ | ["STUDENT"] | R,D | ✅ | ⚠️ MEDIUM (Mutations with protectApi, requires manual IDOR review) |