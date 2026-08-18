# Prime Packaging PostgreSQL offline backups

This folder is the local-only home for PostgreSQL backup files. Generated
`.sql` and `.dump` files are intentionally ignored by Git and must never be
committed to GitHub: a full database export can contain customer records,
admin/session data, uploaded-media references, and secret settings.

Create a fresh backup from the project root with:

```bash
./database-backups/backup-db.sh
```

The script uses the Replit-provided `DATABASE_URL`, writes with restrictive
file permissions, and keeps the application database unchanged. The admin
Database Manager download and restore features remain available separately.

For disaster recovery, keep a copy outside the repository as well. A local
backup is not the same as a production backup or an encrypted off-site copy.