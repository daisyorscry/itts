package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type RoadmapItemRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	Create(ctx context.Context, m *model.RoadmapItem) error
	GetByID(ctx context.Context, id string) (*model.RoadmapItem, error)
	Update(ctx context.Context, m *model.RoadmapItem) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.RoadmapItem], error)
}

type roadmapItemRepo struct{ db db.Connection }

func NewRoadmapItemRepository(db db.Connection) RoadmapItemRepository {
	return &roadmapItemRepo{db: db}
}
