package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type RoadmapRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	Create(ctx context.Context, m *model.Roadmap) error
	GetByID(ctx context.Context, id string) (*model.Roadmap, error)
	Update(ctx context.Context, m *model.Roadmap) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.Roadmap], error)
}

type roadmapRepo struct{ db db.Connection }

func NewRoadmapRepository(db db.Connection) RoadmapRepository {
	return &roadmapRepo{db: db}
}
