package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/validator"
)

func (s *learningService) CreateAssignment(ctx context.Context, req model.CreateAssignmentRequest) (model.AssignmentResponse, error) {
	req.LessonID = strings.TrimSpace(req.LessonID)
	req.Title = strings.TrimSpace(req.Title)
	req.Instructions = strings.TrimSpace(req.Instructions)
	if err := validator.Validate(req); err != nil {
		return model.AssignmentResponse{}, core.ValidationError(err)
	}
	if !req.AllowTextSubmission && !req.AllowLinkSubmission && !req.AllowFileSubmission {
		return model.AssignmentResponse{}, core.ValidationError(errors.New("assignment must allow at least one submission type"))
	}

	lesson, err := s.catalogRepo.GetLessonByID(ctx, req.LessonID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AssignmentResponse{}, core.NotFound("lesson", req.LessonID)
		}
		return model.AssignmentResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	if lesson.LessonType != model.LessonTypeAssignment {
		return model.AssignmentResponse{}, core.ValidationError(errors.New("lesson_type must be assignment before attaching an assignment"))
	}
	if _, err := s.assignmentRepo.GetAssignmentByLessonID(ctx, req.LessonID); err == nil {
		return model.AssignmentResponse{}, core.Conflict("Assignment already exists for lesson")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return model.AssignmentResponse{}, core.InternalServerError("failed to check assignment").WithError(err)
	}

	assignment := model.Assignment{
		LessonID:            req.LessonID,
		Title:               req.Title,
		Instructions:        learningServiceNilIfEmpty(req.Instructions),
		DueAt:               req.DueAt,
		MaxScore:            req.MaxScore,
		AllowTextSubmission: req.AllowTextSubmission,
		AllowLinkSubmission: req.AllowLinkSubmission,
		AllowFileSubmission: req.AllowFileSubmission,
		IsActive:            req.IsActive,
		IsAutoApprove:       req.IsAutoApprove,
	}
	if err := s.assignmentRepo.CreateAssignment(ctx, &assignment); err != nil {
		return model.AssignmentResponse{}, core.InternalServerError("failed to create assignment").WithError(err)
	}
	return model.AssignmentToResponse(assignment), nil
}

func (s *learningService) GetAssignment(ctx context.Context, id string) (model.AssignmentResponse, error) {
	assignment, err := s.assignmentRepo.GetAssignmentByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AssignmentResponse{}, core.NotFound("assignment", id)
		}
		return model.AssignmentResponse{}, core.InternalServerError("failed to fetch assignment").WithError(err)
	}
	return model.AssignmentToResponse(*assignment), nil
}

func (s *learningService) UpdateAssignment(ctx context.Context, id string, req model.UpdateAssignmentRequest) (model.AssignmentResponse, error) {
	if req.Title != nil {
		trimmed := strings.TrimSpace(*req.Title)
		req.Title = &trimmed
	}
	if req.Instructions != nil {
		trimmed := strings.TrimSpace(*req.Instructions)
		req.Instructions = &trimmed
	}
	if err := validator.Validate(req); err != nil {
		return model.AssignmentResponse{}, core.ValidationError(err)
	}

	assignment, err := s.assignmentRepo.GetAssignmentByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AssignmentResponse{}, core.NotFound("assignment", id)
		}
		return model.AssignmentResponse{}, core.InternalServerError("failed to fetch assignment").WithError(err)
	}
	if req.Title != nil {
		assignment.Title = *req.Title
	}
	if req.Instructions != nil {
		assignment.Instructions = learningServiceNilIfEmpty(*req.Instructions)
	}
	if req.DueAt != nil {
		assignment.DueAt = req.DueAt
	}
	if req.MaxScore != nil {
		assignment.MaxScore = req.MaxScore
	}
	if req.AllowTextSubmission != nil {
		assignment.AllowTextSubmission = *req.AllowTextSubmission
	}
	if req.AllowLinkSubmission != nil {
		assignment.AllowLinkSubmission = *req.AllowLinkSubmission
	}
	if req.AllowFileSubmission != nil {
		assignment.AllowFileSubmission = *req.AllowFileSubmission
	}
	if req.IsActive != nil {
		assignment.IsActive = *req.IsActive
	}
	if req.IsAutoApprove != nil {
		assignment.IsAutoApprove = *req.IsAutoApprove
	}
	if !assignment.AllowTextSubmission && !assignment.AllowLinkSubmission && !assignment.AllowFileSubmission {
		return model.AssignmentResponse{}, core.ValidationError(errors.New("assignment must allow at least one submission type"))
	}
	if err := s.assignmentRepo.UpdateAssignment(ctx, assignment); err != nil {
		return model.AssignmentResponse{}, core.InternalServerError("failed to update assignment").WithError(err)
	}
	return model.AssignmentToResponse(*assignment), nil
}

