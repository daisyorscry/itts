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

type partnerService struct {
	repo   repository.PartnerRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *partnerService) Create(ctx context.Context, req model.CreatePartnerRequest) (model.PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.Create")()
	}

	if err := validator.Validate(req); err != nil {
		return model.PartnerResponse{}, core.ValidationError(err)
	}

	p := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:partners:create", 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Create(txCtx, &p)
		})
	}); err != nil {
		return model.PartnerResponse{}, core.InternalServerError("failed to create partner").WithError(err)
	}

	return model.PartnerToResponse(p), nil
}

func (s *partnerService) Get(ctx context.Context, id string) (model.PartnerResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.PartnerResponse{}, core.NotFound("partner", id)
		}
		return model.PartnerResponse{}, core.InternalServerError("failed to fetch partner").WithError(err)
	}
	return model.PartnerToResponse(*m), nil
}

func (s *partnerService) Update(ctx context.Context, id string, req model.UpdatePartnerRequest) (model.PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.Update")()
	}

	if err := validator.Validate(req); err != nil {
		return model.PartnerResponse{}, core.ValidationError(err)
	}

	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.PartnerResponse{}, core.NotFound("partner", id)
		}
		return model.PartnerResponse{}, core.InternalServerError("failed to fetch partner").WithError(err)
	}

	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.Kind != nil {
		p.Kind = *req.Kind
	}
	if req.Subtitle != nil {
		p.Subtitle = req.Subtitle
	}
	if req.Description != nil {
		p.Description = req.Description
	}
	if req.LogoURL != nil {
		p.LogoURL = req.LogoURL
	}
	if req.WebsiteURL != nil {
		p.WebsiteURL = req.WebsiteURL
	}
	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}
	if req.Priority != nil {
		p.Priority = *req.Priority
	}

	if err := s.locker.WithLock(ctx, "lock:partners:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, p)
		})
	}); err != nil {
		return model.PartnerResponse{}, core.InternalServerError("failed to update partner").WithError(err)
	}

	return model.PartnerToResponse(*p), nil
}

func (s *partnerService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:partners:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Delete(txCtx, id)
		})
	})
}

func (s *partnerService) List(ctx context.Context, p repository.ListParams) (model.PartnerListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return model.PartnerListResponse{}, core.InternalServerError("failed to list partners").WithError(err)
	}
	return partnerListToResponse(*result), nil
}

func (s *partnerService) SetActive(ctx context.Context, req model.SetPartnerActiveRequest) (model.PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.SetActive")()
	}

	if err := validator.Validate(req); err != nil {
		return model.PartnerResponse{}, core.ValidationError(err)
	}

	p, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.PartnerResponse{}, core.NotFound("partner", req.ID)
		}
		return model.PartnerResponse{}, core.InternalServerError("failed to fetch partner").WithError(err)
	}

	p.IsActive = req.Active

	if err := s.locker.WithLock(ctx, "lock:partners:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, p)
		})
	}); err != nil {
		return model.PartnerResponse{}, core.InternalServerError("failed to update partner").WithError(err)
	}

	return model.PartnerToResponse(*p), nil
}

func (s *partnerService) SetPriority(ctx context.Context, req model.SetPartnerPriorityRequest) (model.PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.SetPriority")()
	}

	if err := validator.Validate(req); err != nil {
		return model.PartnerResponse{}, core.ValidationError(err)
	}

	p, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.PartnerResponse{}, core.NotFound("partner", req.ID)
		}
		return model.PartnerResponse{}, core.InternalServerError("failed to fetch partner").WithError(err)
	}

	p.Priority = req.Priority

	if err := s.locker.WithLock(ctx, "lock:partners:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, p)
		})
	}); err != nil {
		return model.PartnerResponse{}, core.InternalServerError("failed to update partner").WithError(err)
	}

	return model.PartnerToResponse(*p), nil
}

func partnerListToResponse(pr repository.PageResult[model.Partner]) model.PartnerListResponse {
	data := make([]model.PartnerResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, model.PartnerToResponse(m))
	}
	return model.PartnerListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
