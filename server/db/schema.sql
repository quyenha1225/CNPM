-- PostgreSQL schema for the Staff Management module.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE staff_role AS ENUM ('Admin', 'Sales Staff', 'Technical Staff', 'Warehouse Staff');
CREATE TYPE staff_status AS ENUM ('active', 'inactive');

CREATE TABLE staffs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  role staff_role NOT NULL DEFAULT 'Sales Staff',
  status staff_status NOT NULL DEFAULT 'active',
  avatar TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX staffs_search_idx ON staffs USING GIN (to_tsvector('simple', full_name || ' ' || email || ' ' || phone));

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
CREATE TRIGGER staffs_set_updated_at BEFORE UPDATE ON staffs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
