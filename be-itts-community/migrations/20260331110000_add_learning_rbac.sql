-- +goose Up
-- +goose StatementBegin

INSERT INTO resources (name, description) VALUES
    ('courses', 'Learning course management'),
    ('course_sections', 'Learning course section management'),
    ('lessons', 'Learning lesson management'),
    ('course_enrollments', 'Learning course enrollment management'),
    ('lesson_progress', 'Learning lesson progress management'),
    ('quizzes', 'Learning quiz management'),
    ('course_certificates', 'Learning certificate management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO actions (name, description) VALUES
    ('publish', 'Publish resource'),
    ('enroll', 'Enroll into resource'),
    ('grade', 'Grade resource'),
    ('issue', 'Issue resource')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (id, resource_id, action_id, name, description)
SELECT
    gen_random_uuid(),
    r.id,
    a.id,
    r.name || ':' || a.name,
    'Permission to ' || a.description || ' on ' || r.description
FROM resources r
JOIN actions a ON (
    (r.name = 'courses' AND a.name IN ('create', 'read', 'update', 'delete', 'list', 'publish')) OR
    (r.name = 'course_sections' AND a.name IN ('create', 'read', 'update', 'delete', 'list')) OR
    (r.name = 'lessons' AND a.name IN ('create', 'read', 'update', 'delete', 'list', 'publish')) OR
    (r.name = 'course_enrollments' AND a.name IN ('read', 'list', 'enroll', 'update')) OR
    (r.name = 'lesson_progress' AND a.name IN ('read', 'list', 'update')) OR
    (r.name = 'quizzes' AND a.name IN ('create', 'read', 'update', 'delete', 'list', 'grade')) OR
    (r.name = 'course_certificates' AND a.name IN ('read', 'list', 'issue'))
)
ON CONFLICT (resource_id, action_id) DO NOTHING;

INSERT INTO roles (name, description, is_system) VALUES
    ('instructor', 'Learning instructor with course delivery permissions', true)
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:list',
    'courses:publish',
    'course_sections:create',
    'course_sections:read',
    'course_sections:update',
    'course_sections:delete',
    'course_sections:list',
    'lessons:create',
    'lessons:read',
    'lessons:update',
    'lessons:delete',
    'lessons:list',
    'lessons:publish',
    'course_enrollments:read',
    'course_enrollments:list',
    'course_enrollments:enroll',
    'course_enrollments:update',
    'lesson_progress:read',
    'lesson_progress:list',
    'lesson_progress:update',
    'quizzes:create',
    'quizzes:read',
    'quizzes:update',
    'quizzes:delete',
    'quizzes:list',
    'quizzes:grade',
    'course_certificates:read',
    'course_certificates:list',
    'course_certificates:issue'
)
WHERE roles.name IN ('super_admin', 'admin', 'instructor')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:list',
    'courses:publish',
    'course_sections:create',
    'course_sections:read',
    'course_sections:update',
    'course_sections:delete',
    'course_sections:list',
    'lessons:create',
    'lessons:read',
    'lessons:update',
    'lessons:delete',
    'lessons:list',
    'lessons:publish',
    'quizzes:create',
    'quizzes:read',
    'quizzes:update',
    'quizzes:delete',
    'quizzes:list',
    'quizzes:grade',
    'course_certificates:read',
    'course_certificates:list',
    'course_certificates:issue'
)
WHERE roles.name = 'content_manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'courses:read',
    'courses:list',
    'course_sections:read',
    'course_sections:list',
    'lessons:read',
    'lessons:list',
    'course_enrollments:read',
    'course_enrollments:list',
    'lesson_progress:read',
    'lesson_progress:list',
    'quizzes:read',
    'quizzes:list',
    'course_certificates:read',
    'course_certificates:list'
)
WHERE roles.name = 'viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions WHERE name IN (
        'courses:create',
        'courses:read',
        'courses:update',
        'courses:delete',
        'courses:list',
        'courses:publish',
        'course_sections:create',
        'course_sections:read',
        'course_sections:update',
        'course_sections:delete',
        'course_sections:list',
        'lessons:create',
        'lessons:read',
        'lessons:update',
        'lessons:delete',
        'lessons:list',
        'lessons:publish',
        'course_enrollments:read',
        'course_enrollments:list',
        'course_enrollments:enroll',
        'course_enrollments:update',
        'lesson_progress:read',
        'lesson_progress:list',
        'lesson_progress:update',
        'quizzes:create',
        'quizzes:read',
        'quizzes:update',
        'quizzes:delete',
        'quizzes:list',
        'quizzes:grade',
        'course_certificates:read',
        'course_certificates:list',
        'course_certificates:issue'
    )
);

DELETE FROM permissions
WHERE name IN (
    'courses:create',
    'courses:read',
    'courses:update',
    'courses:delete',
    'courses:list',
    'courses:publish',
    'course_sections:create',
    'course_sections:read',
    'course_sections:update',
    'course_sections:delete',
    'course_sections:list',
    'lessons:create',
    'lessons:read',
    'lessons:update',
    'lessons:delete',
    'lessons:list',
    'lessons:publish',
    'course_enrollments:read',
    'course_enrollments:list',
    'course_enrollments:enroll',
    'course_enrollments:update',
    'lesson_progress:read',
    'lesson_progress:list',
    'lesson_progress:update',
    'quizzes:create',
    'quizzes:read',
    'quizzes:update',
    'quizzes:delete',
    'quizzes:list',
    'quizzes:grade',
    'course_certificates:read',
    'course_certificates:list',
    'course_certificates:issue'
);

DELETE FROM roles WHERE name = 'instructor';

DELETE FROM actions WHERE name IN ('issue', 'grade', 'enroll');

DELETE FROM resources
WHERE name IN (
    'courses',
    'course_sections',
    'lessons',
    'course_enrollments',
    'lesson_progress',
    'quizzes',
    'course_certificates'
);

-- +goose StatementEnd
