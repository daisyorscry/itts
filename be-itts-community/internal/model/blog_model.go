package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type BlogContent map[string]any

func (c BlogContent) Value() (driver.Value, error) {
	if c == nil {
		return []byte(`{}`), nil
	}

	raw, err := json.Marshal(c)
	if err != nil {
		return nil, err
	}

	return raw, nil
}

func (c *BlogContent) Scan(value any) error {
	if value == nil {
		*c = BlogContent{}
		return nil
	}

	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type *model.BlogContent", value)
	}

	if len(raw) == 0 {
		*c = BlogContent{}
		return nil
	}

	var out map[string]any
	if err := json.Unmarshal(raw, &out); err != nil {
		return err
	}

	*c = BlogContent(out)
	return nil
}

type BlogCategory string

const (
	BlogCategoryProgramming BlogCategory = "Programming"
	BlogCategoryDevSecOps   BlogCategory = "DevSecOps"
	BlogCategoryNetworking  BlogCategory = "Networking"
	BlogCategoryCareer      BlogCategory = "Career"
	BlogCategoryCommunity   BlogCategory = "Community"
)

type BlogPostStatus string

const (
	BlogPostStatusDraft     BlogPostStatus = "draft"
	BlogPostStatusInReview  BlogPostStatus = "in_review"
	BlogPostStatusPublished BlogPostStatus = "published"
	BlogPostStatusRejected  BlogPostStatus = "rejected"
	BlogPostStatusArchived  BlogPostStatus = "archived"
)

type BlogPost struct {
	ID            string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Slug          string `gorm:"not null;uniqueIndex"`
	Title         string `gorm:"not null"`
	Excerpt       *string
	ContentJSON   BlogContent `gorm:"type:jsonb;not null"`
	CoverImageURL *string
	Category      BlogCategory `gorm:"type:blog_category_enum;not null;index"`
	AuthorName    string       `gorm:"not null"`
	AuthorEmail   string       `gorm:"type:citext;not null"`
	AuthorRole    *string
	Status        BlogPostStatus `gorm:"type:blog_post_status_enum;not null;default:'draft';index"`
	PublishedAt   *time.Time
	CreatedBy     *string `gorm:"type:uuid"`
	UpdatedBy     *string `gorm:"type:uuid"`
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func (BlogPost) TableName() string { return "blog_posts" }
