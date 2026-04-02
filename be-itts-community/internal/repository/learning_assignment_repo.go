package repository

import (
	"context"

	"be-itts-community/internal/model"
	"gorm.io/gorm"
)

func (r *learningRepo) CreateAssignment(ctx context.Context, assignment *model.Assignment) error {
	return r.db.Get(ctx).Create(assignment).Error
}

func (r *learningRepo) GetAssignmentByID(ctx context.Context, id string) (*model.Assignment, error) {
	var assignment model.Assignment
	if err := r.db.Get(ctx).First(&assignment, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &assignment, nil
}

func (r *learningRepo) GetAssignmentByLessonID(ctx context.Context, lessonID string) (*model.Assignment, error) {
	var assignment model.Assignment
	if err := r.db.Get(ctx).First(&assignment, "lesson_id = ?", lessonID).Error; err != nil {
		return nil, err
	}
	return &assignment, nil
}

func (r *learningRepo) UpdateAssignment(ctx context.Context, assignment *model.Assignment) error {
	return r.db.Get(ctx).Save(assignment).Error
}

func (r *learningRepo) DeleteAssignment(ctx context.Context, id string) error {
	return r.db.Get(ctx).Delete(&model.Assignment{}, "id = ?", id).Error
}

func (r *learningRepo) CreateAssignmentSubmission(ctx context.Context, submission *model.AssignmentSubmission) error {
	return r.db.Get(ctx).Create(submission).Error
}

func (r *learningRepo) GetAssignmentSubmissionByID(ctx context.Context, id string) (*model.AssignmentSubmission, error) {
	var submission model.AssignmentSubmission
	if err := r.db.Get(ctx).
		Preload("User").
		Preload("Reviewer").
		First(&submission, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

func (r *learningRepo) GetAssignmentSubmissionByAssignmentUser(ctx context.Context, assignmentID, userID string) (*model.AssignmentSubmission, error) {
	var submission model.AssignmentSubmission
	if err := r.db.Get(ctx).
		Preload("User").
		Preload("Reviewer").
		First(&submission, "assignment_id = ? AND user_id = ?", assignmentID, userID).Error; err != nil {
		return nil, err
	}
	return &submission, nil
}

func (r *learningRepo) UpdateAssignmentSubmission(ctx context.Context, submission *model.AssignmentSubmission) error {
	return r.db.Get(ctx).Save(submission).Error
}

func (r *learningRepo) ListAssignmentSubmissions(ctx context.Context, assignmentID string, p ListParams) (*PageResult[model.AssignmentSubmission], error) {
	base := r.db.Get(ctx).Model(&model.AssignmentSubmission{}).Where("assignment_id = ?", assignmentID)
	return r.listAssignmentSubmissions(ctx, base, p)
}

func (r *learningRepo) ListAssignmentSubmissionsByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.AssignmentSubmission], error) {
	base := r.db.Get(ctx).Model(&model.AssignmentSubmission{}).Where("user_id = ?", userID)
	return r.listAssignmentSubmissions(ctx, base, p)
}

func (r *learningRepo) listAssignmentSubmissions(ctx context.Context, base *gorm.DB, p ListParams) (*PageResult[model.AssignmentSubmission], error) {
	sorts := map[string]string{
		"submitted_at": "submitted_at",
		"reviewed_at":  "reviewed_at",
		"status":       "status",
		"created_at":   "created_at",
	}
	q, err := ApplyListQuery(base, &p, nil, sorts)
	if err != nil {
		return nil, err
	}
	if len(p.Sort) == 0 {
		q = q.Order("submitted_at DESC").Order("created_at DESC")
	}
	q = q.Preload("User").Preload("Reviewer")
	var rows []model.AssignmentSubmission
	return Paginate[model.AssignmentSubmission](ctx, q, &p, &rows)
}
