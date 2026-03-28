package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type BlogRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	CreatePost(ctx context.Context, post *model.BlogPost) error
	GetPostByID(ctx context.Context, id string) (*model.BlogPost, error)
	GetPostBySlug(ctx context.Context, slug string) (*model.BlogPost, error)
	UpdatePost(ctx context.Context, post *model.BlogPost) error
	DeletePost(ctx context.Context, id string) error
	ListPosts(ctx context.Context, p ListParams) (*PageResult[model.BlogPost], error)
	ListPublicPosts(ctx context.Context, p ListParams) (*PageResult[model.BlogPost], error)
	ListPostsByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.BlogPost], error)
	SlugExists(ctx context.Context, slug string, excludeID *string) (bool, error)
}

type blogRepo struct{ db db.Connection }

func NewBlogRepository(db db.Connection) BlogRepository {
	return &blogRepo{db: db}
}
