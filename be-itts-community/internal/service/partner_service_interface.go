package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type PartnerService interface {
	Create(ctx context.Context, req model.CreatePartnerRequest) (model.PartnerResponse, error)
	Get(ctx context.Context, id string) (model.PartnerResponse, error)
	Update(ctx context.Context, id string, req model.UpdatePartnerRequest) (model.PartnerResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (model.PartnerListResponse, error)

	SetActive(ctx context.Context, req model.SetPartnerActiveRequest) (model.PartnerResponse, error)
	SetPriority(ctx context.Context, req model.SetPartnerPriorityRequest) (model.PartnerResponse, error)
}

func NewPartnerService(repo repository.PartnerRepository, locker lock.Locker, tracer nr.Tracer) PartnerService {
	return &partnerService{repo: repo, locker: locker, tracer: tracer}
}
