-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS courses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              VARCHAR(255) NOT NULL UNIQUE,
  title             VARCHAR(255) NOT NULL,
  subtitle          TEXT,
  description       TEXT,
  thumbnail_url     TEXT,
  program           program_enum,
  level             course_level_enum NOT NULL,
  status            course_status_enum NOT NULL DEFAULT 'draft',
  estimated_minutes INTEGER NOT NULL DEFAULT 0 CHECK (estimated_minutes >= 0),
  is_featured       BOOLEAN NOT NULL DEFAULT FALSE,
  published_at      TIMESTAMPTZ,
  created_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_courses_status ON courses (status);
CREATE INDEX IF NOT EXISTS ix_courses_program ON courses (program);
CREATE INDEX IF NOT EXISTS ix_courses_published_at ON courses (published_at DESC);
CREATE INDEX IF NOT EXISTS ix_courses_created_at ON courses (created_at DESC);

CREATE TRIGGER trg_courses_updated
BEFORE UPDATE ON courses
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS course_sections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, sort_order)
);

CREATE INDEX IF NOT EXISTS ix_course_sections_course ON course_sections (course_id, sort_order);

CREATE TRIGGER trg_course_sections_updated
BEFORE UPDATE ON course_sections
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS lessons (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_id       UUID NOT NULL REFERENCES course_sections(id) ON DELETE CASCADE,
  slug             VARCHAR(255) NOT NULL,
  title            VARCHAR(255) NOT NULL,
  summary          TEXT,
  content_json     JSONB,
  video_url        TEXT,
  attachment_url   TEXT,
  lesson_type      lesson_type_enum NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  sort_order       INTEGER NOT NULL DEFAULT 0,
  is_preview       BOOLEAN NOT NULL DEFAULT FALSE,
  is_published     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, slug),
  UNIQUE (section_id, sort_order)
);

CREATE INDEX IF NOT EXISTS ix_lessons_course_section ON lessons (course_id, section_id);
CREATE INDEX IF NOT EXISTS ix_lessons_course_published ON lessons (course_id, is_published);
CREATE INDEX IF NOT EXISTS ix_lessons_section_order ON lessons (section_id, sort_order);

CREATE TRIGGER trg_lessons_updated
BEFORE UPDATE ON lessons
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS trg_lessons_updated ON lessons;
DROP INDEX IF EXISTS ix_lessons_section_order;
DROP INDEX IF EXISTS ix_lessons_course_published;
DROP INDEX IF EXISTS ix_lessons_course_section;
DROP TABLE IF EXISTS lessons;

DROP TRIGGER IF EXISTS trg_course_sections_updated ON course_sections;
DROP INDEX IF EXISTS ix_course_sections_course;
DROP TABLE IF EXISTS course_sections;

DROP TRIGGER IF EXISTS trg_courses_updated ON courses;
DROP INDEX IF EXISTS ix_courses_created_at;
DROP INDEX IF EXISTS ix_courses_published_at;
DROP INDEX IF EXISTS ix_courses_program;
DROP INDEX IF EXISTS ix_courses_status;
DROP TABLE IF EXISTS courses;

-- +goose StatementEnd
