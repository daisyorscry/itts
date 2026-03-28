package repository

import (
	"context"

	"be-itts-community/internal/model"
	"gorm.io/gorm"
)

func (r *blogRepo) RunInTransaction(ctx context.Context, f func(tx context.Context) error) error {
	return r.db.Run(ctx, f)
}

func (r *blogRepo) CreatePost(ctx context.Context, post *model.BlogPost) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "Create")()
	}
	return r.db.Get(ctx).Create(post).Error
}

func (r *blogRepo) GetPostByID(ctx context.Context, id string) (*model.BlogPost, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "GetByID")()
	}
	var post model.BlogPost
	if err := r.db.Get(ctx).First(&post, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *blogRepo) GetPostBySlug(ctx context.Context, slug string) (*model.BlogPost, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "GetBySlug")()
	}
	var post model.BlogPost
	if err := r.db.Get(ctx).First(&post, "slug = ?", slug).Error; err != nil {
		return nil, err
	}
	return &post, nil
}

func (r *blogRepo) UpdatePost(ctx context.Context, post *model.BlogPost) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "Update")()
	}
	return r.db.Get(ctx).Save(post).Error
}

func (r *blogRepo) DeletePost(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.BlogPost{}, "id = ?", id).Error
}

func (r *blogRepo) ListPosts(ctx context.Context, p ListParams) (*PageResult[model.BlogPost], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "List")()
	}
	return r.listPosts(ctx, r.db.Get(ctx).Model(&model.BlogPost{}), p, false)
}

func (r *blogRepo) ListPublicPosts(ctx context.Context, p ListParams) (*PageResult[model.BlogPost], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "ListPublic")()
	}
	base := r.db.Get(ctx).Model(&model.BlogPost{}).Where("status = ?", model.BlogPostStatusPublished)
	return r.listPosts(ctx, base, p, true)
}

func (r *blogRepo) ListPostsByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.BlogPost], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "blog_posts", "ListByUser")()
	}
	base := r.db.Get(ctx).Model(&model.BlogPost{}).Where("created_by = ?", userID)
	return r.listPosts(ctx, base, p, false)
}

func (r *blogRepo) listPosts(ctx context.Context, base *gorm.DB, p ListParams, publishedOnly bool) (*PageResult[model.BlogPost], error) {
	searchable := []string{"slug", "title", "excerpt", "author_name", "author_email", "author_role"}
	sorts := map[string]string{
		"title":        "title",
		"slug":         "slug",
		"status":       "status",
		"category":     "category",
		"published_at": "published_at",
		"created_at":   "created_at",
		"updated_at":   "updated_at",
	}

	q, err := ApplyListQuery(base, &p, searchable, sorts)
	if err != nil {
		return nil, err
	}

	if len(p.Sort) == 0 {
		if publishedOnly {
			q = q.Order("published_at DESC NULLS LAST").Order("created_at DESC")
		} else {
			q = q.Order("created_at DESC")
		}
	}

	var rows []model.BlogPost
	return Paginate[model.BlogPost](ctx, q, &p, &rows)
}

func (r *blogRepo) SlugExists(ctx context.Context, slug string, excludeID *string) (bool, error) {
	var count int64
	q := r.db.Get(ctx).Model(&model.BlogPost{}).Where("slug = ?", slug)
	if excludeID != nil && *excludeID != "" {
		q = q.Where("id <> ?", *excludeID)
	}
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
