-- +goose Up
-- +goose StatementBegin
-- =========================
-- Registrations (pendaftaran anggota)
-- =========================
CREATE TABLE registrations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name        TEXT        NOT NULL,
  email            TEXT        NOT NULL,
  program          program_enum NOT NULL,
  student_id       TEXT        NOT NULL,
  intake_year      INTEGER     NOT NULL CHECK (intake_year BETWEEN 2000 AND 2100),
  motivation       TEXT        NOT NULL,
  status           registration_status_enum NOT NULL DEFAULT 'pending',
  approved_by      TEXT,
  approved_at      TIMESTAMPTZ,
  rejected_reason  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_registrations_status ON registrations (status);
CREATE INDEX IF NOT EXISTS ix_registrations_program ON registrations (program);

-- trigger updated_at
CREATE TRIGGER trg_registrations_updated
BEFORE UPDATE ON registrations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TRIGGER IF EXISTS trg_registrations_updated ON registrations;
DROP TABLE IF EXISTS registrations;
-- +goose StatementEnd
