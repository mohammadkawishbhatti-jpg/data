# OrangeHost cPanel deployment

The repository contains a GitHub Actions workflow at
`.github/workflows/deploy-cpanel.yml`. It deploys the `main` branch to an
OrangeHost cPanel Node.js application after the cPanel host is configured.

## cPanel application shape

The API server is the production entry point. It serves:

- `/` — the public Prime Packaging site
- `/admin/` — the admin panel
- `/customer-portal/` — the customer portal
- `/api/*` — the API

Set the cPanel Node.js application root to the deployed repository root plus
`artifacts/api-server`, and use `dist/index.mjs` as the startup file. The
application must run with `NODE_ENV=production`, a production `PORT`, and the
production database/environment variables.

The API expects the three frontend build directories to remain at these
relative paths:

```text
artifacts/api-server/dist
artifacts/prime-site/dist/public
artifacts/admin-panel/dist/public
artifacts/customer-portal/dist/public
```

## GitHub repository secrets

Add these repository secrets before enabling the first automatic deployment:

| Secret                   | Value                                               |
| ------------------------ | --------------------------------------------------- |
| `CPANEL_HOST`            | OrangeHost SSH hostname                             |
| `CPANEL_SSH_PORT`        | SSH port, normally `22`                             |
| `CPANEL_USERNAME`        | cPanel account username                             |
| `CPANEL_SSH_PRIVATE_KEY` | Private half of the authorized deploy key           |
| `CPANEL_KNOWN_HOSTS`     | Pinned SSH host-key line(s) for the OrangeHost host |
| `CPANEL_APP_ROOT`        | Absolute path to the deployed repository on cPanel  |

Also add the repository variable `CPANEL_DEPLOY_ENABLED` with the value
`true` only after the cPanel Node.js app, backup, and staging directory are
ready. Until then, pushes still run the build and output validation, but they
do not connect to or modify cPanel.

Keep all runtime application secrets in cPanel's environment configuration,
not in GitHub or the repository. At minimum the API needs a production
`DATABASE_URL` and `SESSION_SECRET`; the AI, email, storage, and monitoring
settings are configured there as required.

## Safety behavior

The workflow builds and validates all three frontends plus the API before
connecting to cPanel. The remote step:

1. Creates a rollback archive of the current application.
2. Extracts the new release into a staging directory.
3. Verifies all required build outputs exist.
4. Synchronizes the release while preserving `.env*`, uploads, and
   deployment backups.
5. Installs production API dependencies.
6. Touches cPanel's `tmp/restart.txt` so Passenger restarts the Node app.

It does not run `drizzle-kit push` or delete the production database. Database
schema changes must use the project's controlled migration process.

## First deployment

Before the first push to `main`:

1. Create and authorize the temporary `prime_deploy` SSH key in cPanel.
2. Configure the cPanel Node.js application and its production environment.
3. Back up the existing Prime Packaging files and database.
4. Point `CPANEL_APP_ROOT` at a new deployment directory, not the old site's
   document root, for the staging rollout.
5. Run the workflow manually from GitHub Actions.
6. Test the new app before switching the existing Prime domain.

The Eco Box domain and its document root are not part of this workflow.