func (s *learningService) DeleteAssignment(ctx context.Context, id string) error {
	if _, err := s.assignmentRepo.GetAssignmentByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("assignment", id)
		}
		return core.InternalServerError("failed to fetch assignment").WithError(err)
	}
	if err := s.assignmentRepo.DeleteAssignment(ctx, id); err != nil {
		return core.InternalServerError("failed to delete assignment").WithError(err)
	}
	return nil
}

func (s *learningService) SubmitAssignment(ctx context.Context, authCtx *model.AuthContext, req model.SubmitAssignmentRequest) (model.AssignmentSubmissionResponse, error) {
	if authCtx == nil || authCtx.UserID == "" {
		return model.AssignmentSubmissionResponse{}, core.Unauthorized("authentication required")
	}
	req.AssignmentID = strings.TrimSpace(req.AssignmentID)
	req.SubmissionText = strings.TrimSpace(req.SubmissionText)
	req.SubmissionURL = strings.TrimSpace(req.SubmissionURL)
	req.AttachmentURL = strings.TrimSpace(req.AttachmentURL)
	if err := validator.Validate(req); err != nil {
		return model.AssignmentSubmissionResponse{}, core.ValidationError(err)
	}

	assignment, err := s.assignmentRepo.GetAssignmentByID(ctx, req.AssignmentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AssignmentSubmissionResponse{}, core.NotFound("assignment", req.AssignmentID)
		}
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch assignment").WithError(err)
	}
	if !assignment.IsActive {
		return model.AssignmentSubmissionResponse{}, core.Forbidden("Assignment is not active")
	}
	if err := validateAssignmentSubmissionPayload(assignment, req); err != nil {
		return model.AssignmentSubmissionResponse{}, err
	}

	lesson, err := s.catalogRepo.GetLessonByID(ctx, assignment.LessonID)
	if err != nil {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	if err := s.ensureLessonAccessible(ctx, authCtx.UserID, lesson); err != nil {
		return model.AssignmentSubmissionResponse{}, err
	}
	enrollment, err := s.enrollmentRepo.GetEnrollmentByCourseUser(ctx, lesson.CourseID, authCtx.UserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AssignmentSubmissionResponse{}, core.Forbidden("Enroll in course first")
		}
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch enrollment").WithError(err)
	}

	now := time.Now()
	submission := &model.AssignmentSubmission{}
	existing, err := s.assignmentRepo.GetAssignmentSubmissionByAssignmentUser(ctx, assignment.ID, authCtx.UserID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch existing submission").WithError(err)
	}
	if existing != nil {
		submission = existing
	} else {
		submission.AssignmentID = assignment.ID
		submission.UserID = authCtx.UserID
		submission.SubmittedAt = now
	}
	submission.SubmissionText = learningServiceNilIfEmpty(req.SubmissionText)
	submission.SubmissionURL = learningServiceNilIfEmpty(req.SubmissionURL)
	submission.AttachmentURL = learningServiceNilIfEmpty(req.AttachmentURL)
	submission.Status = model.AssignmentSubmissionStatusSubmitted
	submission.ReviewedAt = nil
	submission.ReviewedBy = nil
	submission.Score = nil
	submission.Feedback = nil

	if err := s.assignmentRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if existing == nil {
			if err := s.assignmentRepo.CreateAssignmentSubmission(tx, submission); err != nil {
				return err
			}
		} else {
			if err := s.assignmentRepo.UpdateAssignmentSubmission(tx, submission); err != nil {
				return err
			}
		}
		if assignment.IsAutoApprove {
			submission.Status = model.AssignmentSubmissionStatusApproved
			submission.ReviewedAt = &now
			if err := s.assignmentRepo.UpdateAssignmentSubmission(tx, submission); err != nil {
				return err
			}
			if err := s.completeLessonAndIssueCertificate(tx, enrollment, lesson.CourseID, lesson.ID, authCtx.UserID, now, "assignment_auto_approve"); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to submit assignment").WithError(err)
	}

	return model.AssignmentSubmissionToResponse(*submission), nil
}

