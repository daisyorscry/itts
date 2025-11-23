package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type MentorService interface {
	Create(ctx context.Context, req model.CreateMentorRequest) (model.MentorResponse, error)
	Get(ctx context.Context, id string) (model.MentorResponse, error)
	Update(ctx context.Context, id string, req model.UpdateMentorRequest) (model.MentorResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (model.MentorListResponse, error)

	SetActive(ctx context.Context, req model.SetMentorActiveRequest) (model.MentorResponse, error)
	SetPriority(ctx context.Context, req model.SetMentorPriorityRequest) (model.MentorResponse, error)
}

func NewMentorService(repo repository.MentorRepository, locker lock.Locker, tracer nr.Tracer) MentorService {
	return &mentorService{repo: repo, locker: locker, tracer: tracer}
}
