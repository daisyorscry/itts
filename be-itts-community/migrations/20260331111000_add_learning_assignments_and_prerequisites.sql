-- +goose Up
-- +goose StatementBegin

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'lesson_type_enum'
      AND e.enumlabel = 'assignment'
  ) THEN
    ALTER TYPE lesson_type_enum ADD VALUE 'assignment';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'assignment_submission_status_enum') THEN
    CREATE TYPE assignment_submission_status_enum AS ENUM ('submitted', 'approved', 'rejected');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS lesson_prerequisites (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id              UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  prerequisite_lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, prerequisite_lesson_id),
  CHECK (lesson_id <> prerequisite_lesson_id)
);

CREATE INDEX IF NOT EXISTS ix_lesson_prerequisites_lesson ON lesson_prerequisites (lesson_id);
CREATE INDEX IF NOT EXISTS ix_lesson_prerequisites_prerequisite ON lesson_prerequisites (prerequisite_lesson_id);

CREATE TABLE IF NOT EXISTS assignments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id             UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  title                 VARCHAR(255) NOT NULL,
  instructions          TEXT,
  due_at                TIMESTAMPTZ,
  max_score             INTEGER CHECK (max_score IS NULL OR max_score >= 0),
  allow_text_submission BOOLEAN NOT NULL DEFAULT TRUE,
  allow_link_submission BOOLEAN NOT NULL DEFAULT FALSE,
  allow_file_submission BOOLEAN NOT NULL DEFAULT FALSE,
  is_active             BOOLEAN NOT NULL DEFAULT TRUE,
  is_auto_approve       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_assignments_active ON assignments (is_active);
CREATE INDEX IF NOT EXISTS ix_assignments_due_at ON assignments (due_at DESC);

CREATE TRIGGER trg_assignments_updated
BEFORE UPDATE ON assignments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id    UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  submission_text  TEXT,
  submission_url   TEXT,
  attachment_url   TEXT,
  status           assignment_submission_status_enum NOT NULL DEFAULT 'submitted',
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at      TIMESTAMPTZ,
  reviewed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
  score            INTEGER CHECK (score IS NULL OR score >= 0),
  feedback         TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (assignment_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_assignment_submissions_assignment ON assignment_submissions (assignment_id, status);
CREATE INDEX IF NOT EXISTS ix_assignment_submissions_user ON assignment_submissions (user_id, submitted_at DESC);

CREATE TRIGGER trg_assignment_submissions_updated
BEFORE UPDATE ON assignment_submissions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS trg_assignment_submissions_updated ON assignment_submissions;
DROP INDEX IF EXISTS ix_assignment_submissions_user;
DROP INDEX IF EXISTS ix_assignment_submissions_assignment;
DROP TABLE IF EXISTS assignment_submissions;

DROP TRIGGER IF EXISTS trg_assignments_updated ON assignments;
DROP INDEX IF EXISTS ix_assignments_due_at;
DROP INDEX IF EXISTS ix_assignments_active;
DROP TABLE IF EXISTS assignments;

DROP INDEX IF EXISTS ix_lesson_prerequisites_prerequisite;
DROP INDEX IF EXISTS ix_lesson_prerequisites_lesson;
DROP TABLE IF EXISTS lesson_prerequisites;

DROP TYPE IF EXISTS assignment_submission_status_enum;

-- +goose StatementEnd
