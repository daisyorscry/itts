package model

import "time"

type CreateBlogPostRequest struct {
	Slug          string         `json:"slug" validate:"required,min=3,max=255"`
	Title         string         `json:"title" validate:"required,min=3,max=255"`
	Excerpt       string         `json:"excerpt"`
	ContentJSON   map[string]any `json:"content_json" validate:"required"`
	CoverImageURL string         `json:"cover_image_url"`
	Category      BlogCategory   `json:"category" validate:"required,oneof=Programming DevSecOps Networking Career Community"`
	AuthorName    string         `json:"author_name" validate:"required,min=2,max=255"`
	AuthorEmail   string         `json:"author_email" validate:"required,email"`
	AuthorRole    string         `json:"author_role"`
	Status        BlogPostStatus `json:"status" validate:"omitempty,oneof=draft in_review published rejected archived"`
}

type CreateBlogReviewRequest struct {
	Slug          string         `json:"slug" validate:"required,min=3,max=255"`
	Title         string         `json:"title" validate:"required,min=3,max=255"`
	Excerpt       string         `json:"excerpt"`
	ContentJSON   map[string]any `json:"content_json" validate:"required"`
	CoverImageURL string         `json:"cover_image_url"`
	Category      BlogCategory   `json:"category" validate:"required,oneof=Programming DevSecOps Networking Career Community"`
	AuthorName    string         `json:"author_name" validate:"required,min=2,max=255"`
	AuthorEmail   string         `json:"author_email" validate:"omitempty,email"`
	AuthorRole    string         `json:"author_role"`
}

type UpdateBlogPostRequest struct {
	Slug          *string         `json:"slug,omitempty" validate:"omitempty,min=3,max=255"`
	Title         *string         `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Excerpt       *string         `json:"excerpt,omitempty"`
	ContentJSON   map[string]any  `json:"content_json,omitempty"`
	CoverImageURL *string         `json:"cover_image_url,omitempty"`
	Category      *BlogCategory   `json:"category,omitempty" validate:"omitempty,oneof=Programming DevSecOps Networking Career Community"`
	AuthorName    *string         `json:"author_name,omitempty" validate:"omitempty,min=2,max=255"`
	AuthorEmail   *string         `json:"author_email,omitempty" validate:"omitempty,email"`
	AuthorRole    *string         `json:"author_role,omitempty"`
	Status        *BlogPostStatus `json:"status,omitempty" validate:"omitempty,oneof=draft in_review published rejected archived"`
}

type UpdateBlogPostStatusRequest struct {
	Status BlogPostStatus `json:"status" validate:"required,oneof=draft in_review published rejected archived"`
}

type BlogPostResponse struct {
	ID            string         `json:"id"`
	Slug          string         `json:"slug"`
	Title         string         `json:"title"`
	Excerpt       string         `json:"excerpt"`
	ContentJSON   map[string]any `json:"content_json"`
	CoverImageURL string         `json:"cover_image_url"`
	Category      BlogCategory   `json:"category"`
	AuthorName    string         `json:"author_name"`
	AuthorEmail   string         `json:"author_email"`
	AuthorRole    string         `json:"author_role"`
	Status        BlogPostStatus `json:"status"`
	PublishedAt   *time.Time     `json:"published_at,omitempty"`
	CreatedBy     *string        `json:"created_by,omitempty"`
	UpdatedBy     *string        `json:"updated_by,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
}

type BlogPostListResponse struct {
	Data       []BlogPostResponse `json:"data"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	PageSize   int                `json:"page_size"`
	TotalPages int                `json:"total_pages"`
}

func (r CreateBlogPostRequest) ToModel() BlogPost {
	post := BlogPost{
		Slug:        r.Slug,
		Title:       r.Title,
		ContentJSON: BlogContent(cloneJSONMap(r.ContentJSON)),
		Category:    r.Category,
		AuthorName:  r.AuthorName,
		AuthorEmail: r.AuthorEmail,
		Status:      BlogPostStatusDraft,
	}
	if r.Status != "" {
		post.Status = r.Status
	}
	if r.Excerpt != "" {
		post.Excerpt = strPtr(r.Excerpt)
	}
	if r.CoverImageURL != "" {
		post.CoverImageURL = strPtr(r.CoverImageURL)
	}
	if r.AuthorRole != "" {
		post.AuthorRole = strPtr(r.AuthorRole)
	}
	return post
}

func (r CreateBlogReviewRequest) ToReviewModel() BlogPost {
	post := BlogPost{
		Slug:        r.Slug,
		Title:       r.Title,
		ContentJSON: BlogContent(cloneJSONMap(r.ContentJSON)),
		Category:    r.Category,
		AuthorName:  r.AuthorName,
		AuthorEmail: r.AuthorEmail,
		Status:      BlogPostStatusInReview,
	}
	if r.Excerpt != "" {
		post.Excerpt = strPtr(r.Excerpt)
	}
	if r.CoverImageURL != "" {
		post.CoverImageURL = strPtr(r.CoverImageURL)
	}
	if r.AuthorRole != "" {
		post.AuthorRole = strPtr(r.AuthorRole)
	}
	return post
}

func BlogPostToResponse(post BlogPost) BlogPostResponse {
	return BlogPostResponse{
		ID:            post.ID,
		Slug:          post.Slug,
		Title:         post.Title,
		Excerpt:       derefString(post.Excerpt),
		ContentJSON:   cloneJSONMap(map[string]any(post.ContentJSON)),
		CoverImageURL: derefString(post.CoverImageURL),
		Category:      post.Category,
		AuthorName:    post.AuthorName,
		AuthorEmail:   post.AuthorEmail,
		AuthorRole:    derefString(post.AuthorRole),
		Status:        post.Status,
		PublishedAt:   post.PublishedAt,
		CreatedBy:     post.CreatedBy,
		UpdatedBy:     post.UpdatedBy,
		CreatedAt:     post.CreatedAt,
		UpdatedAt:     post.UpdatedAt,
	}
}

func cloneJSONMap(in map[string]any) map[string]any {
	if in == nil {
		return map[string]any{}
	}
	out := make(map[string]any, len(in))
	for key, value := range in {
		out[key] = value
	}
	return out
}

func CloneBlogContent(in map[string]any) BlogContent {
	return BlogContent(cloneJSONMap(in))
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func strPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}
