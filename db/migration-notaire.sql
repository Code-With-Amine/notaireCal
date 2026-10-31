-- Migration: multi-notaire platform
-- Adds notaire_profiles table and links consultation_requests to notaires.

CREATE TABLE IF NOT EXISTS notaire_profiles (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  study_name    TEXT,
  cin           TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'active', -- active | suspended
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notaire_profiles_email ON notaire_profiles (email);
CREATE INDEX IF NOT EXISTS idx_notaire_profiles_cin ON notaire_profiles (cin);

-- Link requests to notaires
ALTER TABLE consultation_requests
  ADD COLUMN IF NOT EXISTS notaire_id INTEGER REFERENCES notaire_profiles(id),
  ADD COLUMN IF NOT EXISTS share_token TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS share_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Backfill share_token for existing rows
-- (handled by application; nullable for now)

CREATE INDEX IF NOT EXISTS idx_consultation_requests_notaire
  ON consultation_requests (notaire_id);

-- Audit log already exists; ensure it can record notaire actions
-- (no schema change needed)
