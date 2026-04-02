-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS learner_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
  student_id      TEXT,
  program         program_enum,
  intake_year     INTEGER CHECK (intake_year BETWEEN 2000 AND 2100),
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_learner_profiles_program ON learner_profiles (program);
CREATE INDEX IF NOT EXISTS ix_learner_profiles_registration_id ON learner_profiles (registration_id);

CREATE TRIGGER trg_learner_profiles_updated
BEFORE UPDATE ON learner_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS trg_learner_profiles_updated ON learner_profiles;
DROP INDEX IF EXISTS ix_learner_profiles_registration_id;
DROP INDEX IF EXISTS ix_learner_profiles_program;
DROP TABLE IF EXISTS learner_profiles;

-- +goose StatementEnd
