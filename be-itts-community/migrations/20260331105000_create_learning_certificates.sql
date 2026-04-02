-- +goose Up
-- +goose StatementBegin

CREATE TABLE IF NOT EXISTS course_certificates (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id          UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certificate_number VARCHAR(100) NOT NULL UNIQUE,
  status             certificate_status_enum NOT NULL DEFAULT 'issued',
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at         TIMESTAMPTZ,
  template_name      VARCHAR(100),
  metadata           JSONB,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (course_id, user_id)
);

CREATE INDEX IF NOT EXISTS ix_course_certificates_user ON course_certificates (user_id, issued_at DESC);
CREATE INDEX IF NOT EXISTS ix_course_certificates_course_status ON course_certificates (course_id, status);

CREATE TRIGGER trg_course_certificates_updated
BEFORE UPDATE ON course_certificates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TRIGGER IF EXISTS trg_course_certificates_updated ON course_certificates;
DROP INDEX IF EXISTS ix_course_certificates_course_status;
DROP INDEX IF EXISTS ix_course_certificates_user;
DROP TABLE IF EXISTS course_certificates;

-- +goose StatementEnd
