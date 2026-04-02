-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS quizzes (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id          UUID NOT NULL UNIQUE REFERENCES lessons(id) ON DELETE CASCADE,
  title              VARCHAR(255) NOT NULL,
  description        TEXT,
  pass_score         INTEGER NOT NULL DEFAULT 70 CHECK (pass_score BETWEEN 0 AND 100),
  time_limit_minutes INTEGER CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),
  max_attempts       INTEGER CHECK (max_attempts IS NULL OR max_attempts > 0),
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_quizzes_is_active ON quizzes (is_active);

CREATE TRIGGER trg_quizzes_updated
BEFORE UPDATE ON quizzes
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type quiz_question_type_enum NOT NULL,
  explanation   TEXT,
  points        INTEGER NOT NULL DEFAULT 1 CHECK (points > 0),
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (quiz_id, sort_order)
);

CREATE INDEX IF NOT EXISTS ix_quiz_questions_quiz ON quiz_questions (quiz_id, sort_order);

CREATE TRIGGER trg_quiz_questions_updated
BEFORE UPDATE ON quiz_questions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS quiz_options (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, sort_order)
);

CREATE INDEX IF NOT EXISTS ix_quiz_options_question ON quiz_options (question_id, sort_order);

CREATE TRIGGER trg_quiz_options_updated
BEFORE UPDATE ON quiz_options
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       UUID NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status        quiz_attempt_status_enum NOT NULL DEFAULT 'in_progress',
  score         INTEGER CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  passed        BOOLEAN,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at  TIMESTAMPTZ,
  graded_at     TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_quiz_attempts_quiz_user ON quiz_attempts (quiz_id, user_id);
CREATE INDEX IF NOT EXISTS ix_quiz_attempts_user_status ON quiz_attempts (user_id, status);
CREATE INDEX IF NOT EXISTS ix_quiz_attempts_started_at ON quiz_attempts (started_at DESC);

CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id          UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id         UUID NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_option_ids JSONB,
  answer_text         TEXT,
  is_correct          BOOLEAN,
  awarded_points      INTEGER CHECK (awarded_points IS NULL OR awarded_points >= 0),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS ix_quiz_attempt_answers_attempt ON quiz_attempt_answers (attempt_id);

CREATE TRIGGER trg_quiz_attempt_answers_updated
BEFORE UPDATE ON quiz_attempt_answers
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS trg_quiz_attempt_answers_updated ON quiz_attempt_answers;
DROP INDEX IF EXISTS ix_quiz_attempt_answers_attempt;
DROP TABLE IF EXISTS quiz_attempt_answers;

DROP INDEX IF EXISTS ix_quiz_attempts_started_at;
DROP INDEX IF EXISTS ix_quiz_attempts_user_status;
DROP INDEX IF EXISTS ix_quiz_attempts_quiz_user;
DROP TABLE IF EXISTS quiz_attempts;

DROP TRIGGER IF EXISTS trg_quiz_options_updated ON quiz_options;
DROP INDEX IF EXISTS ix_quiz_options_question;
DROP TABLE IF EXISTS quiz_options;

DROP TRIGGER IF EXISTS trg_quiz_questions_updated ON quiz_questions;
DROP INDEX IF EXISTS ix_quiz_questions_quiz;
DROP TABLE IF EXISTS quiz_questions;

DROP TRIGGER IF EXISTS trg_quizzes_updated ON quizzes;
DROP INDEX IF EXISTS ix_quizzes_is_active;
DROP TABLE IF EXISTS quizzes;

-- +goose StatementEnd
