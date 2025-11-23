-- +goose Up
ALTER TABLE registrations
  ADD COLUMN IF NOT EXISTS email_verified_at timestamptz NULL;

CREATE TABLE IF NOT EXISTS email_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id uuid NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
  token_hash char(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_registrations_email ON registrations(email);

CREATE INDEX IF NOT EXISTS idx_email_verifications_reg ON email_verifications(registration_id);
CREATE INDEX IF NOT EXISTS idx_email_verifications_token_hash ON email_verifications(token_hash);

-- +goose Down
DROP INDEX IF EXISTS idx_email_verifications_token_hash;
DROP INDEX IF EXISTS idx_email_verifications_reg;
DROP TABLE IF EXISTS email_verifications;
ALTER TABLE registrations DROP COLUMN IF EXISTS email_verified_at;
DROP INDEX IF EXISTS ux_registrations_email;