func (s *learningService) ReviewAssignmentSubmission(ctx context.Context, authCtx *model.AuthContext, id string, req model.ReviewAssignmentSubmissionRequest) (model.AssignmentSubmissionResponse, error) {
	if authCtx == nil || authCtx.UserID == "" {
		return model.AssignmentSubmissionResponse{}, core.Unauthorized("authentication required")
	}
	req.Feedback = strings.TrimSpace(req.Feedback)
	if err := validator.Validate(req); err != nil {
		return model.AssignmentSubmissionResponse{}, core.ValidationError(err)
	}

	submission, err := s.assignmentRepo.GetAssignmentSubmissionByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.AssignmentSubmissionResponse{}, core.NotFound("assignment_submission", id)
		}
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch assignment submission").WithError(err)
	}
	assignment, err := s.assignmentRepo.GetAssignmentByID(ctx, submission.AssignmentID)
	if err != nil {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch assignment").WithError(err)
	}
	if assignment.MaxScore != nil && req.Score != nil && *req.Score > *assignment.MaxScore {
		return model.AssignmentSubmissionResponse{}, core.ValidationError(errors.New("score exceeds assignment max_score"))
	}
	lesson, err := s.catalogRepo.GetLessonByID(ctx, assignment.LessonID)
	if err != nil {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	enrollment, err := s.enrollmentRepo.GetEnrollmentByCourseUser(ctx, lesson.CourseID, submission.UserID)
	if err != nil {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to fetch enrollment").WithError(err)
	}

	now := time.Now()
	submission.Status = req.Status
	submission.Score = req.Score
	submission.Feedback = learningServiceNilIfEmpty(req.Feedback)
	submission.ReviewedAt = &now
	submission.ReviewedBy = learningServiceStrPtr(authCtx.UserID)

	if err := s.assignmentRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if err := s.assignmentRepo.UpdateAssignmentSubmission(tx, submission); err != nil {
			return err
		}
		if submission.Status == model.AssignmentSubmissionStatusApproved {
			if err := s.completeLessonAndIssueCertificate(tx, enrollment, lesson.CourseID, lesson.ID, submission.UserID, now, "assignment_review_approve"); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return model.AssignmentSubmissionResponse{}, core.InternalServerError("failed to review assignment submission").WithError(err)
	}

	return model.AssignmentSubmissionToResponse(*submission), nil
}

func (s *learningService) ListAssignmentSubmissions(ctx context.Context, assignmentID string, p repository.ListParams) (model.AssignmentSubmissionListResponse, error) {
	result, err := s.assignmentRepo.ListAssignmentSubmissions(ctx, assignmentID, p)
	if err != nil {
		return model.AssignmentSubmissionListResponse{}, core.InternalServerError("failed to list assignment submissions").WithError(err)
	}
	return toAssignmentSubmissionListResponse(result), nil
}

func (s *learningService) ListMyAssignmentSubmissions(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.AssignmentSubmissionListResponse, error) {
	if authCtx == nil || authCtx.UserID == "" {
		return model.AssignmentSubmissionListResponse{}, core.Unauthorized("authentication required")
	}
	result, err := s.assignmentRepo.ListAssignmentSubmissionsByUser(ctx, authCtx.UserID, p)
	if err != nil {
		return model.AssignmentSubmissionListResponse{}, core.InternalServerError("failed to list assignment submissions").WithError(err)
	}
	return toAssignmentSubmissionListResponse(result), nil
}

func validateAssignmentSubmissionPayload(assignment *model.Assignment, req model.SubmitAssignmentRequest) error {
	if assignment == nil {
		return core.ValidationError(errors.New("assignment is required"))
	}
	if req.SubmissionText != "" && !assignment.AllowTextSubmission {
		return core.ValidationError(errors.New("assignment does not allow text submission"))
	}
	if req.SubmissionURL != "" && !assignment.AllowLinkSubmission {
		return core.ValidationError(errors.New("assignment does not allow link submission"))
	}
	if req.AttachmentURL != "" && !assignment.AllowFileSubmission {
		return core.ValidationError(errors.New("assignment does not allow file submission"))
	}
	if req.SubmissionText == "" && req.SubmissionURL == "" && req.AttachmentURL == "" {
		return core.ValidationError(errors.New("provide at least one assignment submission payload"))
	}
	return nil
}

func toAssignmentSubmissionListResponse(result *repository.PageResult[model.AssignmentSubmission]) model.AssignmentSubmissionListResponse {
	data := make([]model.AssignmentSubmissionResponse, 0, len(result.Data))
	for _, item := range result.Data {
		data = append(data, model.AssignmentSubmissionToResponse(item))
	}
	return model.AssignmentSubmissionListResponse{
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}
}
