-- +goose Up
-- +goose StatementBegin

CREATE TYPE course_level_enum AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE course_status_enum AS ENUM ('draft', 'published', 'archived');
CREATE TYPE lesson_type_enum AS ENUM ('video', 'article', 'embed', 'file', 'quiz');
CREATE TYPE enrollment_status_enum AS ENUM ('active', 'completed', 'dropped');
CREATE TYPE quiz_question_type_enum AS ENUM ('single_choice', 'multiple_choice', 'short_answer');
CREATE TYPE quiz_attempt_status_enum AS ENUM ('in_progress', 'submitted', 'graded');
CREATE TYPE certificate_status_enum AS ENUM ('issued', 'revoked');

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS headline VARCHAR(255);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

ALTER TABLE users
  DROP COLUMN IF EXISTS headline,
  DROP COLUMN IF EXISTS avatar_url;

DROP TYPE IF EXISTS certificate_status_enum;
DROP TYPE IF EXISTS quiz_attempt_status_enum;
DROP TYPE IF EXISTS quiz_question_type_enum;
DROP TYPE IF EXISTS enrollment_status_enum;
DROP TYPE IF EXISTS lesson_type_enum;
DROP TYPE IF EXISTS course_status_enum;
DROP TYPE IF EXISTS course_level_enum;

-- +goose StatementEnd
