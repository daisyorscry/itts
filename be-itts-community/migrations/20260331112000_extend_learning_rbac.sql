-- +goose Up
-- +goose StatementBegin

INSERT INTO resources (name, description) VALUES
    ('assignments', 'Learning assignment management'),
    ('assignment_submissions', 'Learning assignment submission management'),
    ('learning_analytics', 'Learning analytics access')
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
    (r.name = 'assignments' AND a.name IN ('create', 'read', 'update', 'delete', 'list')) OR
    (r.name = 'assignment_submissions' AND a.name IN ('create', 'read', 'update', 'list', 'grade')) OR
    (r.name = 'learning_analytics' AND a.name IN ('read', 'list'))
)
ON CONFLICT (resource_id, action_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'assignments:create',
    'assignments:read',
    'assignments:update',
    'assignments:delete',
    'assignments:list',
    'assignment_submissions:create',
    'assignment_submissions:read',
    'assignment_submissions:update',
    'assignment_submissions:list',
    'assignment_submissions:grade',
    'learning_analytics:read',
    'learning_analytics:list'
)
WHERE roles.name IN ('super_admin', 'admin', 'instructor')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'assignments:create',
    'assignments:read',
    'assignments:update',
    'assignments:delete',
    'assignments:list',
    'assignment_submissions:read',
    'assignment_submissions:list'
)
WHERE roles.name = 'content_manager'
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'assignments:read',
    'assignments:list',
    'assignment_submissions:read',
    'assignment_submissions:list',
    'learning_analytics:read',
    'learning_analytics:list'
)
WHERE roles.name = 'viewer'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions WHERE name IN (
        'assignments:create',
        'assignments:read',
        'assignments:update',
        'assignments:delete',
        'assignments:list',
        'assignment_submissions:create',
        'assignment_submissions:read',
        'assignment_submissions:update',
        'assignment_submissions:list',
        'assignment_submissions:grade',
        'learning_analytics:read',
        'learning_analytics:list'
    )
);

DELETE FROM permissions
WHERE name IN (
    'assignments:create',
    'assignments:read',
    'assignments:update',
    'assignments:delete',
    'assignments:list',
    'assignment_submissions:create',
    'assignment_submissions:read',
    'assignment_submissions:update',
    'assignment_submissions:list',
    'assignment_submissions:grade',
    'learning_analytics:read',
    'learning_analytics:list'
);

DELETE FROM resources
WHERE name IN ('assignments', 'assignment_submissions', 'learning_analytics');

-- +goose StatementEnd
