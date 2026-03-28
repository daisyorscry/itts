package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type BlogService interface {
	ListPublicPosts(ctx context.Context, p repository.ListParams) (model.BlogPostListResponse, error)
	GetPublicPostBySlug(ctx context.Context, slug string) (model.BlogPostResponse, error)
	CreateReviewPost(ctx context.Context, authCtx *model.AuthContext, req model.CreateBlogReviewRequest) (model.BlogPostResponse, error)
	ListMyPosts(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.BlogPostListResponse, error)
	ListPosts(ctx context.Context, p repository.ListParams) (model.BlogPostListResponse, error)
	CreatePost(ctx context.Context, authCtx *model.AuthContext, req model.CreateBlogPostRequest) (model.BlogPostResponse, error)
	GetPost(ctx context.Context, id string) (model.BlogPostResponse, error)
	UpdatePost(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateBlogPostRequest) (model.BlogPostResponse, error)
	UpdatePostStatus(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateBlogPostStatusRequest) (model.BlogPostResponse, error)
	DeletePost(ctx context.Context, id string) error
}

func NewBlogService(repo repository.BlogRepository, locker lock.Locker, tracer nr.Tracer) BlogService {
	return &blogService{repo: repo, locker: locker, tracer: tracer}
}
