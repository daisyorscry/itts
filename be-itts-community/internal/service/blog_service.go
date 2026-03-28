package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

type blogService struct {
	repo   repository.BlogRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *blogService) ListPublicPosts(ctx context.Context, p repository.ListParams) (model.BlogPostListResponse, error) {
	result, err := s.repo.ListPublicPosts(ctx, p)
	if err != nil {
		return model.BlogPostListResponse{}, core.InternalServerError("failed to list blog posts").WithError(err)
	}
	return blogPostListToResponse(*result), nil
}

func (s *blogService) GetPublicPostBySlug(ctx context.Context, slug string) (model.BlogPostResponse, error) {
	post, err := s.repo.GetPostBySlug(ctx, strings.TrimSpace(slug))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.BlogPostResponse{}, core.NotFound("blog post", slug)
		}
		return model.BlogPostResponse{}, core.InternalServerError("failed to fetch blog post").WithError(err)
	}
	if post.Status != model.BlogPostStatusPublished {
		return model.BlogPostResponse{}, core.NotFound("blog post", slug)
	}
	return model.BlogPostToResponse(*post), nil
}

func (s *blogService) CreateReviewPost(ctx context.Context, authCtx *model.AuthContext, req model.CreateBlogReviewRequest) (model.BlogPostResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "BlogService.CreateReviewPost")()
	}

	req.Slug = strings.TrimSpace(req.Slug)
	req.Title = strings.TrimSpace(req.Title)
	req.AuthorName = strings.TrimSpace(req.AuthorName)
	req.AuthorRole = strings.TrimSpace(req.AuthorRole)
	req.AuthorEmail = strings.TrimSpace(req.AuthorEmail)
	if req.AuthorEmail == "" && authCtx != nil {
		req.AuthorEmail = strings.TrimSpace(authCtx.Email)
	}

	if err := validator.Validate(req); err != nil {
		return model.BlogPostResponse{}, core.ValidationError(err)
	}
	if err := validateBlogContent(req.ContentJSON); err != nil {
		return model.BlogPostResponse{}, err
	}
	if err := s.ensureUniqueSlug(ctx, req.Slug, nil); err != nil {
		return model.BlogPostResponse{}, err
	}

	post := req.ToReviewModel()
	if authCtx != nil && authCtx.UserID != "" {
		post.CreatedBy = &authCtx.UserID
		post.UpdatedBy = &authCtx.UserID
	}

	if err := s.createPostWithLock(ctx, "lock:blog-posts:create-review", &post); err != nil {
		return model.BlogPostResponse{}, err
	}

	created, err := s.repo.GetPostByID(ctx, post.ID)
	if err != nil {
		return model.BlogPostResponse{}, core.InternalServerError("failed to load blog post").WithError(err)
	}
	return model.BlogPostToResponse(*created), nil
}

func (s *blogService) ListMyPosts(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.BlogPostListResponse, error) {
	if authCtx == nil || authCtx.UserID == "" {
		return model.BlogPostListResponse{}, core.Unauthorized("authentication required")
	}
	result, err := s.repo.ListPostsByUser(ctx, authCtx.UserID, p)
	if err != nil {
		return model.BlogPostListResponse{}, core.InternalServerError("failed to list blog posts").WithError(err)
	}
	return blogPostListToResponse(*result), nil
}

func (s *blogService) ListPosts(ctx context.Context, p repository.ListParams) (model.BlogPostListResponse, error) {
	result, err := s.repo.ListPosts(ctx, p)
	if err != nil {
		return model.BlogPostListResponse{}, core.InternalServerError("failed to list blog posts").WithError(err)
	}
	return blogPostListToResponse(*result), nil
}

func (s *blogService) CreatePost(ctx context.Context, authCtx *model.AuthContext, req model.CreateBlogPostRequest) (model.BlogPostResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "BlogService.CreatePost")()
	}

	req.Slug = strings.TrimSpace(req.Slug)
	req.Title = strings.TrimSpace(req.Title)
	req.AuthorName = strings.TrimSpace(req.AuthorName)
	req.AuthorEmail = strings.TrimSpace(req.AuthorEmail)
	req.AuthorRole = strings.TrimSpace(req.AuthorRole)

	if err := validator.Validate(req); err != nil {
		return model.BlogPostResponse{}, core.ValidationError(err)
	}
	if err := validateBlogContent(req.ContentJSON); err != nil {
		return model.BlogPostResponse{}, err
	}
	if err := s.ensureUniqueSlug(ctx, req.Slug, nil); err != nil {
		return model.BlogPostResponse{}, err
	}

	post := req.ToModel()
	if authCtx != nil && authCtx.UserID != "" {
		post.CreatedBy = &authCtx.UserID
		post.UpdatedBy = &authCtx.UserID
	}
	now := time.Now()
	if post.Status == model.BlogPostStatusPublished {
		post.PublishedAt = &now
	}

	if err := s.createPostWithLock(ctx, "lock:blog-posts:create", &post); err != nil {
		return model.BlogPostResponse{}, err
	}

	created, err := s.repo.GetPostByID(ctx, post.ID)
	if err != nil {
		return model.BlogPostResponse{}, core.InternalServerError("failed to load blog post").WithError(err)
	}
	return model.BlogPostToResponse(*created), nil
}

func (s *blogService) createPostWithLock(ctx context.Context, lockKey string, post *model.BlogPost) error {
	if err := s.locker.WithLock(ctx, lockKey, 10*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.CreatePost(txCtx, post)
		})
	}); err != nil {
		return core.InternalServerError("failed to create blog post").WithError(err)
	}
	return nil
}

