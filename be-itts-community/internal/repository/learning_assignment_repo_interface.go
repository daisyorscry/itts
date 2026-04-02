package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type LearningAssignmentRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error
	CreateAssignment(ctx context.Context, assignment *model.Assignment) error
	GetAssignmentByID(ctx context.Context, id string) (*model.Assignment, error)
	GetAssignmentByLessonID(ctx context.Context, lessonID string) (*model.Assignment, error)
	UpdateAssignment(ctx context.Context, assignment *model.Assignment) error
	DeleteAssignment(ctx context.Context, id string) error
	CreateAssignmentSubmission(ctx context.Context, submission *model.AssignmentSubmission) error
	GetAssignmentSubmissionByID(ctx context.Context, id string) (*model.AssignmentSubmission, error)
	GetAssignmentSubmissionByAssignmentUser(ctx context.Context, assignmentID, userID string) (*model.AssignmentSubmission, error)
	UpdateAssignmentSubmission(ctx context.Context, submission *model.AssignmentSubmission) error
	ListAssignmentSubmissions(ctx context.Context, assignmentID string, p ListParams) (*PageResult[model.AssignmentSubmission], error)
	ListAssignmentSubmissionsByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.AssignmentSubmission], error)
}
