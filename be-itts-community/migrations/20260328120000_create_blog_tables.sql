-- +goose Up
-- +goose StatementBegin

CREATE TYPE blog_category_enum AS ENUM (
    'Programming',
    'DevSecOps',
    'Networking',
    'Career',
    'Community'
);

CREATE TYPE blog_post_status_enum AS ENUM (
    'draft',
    'published',
    'archived'
);

CREATE TYPE blog_submission_status_enum AS ENUM (
    'submitted',
    'in_review',
    'approved',
    'rejected'
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content_json JSONB NOT NULL,
    cover_image_url TEXT,
    category blog_category_enum NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_email CITEXT NOT NULL,
    author_role VARCHAR(255),
    status blog_post_status_enum NOT NULL DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_created_at ON blog_posts(created_at DESC);

CREATE TABLE IF NOT EXISTS blog_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content_json JSONB NOT NULL,
    cover_image_url TEXT,
    category blog_category_enum NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    author_email CITEXT NOT NULL,
    author_role VARCHAR(255),
    status blog_submission_status_enum NOT NULL DEFAULT 'submitted',
    review_notes TEXT,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    published_post_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_submissions_status ON blog_submissions(status);
CREATE INDEX idx_blog_submissions_category ON blog_submissions(category);
CREATE INDEX idx_blog_submissions_submitted_by ON blog_submissions(submitted_by);
CREATE INDEX idx_blog_submissions_created_at ON blog_submissions(created_at DESC);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin

DROP TABLE IF EXISTS blog_submissions;
DROP TABLE IF EXISTS blog_posts;
DROP TYPE IF EXISTS blog_submission_status_enum;
DROP TYPE IF EXISTS blog_post_status_enum;
DROP TYPE IF EXISTS blog_category_enum;

-- +goose StatementEnd
