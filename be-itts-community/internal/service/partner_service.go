package service

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/repository"
	"be-itts-community/model"
)

type PartnerService interface {
	Create(ctx context.Context, in CreatePartner) (*model.Partner, error)
	Get(ctx context.Context, id string) (*model.Partner, error)
	Update(ctx context.Context, id string, in UpdatePartner) (*model.Partner, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Partner], error)

	SetActive(ctx context.Context, id string, active bool) (*model.Partner, error)
	SetPriority(ctx context.Context, id string, priority int) (*model.Partner, error)
}

type CreatePartner struct {
	Name        string            `json:"name" validate:"required"`
	Kind        model.PartnerType `json:"kind" validate:"required,oneof=lab partner_academic partner_industry"`
	Subtitle    *string           `json:"subtitle"`
	Description *string           `json:"description"`
	LogoURL     *string           `json:"logo_url"`
	WebsiteURL  *string           `json:"website_url"`
	IsActive    *bool             `json:"is_active"`
	Priority    *int              `json:"priority"`
}

type UpdatePartner struct {
	Name        *string            `json:"name,omitempty"`
	Kind        *model.PartnerType `json:"kind,omitempty"`
	Subtitle    *string            `json:"subtitle,omitempty"`
	Description *string            `json:"description,omitempty"`
	LogoURL     *string            `json:"logo_url,omitempty"`
	WebsiteURL  *string            `json:"website_url,omitempty"`
	IsActive    *bool              `json:"is_active,omitempty"`
	Priority    *int               `json:"priority,omitempty"`
}

type partnerService struct {
	db   *gorm.DB
	repo repository.PartnerRepository
}

func NewPartnerService(db *gorm.DB, repo repository.PartnerRepository) PartnerService {
	return &partnerService{db: db, repo: repo}
}

func (s *partnerService) Create(ctx context.Context, in CreatePartner) (*model.Partner, error) {
	p := &model.Partner{
		Name:        in.Name,
		Kind:        in.Kind,
		Subtitle:    in.Subtitle,
		Description: in.Description,
		LogoURL:     in.LogoURL,
		WebsiteURL:  in.WebsiteURL,
	}
	if in.IsActive != nil {
		p.IsActive = *in.IsActive
	}
	if in.Priority != nil {
		p.Priority = *in.Priority
	}
	if err := s.repo.Create(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *partnerService) Get(ctx context.Context, id string) (*model.Partner, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *partnerService) Update(ctx context.Context, id string, in UpdatePartner) (*model.Partner, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.Name != nil {
		p.Name = *in.Name
	}
	if in.Kind != nil {
		p.Kind = *in.Kind
	}
	if in.Subtitle != nil {
		p.Subtitle = in.Subtitle
	}
	if in.Description != nil {
		p.Description = in.Description
	}
	if in.LogoURL != nil {
		p.LogoURL = in.LogoURL
	}
	if in.WebsiteURL != nil {
		p.WebsiteURL = in.WebsiteURL
	}
	if in.IsActive != nil {
		p.IsActive = *in.IsActive
	}
	if in.Priority != nil {
		p.Priority = *in.Priority
	}
	if err := s.repo.Update(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *partnerService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *partnerService) List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Partner], error) {
	return s.repo.List(ctx, p)
}

func (s *partnerService) SetActive(ctx context.Context, id string, active bool) (*model.Partner, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	p.IsActive = active
	if err := s.repo.Update(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *partnerService) SetPriority(ctx context.Context, id string, priority int) (*model.Partner, error) {
	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	p.Priority = priority
	if err := s.repo.Update(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}
