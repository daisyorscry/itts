package repository

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"be-itts-community/pkg/observability/nr"

	"gorm.io/gorm"
)

type ListParams struct {
	Search   string
	Filters  map[string]any
	Sort     []string
	Page     int
	PageSize int
}

type PageResult[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	TotalPages int   `json:"total_pages"`
}

// RepoTracer is a package-level tracer used by repository methods for instrumentation.
// It defaults to a noop tracer and can be overridden by wiring in main.
var RepoTracer nr.Tracer = nr.NewNoopTracer()

func SanitizePaging(p *ListParams) {
	if p.Page <= 0 {
		p.Page = 1
	}
	if p.PageSize <= 0 {
		p.PageSize = 20
	}
	if p.PageSize > 200 {
		p.PageSize = 200
	}
}

func ParseSort(s string) (field string, dir string, ok bool) {
	field = s
	dir = "asc"
	if strings.Contains(s, ":") {
		parts := strings.SplitN(s, ":", 2)
		if len(parts) == 2 {
			field = strings.TrimSpace(parts[0])
			d := strings.ToLower(strings.TrimSpace(parts[1]))
			if d == "asc" || d == "desc" {
				dir = d
			} else {
				return "", "", false
			}
		}
	}
	field = strings.TrimSpace(field)
	if field == "" {
		return "", "", false
	}
	return field, dir, true
}

func ApplyListQuery(db *gorm.DB, p *ListParams, searchableColumns []string, sortWhitelist map[string]string) (*gorm.DB, error) {
	if p == nil {
		return nil, errors.New("nil ListParams")
	}

	q := db

	if len(p.Filters) > 0 {
		for col, val := range p.Filters {
			q = q.Where(fmt.Sprintf("%s = ?", col), val)
		}
	}

	if p.Search != "" && len(searchableColumns) > 0 {
		like := "%" + p.Search + "%"
		or := q
		first := true
		for _, col := range searchableColumns {
			if first {
				q = q.Where(fmt.Sprintf("%s ILIKE ?", col), like)
				first = false
			} else {
				q = q.Or(fmt.Sprintf("%s ILIKE ?", col), like)
			}
		}
		_ = or
	}

	if len(p.Sort) > 0 {
		for _, s := range p.Sort {
			field, dir, ok := ParseSort(s)
			if !ok {
				continue
			}
			expr, allowed := sortWhitelist[field]
			if !allowed {
				continue
			}
			q = q.Order(expr + " " + dir)
		}
	}
	return q, nil
}

func Paginate[T any](ctx context.Context, q *gorm.DB, p *ListParams, out *[]T) (*PageResult[T], error) {
	end := func() {}
	if RepoTracer != nil {
		end = RepoTracer.StartDatastoreSegment(ctx, "paginate", "count+find")
	}
	defer end()
	SanitizePaging(p)

	var total int64
	if err := q.WithContext(ctx).Count(&total).Error; err != nil {
		return nil, err
	}

	if err := q.WithContext(ctx).
		Offset((p.Page - 1) * p.PageSize).
		Limit(p.PageSize).
		Find(out).Error; err != nil {
		return nil, err
	}

	totalPages := int(total) / p.PageSize
	if int(total)%p.PageSize != 0 {
		totalPages++
	}

	return &PageResult[T]{
		Data:       *out,
		Total:      total,
		Page:       p.Page,
		PageSize:   p.PageSize,
		TotalPages: totalPages,
	}, nil
}