func (s *blogService) GetPost(ctx context.Context, id string) (model.BlogPostResponse, error) {
	post, err := s.repo.GetPostByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.BlogPostResponse{}, core.NotFound("blog post", id)
		}
		return model.BlogPostResponse{}, core.InternalServerError("failed to fetch blog post").WithError(err)
	}
	return model.BlogPostToResponse(*post), nil
}

func (s *blogService) UpdatePost(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateBlogPostRequest) (model.BlogPostResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "BlogService.UpdatePost")()
	}

	if err := validator.Validate(req); err != nil {
		return model.BlogPostResponse{}, core.ValidationError(err)
	}
	if len(req.ContentJSON) > 0 {
		if err := validateBlogContent(req.ContentJSON); err != nil {
			return model.BlogPostResponse{}, err
		}
	}

	post, err := s.repo.GetPostByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.BlogPostResponse{}, core.NotFound("blog post", id)
		}
		return model.BlogPostResponse{}, core.InternalServerError("failed to fetch blog post").WithError(err)
	}

	if req.Slug != nil {
		slug := strings.TrimSpace(*req.Slug)
		if slug == "" {
			return model.BlogPostResponse{}, core.BadRequest("slug is required")
		}
		if err := s.ensureUniqueSlug(ctx, slug, &id); err != nil {
			return model.BlogPostResponse{}, err
		}
		post.Slug = slug
	}
	if req.Title != nil {
		post.Title = strings.TrimSpace(*req.Title)
	}
	if req.Excerpt != nil {
		post.Excerpt = req.Excerpt
	}
	if len(req.ContentJSON) > 0 {
		post.ContentJSON = model.CloneBlogContent(req.ContentJSON)
	}
	if req.CoverImageURL != nil {
		post.CoverImageURL = req.CoverImageURL
	}
	if req.Category != nil {
		post.Category = *req.Category
	}
	if req.AuthorName != nil {
		post.AuthorName = strings.TrimSpace(*req.AuthorName)
	}
	if req.AuthorEmail != nil {
		post.AuthorEmail = strings.TrimSpace(*req.AuthorEmail)
	}
	if req.AuthorRole != nil {
		post.AuthorRole = req.AuthorRole
	}
	if req.Status != nil {
		post.Status = *req.Status
	}
	applyPublishedState(post)
	if authCtx != nil && authCtx.UserID != "" {
		post.UpdatedBy = &authCtx.UserID
	}

	if err := s.savePost(ctx, id, post); err != nil {
		return model.BlogPostResponse{}, err
	}

	updated, err := s.repo.GetPostByID(ctx, id)
	if err != nil {
		return model.BlogPostResponse{}, core.InternalServerError("failed to load blog post").WithError(err)
	}
	return model.BlogPostToResponse(*updated), nil
}

func (s *blogService) UpdatePostStatus(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateBlogPostStatusRequest) (model.BlogPostResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "BlogService.UpdatePostStatus")()
	}

	if err := validator.Validate(req); err != nil {
		return model.BlogPostResponse{}, core.ValidationError(err)
	}

	post, err := s.repo.GetPostByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.BlogPostResponse{}, core.NotFound("blog post", id)
		}
		return model.BlogPostResponse{}, core.InternalServerError("failed to fetch blog post").WithError(err)
	}

	post.Status = req.Status
	applyPublishedState(post)
	if authCtx != nil && authCtx.UserID != "" {
		post.UpdatedBy = &authCtx.UserID
	}

	if err := s.savePost(ctx, id, post); err != nil {
		return model.BlogPostResponse{}, err
	}

	updated, err := s.repo.GetPostByID(ctx, id)
	if err != nil {
		return model.BlogPostResponse{}, core.InternalServerError("failed to load blog post").WithError(err)
	}
	return model.BlogPostToResponse(*updated), nil
}

func applyPublishedState(post *model.BlogPost) {
	now := time.Now()
	if post.Status == model.BlogPostStatusPublished {
		if post.PublishedAt == nil {
			post.PublishedAt = &now
		}
		return
	}
	post.PublishedAt = nil
}

func (s *blogService) savePost(ctx context.Context, id string, post *model.BlogPost) error {
	if err := s.locker.WithLock(ctx, "lock:blog-posts:"+id, 10*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.UpdatePost(txCtx, post)
		})
	}); err != nil {
		return core.InternalServerError("failed to update blog post").WithError(err)
	}
	return nil
}

func (s *blogService) DeletePost(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "BlogService.DeletePost")()
	}
	return s.locker.WithLock(ctx, "lock:blog-posts:"+id, 10*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			if err := s.repo.DeletePost(txCtx, id); err != nil {
				return core.InternalServerError("failed to delete blog post").WithError(err)
			}
			return nil
		})
	})
}

func (s *blogService) ensureUniqueSlug(ctx context.Context, slug string, excludePostID *string) error {
	if slug == "" {
		return core.BadRequest("slug is required")
	}
	exists, err := s.repo.SlugExists(ctx, slug, excludePostID)
	if err != nil {
		return core.InternalServerError("failed to validate blog slug").WithError(err)
	}
	if exists {
		return core.BadRequest("slug is already in use")
	}
	return nil
}

func validateBlogContent(content map[string]any) error {
	if len(content) == 0 {
		return core.BadRequest("content_json is required")
	}
	if _, ok := content["type"]; !ok {
		return core.BadRequest("content_json must include root type")
	}
	return nil
}

func blogPostListToResponse(pr repository.PageResult[model.BlogPost]) model.BlogPostListResponse {
	data := make([]model.BlogPostResponse, 0, len(pr.Data))
	for _, item := range pr.Data {
		data = append(data, model.BlogPostToResponse(item))
	}
	return model.BlogPostListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
