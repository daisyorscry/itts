-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS course_enrollments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           enrollment_status_enum NOT NULL DEFAULT 'active',
  enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_course_enrollments_user_status ON course_enrollments (user_id, status);
CREATE INDEX IF NOT EXISTS ix_course_enrollments_course_status ON course_enrollments (course_id, status);
CREATE INDEX IF NOT EXISTS ix_course_enrollments_last_accessed ON course_enrollments (last_accessed_at DESC);

CREATE TRIGGER trg_course_enrollments_updated
BEFORE UPDATE ON course_enrollments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS lesson_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id             UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  user_id               UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_completed          BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at          TIMESTAMPTZ,
  last_position_seconds INTEGER NOT NULL DEFAULT 0 CHECK (last_position_seconds >= 0),
  time_spent_seconds    INTEGER NOT NULL DEFAULT 0 CHECK (time_spent_seconds >= 0),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (lesson_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_lesson_progress_user_completed ON lesson_progress (user_id, is_completed);
CREATE INDEX IF NOT EXISTS ix_lesson_progress_lesson_completed ON lesson_progress (lesson_id, is_completed);

CREATE TRIGGER trg_lesson_progress_updated
BEFORE UPDATE ON lesson_progress
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS trg_lesson_progress_updated ON lesson_progress;
DROP INDEX IF EXISTS ix_lesson_progress_lesson_completed;
DROP INDEX IF EXISTS ix_lesson_progress_user_completed;
DROP TABLE IF EXISTS lesson_progress;

DROP TRIGGER IF EXISTS trg_course_enrollments_updated ON course_enrollments;
DROP INDEX IF EXISTS ix_course_enrollments_last_accessed;
DROP INDEX IF EXISTS ix_course_enrollments_course_status;
DROP INDEX IF EXISTS ix_course_enrollments_user_status;
DROP TABLE IF EXISTS course_enrollments;

-- +goose StatementEnd
