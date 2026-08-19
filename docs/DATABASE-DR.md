# CampusConnect Database Disaster Recovery (DR)

Supabase natively provides PostgreSQL-level backup and recovery options. Since CampusConnect uses Prisma as an ORM, schema changes and data continuity must be carefully managed in the event of an outage.

## 1. Automated Backups & PITR
The CampusConnect repository initializes Supabase via the `DATABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables. The repository itself **cannot** manage backups.

**Operator Checklist:**
- [ ] Log into the Supabase Dashboard.
- [ ] Select the Production Project.
- [ ] Navigate to **Settings > Database > Backups**.
- [ ] Verify that **Daily Snapshots** are enabled.
- [ ] Verify that **Point-in-Time Recovery (PITR)** is enabled.
- [ ] Confirm the retention period satisfies the company's SLA (e.g. 7 or 30 days).

## 2. Restore Procedure (Runbook)
If a destructive data event occurs (e.g., accidental deletion of the `User` table or a corrupted migration):

1. **Pause Traffic**: Prevent new writes by flipping the Vercel environment variable `NEXT_PUBLIC_MAINTENANCE_MODE` to `true` (if implemented) or pausing the Vercel project.
2. **Execute Restore**: Use the Supabase Dashboard PITR tool to roll back to the timestamp exactly 1 minute prior to the destructive event.
3. **Verify Integrity**: Use the Supabase Table Editor to confirm the restored state.
4. **Resync Prisma**: If the schema was corrupted, locally run `npx prisma migrate deploy` to ensure the current migration state perfectly aligns with the recovered database snapshot.
5. **Resume Traffic**: Unpause the Vercel project.

> [!CAUTION]
> NEVER execute `npx prisma db push` or `npx prisma migrate reset` against the production database. These commands are fundamentally destructive and will result in data loss.
