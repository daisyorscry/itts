-- +goose NO TRANSACTION
-- +goose Up

ALTER TYPE blog_post_status_enum ADD VALUE IF NOT EXISTS 'in_review';
ALTER TYPE blog_post_status_enum ADD VALUE IF NOT EXISTS 'rejected';

INSERT INTO permissions (id, resource_id, action_id, name, description)
SELECT
    gen_random_uuid(),
    r.id,
    a.id,
    r.name || ':' || a.name,
    'Permission to ' || a.description || ' on ' || r.description
FROM resources r
JOIN actions a ON r.name = 'blogs' AND a.name = 'review'
ON CONFLICT (resource_id, action_id) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT
    roles.id,
    permissions.id
FROM roles
JOIN permissions ON permissions.name = 'blogs:review'
WHERE roles.name IN ('super_admin', 'admin', 'content_manager')
ON CONFLICT (role_id, permission_id) DO NOTHING;

INSERT INTO blog_posts (
    slug,
    title,
    excerpt,
    content_json,
    cover_image_url,
    category,
    author_name,
    author_email,
    author_role,
    status,
    published_at,
    created_by,
    updated_by,
    created_at,
    updated_at
)
SELECT
    submissions.slug,
    submissions.title,
    submissions.excerpt,
    submissions.content_json,
    submissions.cover_image_url,
    submissions.category,
    submissions.author_name,
    submissions.author_email,
    submissions.author_role,
    CASE
        WHEN submissions.status = 'rejected' THEN 'rejected'::blog_post_status_enum
        WHEN submissions.status = 'approved' THEN 'draft'::blog_post_status_enum
        ELSE 'in_review'::blog_post_status_enum
    END,
    NULL,
    submissions.submitted_by,
    submissions.reviewed_by,
    submissions.created_at,
    submissions.updated_at
FROM blog_submissions submissions
WHERE submissions.published_post_id IS NULL
ON CONFLICT (slug) DO NOTHING;

DELETE FROM role_permissions
WHERE permission_id IN (
    SELECT id FROM permissions
    WHERE name IN (
        'blog_submissions:read',
        'blog_submissions:list',
        'blog_submissions:review'
    )
);

DELETE FROM permissions
WHERE name IN (
    'blog_submissions:read',
    'blog_submissions:list',
    'blog_submissions:review'
);

DELETE FROM resources WHERE name = 'blog_submissions';

DROP TABLE IF EXISTS blog_submissions;
DROP TYPE IF EXISTS blog_submission_status_enum;

-- +goose Down

SELECT 1;
