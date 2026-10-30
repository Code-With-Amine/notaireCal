-- Daribati schema (Neon Postgres)
-- Run once against the database.

CREATE TABLE IF NOT EXISTS consultation_requests (
  id            SERIAL PRIMARY KEY,
  reference     TEXT NOT NULL UNIQUE,
  title_number  TEXT NOT NULL,
  cnp_number    TEXT,
  email         TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pending',
  result_amount NUMERIC(12,2),
  result_note   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_status
  ON consultation_requests (status);

CREATE INDEX IF NOT EXISTS idx_consultation_requests_created
  ON consultation_requests (created_at DESC);

CREATE TABLE IF NOT EXISTS admins (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id            SERIAL PRIMARY KEY,
  admin_email   TEXT,
  action        TEXT NOT NULL,
  target_ref    TEXT,
  details       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_rates_tva (
  id            SERIAL PRIMARY KEY,
  operation     TEXT NOT NULL,
  rate          NUMERIC(6,4) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to  DATE,
  legal_ref     TEXT,
  source_url    TEXT,
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tax_rates_tnb (
  id            SERIAL PRIMARY KEY,
  zone          TEXT NOT NULL,
  rate          NUMERIC(8,2) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to  DATE,
  legal_ref     TEXT,
  source_url    TEXT,
  verified      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
