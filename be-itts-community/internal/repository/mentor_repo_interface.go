package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type MentorRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	Create(ctx context.Context, m *model.Mentor) error
	GetByID(ctx context.Context, id string) (*model.Mentor, error)
	Update(ctx context.Context, m *model.Mentor) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.Mentor], error)
}

type mentorRepo struct{ db db.Connection }

func NewMentorRepository(db db.Connection) MentorRepository {
	return &mentorRepo{db: db}
}
