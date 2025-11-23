package service

import (
	"context"
	"errors"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

type mentorService struct {
	repo   repository.MentorRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *mentorService) Create(ctx context.Context, req model.CreateMentorRequest) (model.MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Create")()
	}

	if err := validator.Validate(req); err != nil {
		return model.MentorResponse{}, core.ValidationError(err)
	}

	m := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:mentors:create", 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Create(txCtx, &m)
		})
	}); err != nil {
		return model.MentorResponse{}, core.InternalServerError("failed to create mentor").WithError(err)
	}

	return model.MentorToResponse(m), nil
}

func (s *mentorService) Get(ctx context.Context, id string) (model.MentorResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.MentorResponse{}, core.NotFound("mentor", id)
		}
		return model.MentorResponse{}, core.InternalServerError("failed to fetch mentor").WithError(err)
	}
	return model.MentorToResponse(*m), nil
}

func (s *mentorService) Update(ctx context.Context, id string, req model.UpdateMentorRequest) (model.MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Update")()
	}

	if err := validator.Validate(req); err != nil {
		return model.MentorResponse{}, core.ValidationError(err)
	}

	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.MentorResponse{}, core.NotFound("mentor", id)
		}
		return model.MentorResponse{}, core.InternalServerError("failed to fetch mentor").WithError(err)
	}

	if req.FullName != nil {
		m.FullName = *req.FullName
	}
	if req.Title != nil {
		m.Title = req.Title
	}
	if req.Bio != nil {
		m.Bio = req.Bio
	}
	if req.AvatarURL != nil {
		m.AvatarURL = req.AvatarURL
	}
	if req.Programs != nil {
		m.Programs = req.Programs
	}
	if req.IsActive != nil {
		m.IsActive = *req.IsActive
	}
	if req.Priority != nil {
		m.Priority = *req.Priority
	}

	if err := s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, m)
		})
	}); err != nil {
		return model.MentorResponse{}, core.InternalServerError("failed to update mentor").WithError(err)
	}

	return model.MentorToResponse(*m), nil
}

func (s *mentorService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Delete(txCtx, id)
		})
	})
}

func (s *mentorService) List(ctx context.Context, p repository.ListParams) (model.MentorListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return model.MentorListResponse{}, core.InternalServerError("failed to list mentors").WithError(err)
	}
	return mentorListToResponse(*result), nil
}

func (s *mentorService) SetActive(ctx context.Context, req model.SetMentorActiveRequest) (model.MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.SetActive")()
	}

	if err := validator.Validate(req); err != nil {
		return model.MentorResponse{}, err
	}

	m, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.MentorResponse{}, core.NotFound("mentor", req.ID)
		}
		return model.MentorResponse{}, core.InternalServerError("failed to fetch mentor").WithError(err)
	}

	m.IsActive = req.Active

	if err := s.locker.WithLock(ctx, "lock:mentors:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, m)
		})
	}); err != nil {
		return model.MentorResponse{}, core.InternalServerError("failed to update mentor").WithError(err)
	}

	return model.MentorToResponse(*m), nil
}

func (s *mentorService) SetPriority(ctx context.Context, req model.SetMentorPriorityRequest) (model.MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.SetPriority")()
	}

	if err := validator.Validate(req); err != nil {
		return model.MentorResponse{}, err
	}

	m, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.MentorResponse{}, core.NotFound("mentor", req.ID)
		}
		return model.MentorResponse{}, core.InternalServerError("failed to fetch mentor").WithError(err)
	}

	m.Priority = req.Priority

	if err := s.locker.WithLock(ctx, "lock:mentors:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, m)
		})
	}); err != nil {
		return model.MentorResponse{}, core.InternalServerError("failed to update mentor").WithError(err)
	}

	return model.MentorToResponse(*m), nil
}

func mentorListToResponse(pr repository.PageResult[model.Mentor]) model.MentorListResponse {
	data := make([]model.MentorResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, model.MentorToResponse(m))
	}
	return model.MentorListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
