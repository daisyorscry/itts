package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

type LearningAssignmentService interface {
	CreateAssignment(ctx context.Context, req model.CreateAssignmentRequest) (model.AssignmentResponse, error)
	GetAssignment(ctx context.Context, id string) (model.AssignmentResponse, error)
	UpdateAssignment(ctx context.Context, id string, req model.UpdateAssignmentRequest) (model.AssignmentResponse, error)
	DeleteAssignment(ctx context.Context, id string) error
	SubmitAssignment(ctx context.Context, authCtx *model.AuthContext, req model.SubmitAssignmentRequest) (model.AssignmentSubmissionResponse, error)
	ReviewAssignmentSubmission(ctx context.Context, authCtx *model.AuthContext, id string, req model.ReviewAssignmentSubmissionRequest) (model.AssignmentSubmissionResponse, error)
	ListAssignmentSubmissions(ctx context.Context, assignmentID string, p repository.ListParams) (model.AssignmentSubmissionListResponse, error)
	ListMyAssignmentSubmissions(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.AssignmentSubmissionListResponse, error)
}
