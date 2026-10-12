BEGIN;

CREATE TABLE IF NOT EXISTS finding_reports (
  id serial PRIMARY KEY,
  year integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'activo' CHECK (status IN ('activo', 'cerrado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS findings (
  id serial PRIMARY KEY,
  report_id integer NOT NULL REFERENCES finding_reports(id) ON DELETE CASCADE,
  reference text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  agency_area text,
  origin text,
  regulatory_basis text,
  assigned_area text,
  strategy text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS findings_report_id_idx ON findings(report_id);

CREATE TABLE IF NOT EXISTS finding_month_updates (
  id serial PRIMARY KEY,
  finding_id integer NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  status text CHECK (status IN ('corrected', 'observed', 'pending')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (status IS NOT NULL OR NULLIF(BTRIM(note), '') IS NOT NULL)
);

CREATE UNIQUE INDEX IF NOT EXISTS finding_month_updates_finding_month_idx
  ON finding_month_updates(finding_id, month);

CREATE TABLE IF NOT EXISTS finding_observations (
  id serial PRIMARY KEY,
  finding_id integer NOT NULL REFERENCES findings(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS finding_observations_finding_id_idx
  ON finding_observations(finding_id);

COMMIT;
