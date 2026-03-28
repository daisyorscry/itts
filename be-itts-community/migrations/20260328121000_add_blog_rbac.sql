-- +goose Up
-- +goose StatementBegin

INSERT INTO resources (name, description) VALUES
    ('blogs', 'Blog post management'),
    ('blog_submissions', 'Blog submission review management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO actions (name, description) VALUES
    ('publish', 'Publish resource'),
    ('review', 'Review resource')
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
    (r.name = 'blogs' AND a.name IN ('create', 'read', 'update', 'delete', 'list', 'publish')) OR
    (r.name = 'blog_submissions' AND a.name IN ('read', 'list', 'review'))
)
ON CONFLICT (resource_id, action_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name IN (
    'blogs:create',
    'blogs:read',
    'blogs:update',
    'blogs:delete',
    'blogs:list',
    'blogs:publish',
    'blog_submissions:read',
    'blog_submissions:list',
    'blog_submissions:review'
)
WHERE roles.name IN ('super_admin', 'admin', 'content_manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions WHERE name IN (
        'blogs:create',
        'blogs:read',
        'blogs:update',
        'blogs:delete',
        'blogs:list',
        'blogs:publish',
        'blog_submissions:read',
        'blog_submissions:list',
        'blog_submissions:review'
    )
);

DELETE FROM permissions
WHERE name IN (
    'blogs:create',
    'blogs:read',
    'blogs:update',
    'blogs:delete',
    'blogs:list',
    'blogs:publish',
    'blog_submissions:read',
    'blog_submissions:list',
    'blog_submissions:review'
);

DELETE FROM actions WHERE name IN ('publish', 'review');
DELETE FROM resources WHERE name IN ('blogs', 'blog_submissions');

-- +goose StatementEnd
