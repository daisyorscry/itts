package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"be-itts-community/internal/repository"
	"be-itts-community/internal/model"
)

type EventRegistrationService interface {
	// Publik
	Register(ctx context.Context, eventID, fullName, email string) (*model.EventRegistration, error)

	// Admin
	AdminList(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventRegistration], error)
	AdminGet(ctx context.Context, id string) (*model.EventRegistration, error)
	AdminUpdate(ctx context.Context, id string, in UpdateEventRegistration) (*model.EventRegistration, error)
	AdminDelete(ctx context.Context, id string) error
}

type eventRegistrationService struct {
	db   *gorm.DB
	repo repository.EventRegistrationRepository
}

func NewEventRegistrationService(db *gorm.DB, repo repository.EventRegistrationRepository) EventRegistrationService {
	return &eventRegistrationService{db: db, repo: repo}
}

type UpdateEventRegistration struct {
	FullName *string `json:"full_name,omitempty"`
	Email    *string `json:"email,omitempty"`
}

func (s *eventRegistrationService) Register(ctx context.Context, eventID, fullName, email string) (*model.EventRegistration, error) {
	if eventID == "" || fullName == "" || email == "" {
		return nil, fmt.Errorf("event_id, full_name, and email are required")
	}

	reg := &model.EventRegistration{
		EventID:  eventID,
		FullName: fullName,
		Email:    email,
	}

	// Simpel create; jika unique violation (event_id,email) → balas error ramah
	if err := s.repo.Create(ctx, reg); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, fmt.Errorf("email already registered for this event")
		}
		return nil, err
	}
	return reg, nil
}

func (s *eventRegistrationService) AdminList(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventRegistration], error) {
	return s.repo.List(ctx, p)
}

func (s *eventRegistrationService) AdminGet(ctx context.Context, id string) (*model.EventRegistration, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *eventRegistrationService) AdminUpdate(ctx context.Context, id string, in UpdateEventRegistration) (*model.EventRegistration, error) {
	r, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.FullName != nil {
		r.FullName = *in.FullName
	}
	if in.Email != nil {
		r.Email = *in.Email
	}
	if err := s.repo.Update(ctx, r); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, fmt.Errorf("email already registered for this event")
		}
		return nil, err
	}
	return r, nil
}

func (s *eventRegistrationService) AdminDelete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
