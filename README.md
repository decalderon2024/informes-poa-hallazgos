# Informes POA

Next.js application backed by Neon PostgreSQL and Drizzle ORM.

## Local setup

1. Install dependencies with `pnpm install`.
2. In Neon, open the `production` branch and copy its PostgreSQL connection string. Save it in a local `.env` file as `DATABASE_URL="postgresql://..."`. Never commit this file.
3. On a new, empty database, apply the migrations in order:

   ```sh
   set -a; . ./.env; set +a
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0001_initial.sql
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0002_action_month_statuses.sql
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f db/migrations/0003_findings.sql
   ```

4. Start the application with `pnpm dev` and open `http://localhost:3000`.

For an existing database, apply only migrations that have not yet run. The initial migration creates the original eight POA tables; the second adds monthly action statuses; the third adds the separate Hallazgos module. Existing manual POA completion percentages are retained as legacy data but are not used in the UI. Completion is calculated as completed months divided by planned months, so previously unmarked actions initially show 0%.

Hallazgos starts empty. Create an annual report in **Hallazgos → Configuración**, register findings in **Estructura**, and record monthly statuses and notes in **Reporte**. Its current status comes from the latest month with a status; a finding with no monthly status is pending. The correction rate is corrected findings divided by all findings. The `HALLAZGOS.xlsb` source is a reference for fields and workflow; no historical records or Council minutes are imported automatically.

No Neon Auth, storage, or seed data is required. Create the first POA plan and any units from the application's **Configuración** page. Do not rerun the initial migration on a database that already has these tables.
