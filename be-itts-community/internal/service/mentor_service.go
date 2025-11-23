package service

import (
	"context"
	"time"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type MentorService interface {
	Create(ctx context.Context, in CreateMentor) (*model.Mentor, error)
	Get(ctx context.Context, id string) (*model.Mentor, error)
	Update(ctx context.Context, id string, in UpdateMentor) (*model.Mentor, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Mentor], error)

	SetActive(ctx context.Context, id string, active bool) (*model.Mentor, error)
	SetPriority(ctx context.Context, id string, priority int) (*model.Mentor, error)
}

type CreateMentor struct {
	FullName  string              `json:"full_name" validate:"required,min=3"`
	Title     *string             `json:"title"`
	Bio       *string             `json:"bio"`
	AvatarURL *string             `json:"avatar_url"`
	Programs  []model.ProgramEnum `json:"programs"`
	IsActive  *bool               `json:"is_active"`
	Priority  *int                `json:"priority"`
}

type UpdateMentor struct {
	FullName  *string             `json:"full_name,omitempty"`
	Title     *string             `json:"title,omitempty"`
	Bio       *string             `json:"bio,omitempty"`
	AvatarURL *string             `json:"avatar_url,omitempty"`
	Programs  []model.ProgramEnum `json:"programs,omitempty"`
	IsActive  *bool               `json:"is_active,omitempty"`
	Priority  *int                `json:"priority,omitempty"`
}

type mentorService struct {
	db     *gorm.DB
	repo   repository.MentorRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewMentorService(db *gorm.DB, repo repository.MentorRepository, locker lock.Locker, tracer nr.Tracer) MentorService {
	return &mentorService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *mentorService) Create(ctx context.Context, in CreateMentor) (*model.Mentor, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Create")()
	}
	m := &model.Mentor{
		FullName:  in.FullName,
		Title:     in.Title,
		Bio:       in.Bio,
		AvatarURL: in.AvatarURL,
		Programs:  in.Programs,
	}
	if in.IsActive != nil {
		m.IsActive = *in.IsActive
	}
	if in.Priority != nil {
		m.Priority = *in.Priority
	}
	if err := s.locker.WithLock(ctx, "lock:mentors:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Create(ctx, m)
		})
	}); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *mentorService) Get(ctx context.Context, id string) (*model.Mentor, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *mentorService) Update(ctx context.Context, id string, in UpdateMentor) (*model.Mentor, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Update")()
	}
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.FullName != nil {
		m.FullName = *in.FullName
	}
	if in.Title != nil {
		m.Title = in.Title
	}
	if in.Bio != nil {
		m.Bio = in.Bio
	}
	if in.AvatarURL != nil {
		m.AvatarURL = in.AvatarURL
	}
	if in.Programs != nil {
		m.Programs = in.Programs
	}
	if in.IsActive != nil {
		m.IsActive = *in.IsActive
	}
	if in.Priority != nil {
		m.Priority = *in.Priority
	}
	if err := s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Update(ctx, m)
		})
	}); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *mentorService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Delete(ctx, id)
		})
	})
}

func (s *mentorService) List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Mentor], error) {
	return s.repo.List(ctx, p)
}

func (s *mentorService) SetActive(ctx context.Context, id string, active bool) (*model.Mentor, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.SetActive")()
	}
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	m.IsActive = active
	if err := s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Update(ctx, m)
		})
	}); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *mentorService) SetPriority(ctx context.Context, id string, priority int) (*model.Mentor, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.SetPriority")()
	}
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	m.Priority = priority
	if err := s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Update(ctx, m)
		})
	}); err != nil {
		return nil, err
	}
	return m, nil
}
