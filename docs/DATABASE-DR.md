# CampusConnect Database Disaster Recovery (DR)

CampusConnect currently operates on the **Supabase Free Tier**. 

> [!IMPORTANT]
> **Supabase Free Tier Limitations**:
> Supabase Free does **NOT** provide managed automated backups or Point-in-Time Recovery (PITR) in the dashboard.
> To prevent data loss, CampusConnect utilizes an automated, off-site, encrypted backup pipeline implemented via GitHub Actions.
>
> For the complete disaster recovery runbook, architecture, restore procedure, and manual secret setup, consult:
> 👉 [DATABASE_BACKUP_AND_RESTORE.md](file:///Users/madhu/Desktop/campusconnectco.in-main/docs/DATABASE_BACKUP_AND_RESTORE.md)

## 1. Automated Backups Architecture
- **Workflow**: `.github/workflows/database-backup.yml`
- **Schedule**: Daily at 02:00 UTC (07:30 IST) + ad-hoc `workflow_dispatch`.
- **Dumps**: Logical export of cluster roles, public schema DDL, and public data records via Supabase CLI.
- **Encryption**: OpenSSL AES-256-CBC with PBKDF2 (100,000 iterations).
- **Storage**: Private Google Drive storage (Temporary early-stage off-site destination).
- **Retention**: 30-day automated rolling retention.
- **RPO**: ~24 hours (maximum data at risk in catastrophic event).
- **RTO**: 1-2 hours (time required to decrypt and restore into an isolated recovery instance).

## 2. Restore Runbook Summary
If a destructive data event occurs:

1. **Pause Traffic**: Prevent further writes by pausing the Vercel production deployment or enabling maintenance mode.
2. **Provision Isolated Recovery Instance**: Spin up an isolated Supabase project or staging instance. **DO NOT RESTORE DIRECTLY OVER PRODUCTION.**
3. **Execute Restore Script**: Use `scripts/restore-db.sh` with the target recovery database URL and the `BACKUP_ENCRYPTION_KEY`.
4. **Verify Integrity**: Validate row counts (`User`, `gigs`, `Transaction`, `Notification`), check foreign-key integrity, and confirm RLS policies.
5. **Resync Migrations**: Run `npx prisma migrate status` against the recovery database.
6. **Deploy / Traffic Cutover**: Update production `DATABASE_URL` and `DIRECT_URL` in Vercel to point to the validated recovered database and resume traffic.

> [!CAUTION]
> NEVER execute `npx prisma db push` or `npx prisma migrate reset` against the production database. These commands are fundamentally destructive and will result in permanent data loss.

