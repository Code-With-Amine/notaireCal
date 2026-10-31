-- Migration: TNB consultation as internal request-management system
-- Run after the initial schema.

-- 1. Add citizen_token and publication fields to consultation_requests
ALTER TABLE consultation_requests
  ADD COLUMN IF NOT EXISTS citizen_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by TEXT,
  ADD COLUMN IF NOT EXISTS result_grand_total NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS ignored_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- citizen_token is populated by the application (Node crypto).
-- Existing rows are backfilled by scripts/backfill-tokens.mjs.
-- 2. Annual TNB calculation entries per request
CREATE TABLE IF NOT EXISTS consultation_years (
  id              SERIAL PRIMARY KEY,
  request_id      INTEGER NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  tax_year        INTEGER NOT NULL,
  surface_area    NUMERIC(12,2) NOT NULL DEFAULT 0,
  legacy_zone     TEXT,
  modern_zone     TEXT,
  modern_rate     NUMERIC(6,2),
  is_declared     BOOLEAN NOT NULL DEFAULT FALSE,
  calculation_date DATE,
  principal       NUMERIC(12,2),
  def             NUMERIC(12,2),
  majoration10    NUMERIC(12,2),
  majoration5     NUMERIC(12,2),
  months_late     INTEGER,
  majoration05    NUMERIC(12,2),
  annual_total    NUMERIC(12,2),
  unresolved_reason TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (request_id, tax_year)
);

CREATE INDEX IF NOT EXISTS idx_consultation_years_request
  ON consultation_years (request_id);

-- 3. Audit / processing history
CREATE TABLE IF NOT EXISTS consultation_audit_log (
  id            SERIAL PRIMARY KEY,
  request_id    INTEGER NOT NULL REFERENCES consultation_requests(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  actor_email   TEXT,
  old_status    TEXT,
  new_status    TEXT,
  details       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultation_audit_request
  ON consultation_audit_log (request_id, created_at DESC);
