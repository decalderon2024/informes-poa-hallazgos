BEGIN;

CREATE TABLE plans (
  id serial PRIMARY KEY,
  year integer NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'activo',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE units (
  id serial PRIMARY KEY,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE categories (
  id serial PRIMARY KEY,
  plan_id integer NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL DEFAULT 'blue',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE objectives (
  id serial PRIMARY KEY,
  category_id integer NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  text text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE descriptors (
  id serial PRIMARY KEY,
  objective_id integer NOT NULL REFERENCES objectives(id) ON DELETE CASCADE,
  text text NOT NULL,
  initiative text,
  indicator text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE actions (
  id serial PRIMARY KEY,
  descriptor_id integer NOT NULL REFERENCES descriptors(id) ON DELETE CASCADE,
  description text NOT NULL,
  execution_unit_id integer REFERENCES units(id) ON DELETE SET NULL,
  evaluation_unit_id integer REFERENCES units(id) ON DELETE SET NULL,
  start_month integer,
  end_month integer,
  completion_percentage integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE follow_ups (
  id serial PRIMARY KEY,
  action_id integer NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  month integer NOT NULL,
  execution_comment text,
  evaluation_response text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE observations (
  id serial PRIMARY KEY,
  action_id integer NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX categories_plan_id_idx ON categories(plan_id);
CREATE INDEX objectives_category_id_idx ON objectives(category_id);
CREATE INDEX descriptors_objective_id_idx ON descriptors(objective_id);
CREATE INDEX actions_descriptor_id_idx ON actions(descriptor_id);
CREATE INDEX actions_execution_unit_id_idx ON actions(execution_unit_id);
CREATE INDEX actions_evaluation_unit_id_idx ON actions(evaluation_unit_id);
CREATE INDEX follow_ups_action_id_idx ON follow_ups(action_id);
CREATE INDEX observations_action_id_idx ON observations(action_id);

COMMIT;
