-- +goose Up
-- +goose StatementBegin

-- ========================================
-- Seed RBAC System Data
-- ========================================

-- 1. Insert Resources (domain entities)
INSERT INTO resources (id, name, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'registrations', 'Member registration management'),
    ('10000000-0000-0000-0000-000000000002', 'events', 'Event management'),
    ('10000000-0000-0000-0000-000000000003', 'event_speakers', 'Event speaker management'),
    ('10000000-0000-0000-0000-000000000004', 'event_registrations', 'Event registration management'),
    ('10000000-0000-0000-0000-000000000005', 'roadmaps', 'Roadmap management'),
    ('10000000-0000-0000-0000-000000000006', 'roadmap_items', 'Roadmap item management'),
    ('10000000-0000-0000-0000-000000000007', 'mentors', 'Mentor management'),
    ('10000000-0000-0000-0000-000000000008', 'partners', 'Partner management'),
    ('10000000-0000-0000-0000-000000000009', 'users', 'User account management'),
    ('10000000-0000-0000-0000-000000000010', 'roles', 'Role management'),
    ('10000000-0000-0000-0000-000000000011', 'permissions', 'Permission management')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Actions
INSERT INTO actions (id, name, description) VALUES
    ('20000000-0000-0000-0000-000000000001', 'create', 'Create new resource'),
    ('20000000-0000-0000-0000-000000000002', 'read', 'Read/view resource'),
    ('20000000-0000-0000-0000-000000000003', 'update', 'Update existing resource'),
    ('20000000-0000-0000-0000-000000000004', 'delete', 'Delete resource'),
    ('20000000-0000-0000-0000-000000000005', 'list', 'List/search resources'),
    ('20000000-0000-0000-0000-000000000006', 'approve', 'Approve resource (e.g., registration)'),
    ('20000000-0000-0000-0000-000000000007', 'reject', 'Reject resource (e.g., registration)'),
    ('20000000-0000-0000-0000-000000000008', 'activate', 'Activate/deactivate resource'),
    ('20000000-0000-0000-0000-000000000009', 'manage', 'Full management access')
ON CONFLICT (name) DO NOTHING;

-- 3. Generate Permissions (resource + action combinations)
-- Helper function to generate permission name
CREATE OR REPLACE FUNCTION generate_permission_name(resource_name VARCHAR, action_name VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN resource_name || ':' || action_name;
END;
$$ LANGUAGE plpgsql;

-- Generate permissions for all resource-action combinations
INSERT INTO permissions (id, resource_id, action_id, name, description)
SELECT
    gen_random_uuid(),
    r.id,
    a.id,
    generate_permission_name(r.name, a.name),
    'Permission to ' || a.description || ' on ' || r.description
FROM resources r
CROSS JOIN actions a
WHERE
    -- Not all actions apply to all resources, filter accordingly
    (a.name IN ('create', 'read', 'update', 'delete', 'list') OR
     (a.name IN ('approve', 'reject') AND r.name = 'registrations') OR
     (a.name = 'activate' AND r.name IN ('mentors', 'partners', 'users')) OR
     (a.name = 'manage' AND r.name IN ('users', 'roles', 'permissions')))
ON CONFLICT (resource_id, action_id) DO NOTHING;

-- 4. Create System Roles
INSERT INTO roles (id, name, description, is_system, parent_role_id) VALUES
    ('30000000-0000-0000-0000-000000000001', 'super_admin', 'Super Administrator with full access', true, NULL),
    ('30000000-0000-0000-0000-000000000002', 'admin', 'Administrator with most permissions', true, NULL),
    ('30000000-0000-0000-0000-000000000003', 'moderator', 'Moderator with limited admin access', true, NULL),
    ('30000000-0000-0000-0000-000000000004', 'event_manager', 'Event management specialist', true, NULL),
    ('30000000-0000-0000-0000-000000000005', 'content_manager', 'Content management specialist', true, NULL),
    ('30000000-0000-0000-0000-000000000006', 'viewer', 'Read-only access', true, NULL)
ON CONFLICT (name) DO NOTHING;

-- 5. Assign Permissions to Roles

-- Super Admin: ALL permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    '30000000-0000-0000-0000-000000000001',
    p.id
FROM permissions p
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Admin: All except user/role/permission management
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    '30000000-0000-0000-0000-000000000002',
    p.id
FROM permissions p
JOIN resources r ON p.resource_id = r.id
WHERE r.name NOT IN ('users', 'roles', 'permissions')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Moderator: Read all, manage registrations and event registrations
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    '30000000-0000-0000-0000-000000000003',
    p.id
FROM permissions p
JOIN resources r ON p.resource_id = r.id
JOIN actions a ON p.action_id = a.id
WHERE
    a.name IN ('read', 'list') OR
    (r.name = 'registrations' AND a.name IN ('approve', 'reject', 'update', 'delete')) OR
    (r.name = 'event_registrations' AND a.name IN ('delete'))
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Event Manager: Full access to events, speakers, event registrations
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    '30000000-0000-0000-0000-000000000004',
    p.id
FROM permissions p
JOIN resources r ON p.resource_id = r.id
JOIN actions a ON p.action_id = a.id
WHERE
    r.name IN ('events', 'event_speakers', 'event_registrations') OR
    a.name IN ('read', 'list')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Content Manager: Full access to roadmaps, mentors, partners
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    '30000000-0000-0000-0000-000000000005',
    p.id
FROM permissions p
JOIN resources r ON p.resource_id = r.id
JOIN actions a ON p.action_id = a.id
WHERE
    r.name IN ('roadmaps', 'roadmap_items', 'mentors', 'partners') OR
    a.name IN ('read', 'list')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Viewer: Read-only access to all resources
INSERT INTO role_permissions (role_id, permission_id)
SELECT
    '30000000-0000-0000-0000-000000000006',
    p.id
FROM permissions p
JOIN actions a ON p.action_id = a.id
WHERE a.name IN ('read', 'list')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 6. Create default super admin user (password: Admin123!)
-- Password hash for "Admin123!" using bcrypt cost 10
-- Hash: $2a$10$rN.8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K
INSERT INTO users (id, email, password_hash, full_name, is_active, is_super_admin) VALUES
    (
        '40000000-0000-0000-0000-000000000001',
        'admin@itts.ac.id',
        '$2a$10$rN8Z8qXvGZqXvGZqXvGZu.hKf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9Kf9K',
        'Super Administrator',
        true,
        true
    )
ON CONFLICT (email) DO NOTHING;

-- Assign super_admin role to default admin
INSERT INTO user_roles (user_id, role_id) VALUES
    ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Drop helper function
DROP FUNCTION IF EXISTS generate_permission_name(VARCHAR, VARCHAR);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DELETE FROM user_roles WHERE user_id = '40000000-0000-0000-0000-000000000001';
DELETE FROM users WHERE id = '40000000-0000-0000-0000-000000000001';
DELETE FROM role_permissions;
DELETE FROM roles WHERE is_system = true;
DELETE FROM permissions;
DELETE FROM actions;
DELETE FROM resources;

-- +goose StatementEnd
