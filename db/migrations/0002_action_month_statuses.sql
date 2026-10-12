BEGIN;

CREATE TABLE IF NOT EXISTS action_month_statuses (
  id serial PRIMARY KEY,
  action_id integer NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  month integer NOT NULL CHECK (month BETWEEN 1 AND 12),
  status text NOT NULL CHECK (status IN ('done', 'missed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS action_month_statuses_action_month_idx
  ON action_month_statuses(action_id, month);

COMMENT ON COLUMN actions.completion_percentage IS
  'Legacy manual percentage; current completion is calculated from planned months and action_month_statuses.';

COMMIT;
