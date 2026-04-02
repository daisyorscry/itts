package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/validator"
)

func (s *learningService) EnrollCourse(ctx context.Context, authCtx *model.AuthContext, req model.EnrollCourseRequest) (model.CourseEnrollmentResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.EnrollCourse")()
	}
	if authCtx == nil || authCtx.UserID == "" {
		return model.CourseEnrollmentResponse{}, core.Unauthorized("authentication required")
	}
	req.CourseID = strings.TrimSpace(req.CourseID)
	if err := validator.Validate(req); err != nil {
		return model.CourseEnrollmentResponse{}, core.ValidationError(err)
	}

	course, err := s.catalogRepo.GetCourseByID(ctx, req.CourseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseEnrollmentResponse{}, core.NotFound("course", req.CourseID)
		}
		return model.CourseEnrollmentResponse{}, fmt.Errorf("failed to get course: %w", err)
	}

	if course.Status != model.CourseStatusPublished {
		return model.CourseEnrollmentResponse{}, core.Forbidden("Course is not open for enrollment")
	}

	existing, err := s.enrollmentRepo.GetEnrollmentByCourseUser(ctx, req.CourseID, authCtx.UserID)
	if err == nil {
		return model.CourseEnrollmentToResponse(*existing), nil
	}
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return model.CourseEnrollmentResponse{}, fmt.Errorf("failed to check enrollment: %w", err)
	}

	enrollment := model.CourseEnrollment{
		CourseID:        req.CourseID,
		UserID:          authCtx.UserID,
		Status:          model.EnrollmentStatusActive,
		ProgressPercent: 0,
	}
	if err := s.enrollmentRepo.CreateEnrollment(ctx, &enrollment); err != nil {
		return model.CourseEnrollmentResponse{}, fmt.Errorf("failed to enroll course: %w", err)
	}

	return model.CourseEnrollmentToResponse(enrollment), nil
}

func (s *learningService) UpdateLessonProgress(ctx context.Context, authCtx *model.AuthContext, lessonID string, req model.UpdateLessonProgressRequest) (model.CourseEnrollmentResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.UpdateLessonProgress")()
	}
	if authCtx == nil || authCtx.UserID == "" {
		return model.CourseEnrollmentResponse{}, core.Unauthorized("authentication required")
	}
	if err := validator.Validate(req); err != nil {
		return model.CourseEnrollmentResponse{}, core.ValidationError(err)
	}

	lesson, err := s.catalogRepo.GetLessonByID(ctx, lessonID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseEnrollmentResponse{}, core.NotFound("lesson", lessonID)
		}
		return model.CourseEnrollmentResponse{}, fmt.Errorf("failed to get lesson: %w", err)
	}

	enrollment, err := s.enrollmentRepo.GetEnrollmentByCourseUser(ctx, lesson.CourseID, authCtx.UserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseEnrollmentResponse{}, core.Forbidden("Enroll in course first")
		}
		return model.CourseEnrollmentResponse{}, fmt.Errorf("failed to get enrollment: %w", err)
	}
	if err := s.ensureLessonAccessible(ctx, authCtx.UserID, lesson); err != nil {
		return model.CourseEnrollmentResponse{}, err
	}

	err = s.enrollmentRepo.RunInTransaction(ctx, func(tx context.Context) error {
		progress, progressErr := s.enrollmentRepo.GetLessonProgress(tx, lessonID, authCtx.UserID)
		if progressErr != nil {
			if errors.Is(progressErr, gorm.ErrRecordNotFound) {
				progress = &model.LessonProgress{
					LessonID: lessonID,
					UserID:   authCtx.UserID,
				}
				applyLessonProgressUpdate(progress, req)
				if err := s.enrollmentRepo.CreateLessonProgress(tx, progress); err != nil {
					return err
				}
			} else {
				return progressErr
			}
		} else {
			applyLessonProgressUpdate(progress, req)
			if err := s.enrollmentRepo.UpdateLessonProgress(tx, progress); err != nil {
				return err
			}
		}

		now := time.Now()
		enrollment.LastAccessedAt = &now
		return s.completeEnrollmentProgress(tx, enrollment, lesson.CourseID, authCtx.UserID, now, "manual_progress_completion")
	})
	if err != nil {
		return model.CourseEnrollmentResponse{}, fmt.Errorf("failed to update lesson progress: %w", err)
	}

	return model.CourseEnrollmentToResponse(*enrollment), nil
}

func (s *learningService) ListMyEnrollments(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (*repository.PageResult[model.CourseEnrollmentResponse], error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.ListMyEnrollments")()
	}
	if authCtx == nil || authCtx.UserID == "" {
		return nil, core.Unauthorized("authentication required")
	}

	result, err := s.enrollmentRepo.ListEnrollmentsByUser(ctx, authCtx.UserID, p)
	if err != nil {
		return nil, fmt.Errorf("failed to list enrollments: %w", err)
	}

	data := make([]model.CourseEnrollmentResponse, 0, len(result.Data))
	for _, item := range result.Data {
		data = append(data, model.CourseEnrollmentToResponse(item))
	}

	return &repository.PageResult[model.CourseEnrollmentResponse]{
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

func (s *learningService) completeLessonAndIssueCertificate(ctx context.Context, enrollment *model.CourseEnrollment, courseID, lessonID, userID string, now time.Time, source string) error {
	progress, err := s.enrollmentRepo.GetLessonProgress(ctx, lessonID, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			progress = &model.LessonProgress{
				LessonID:    lessonID,
				UserID:      userID,
				IsCompleted: true,
				CompletedAt: &now,
			}
			if err := s.enrollmentRepo.CreateLessonProgress(ctx, progress); err != nil {
				return err
			}
		} else {
			return err
		}
	} else {
		progress.IsCompleted = true
		progress.CompletedAt = &now
		if err := s.enrollmentRepo.UpdateLessonProgress(ctx, progress); err != nil {
			return err
		}
	}
	return s.completeEnrollmentProgress(ctx, enrollment, courseID, userID, now, source)
}

func (s *learningService) completeEnrollmentProgress(ctx context.Context, enrollment *model.CourseEnrollment, courseID, userID string, now time.Time, source string) error {
	totalLessons, err := s.enrollmentRepo.CountPublishedLessonsByCourse(ctx, courseID)
	if err != nil {
		return err
	}
	completedLessons, err := s.enrollmentRepo.CountCompletedLessonsByCourse(ctx, courseID, userID)
	if err != nil {
		return err
	}
	enrollment.ProgressPercent = 0
	if totalLessons > 0 {
		enrollment.ProgressPercent = (float64(completedLessons) / float64(totalLessons)) * 100
	}
	enrollment.LastAccessedAt = &now
	if enrollment.ProgressPercent >= 100 {
		enrollment.Status = model.EnrollmentStatusCompleted
		if enrollment.CompletedAt == nil {
			enrollment.CompletedAt = &now
		}
		if _, err := s.certificateRepo.GetCertificateByCourseUser(ctx, courseID, userID); err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				certificate := model.CourseCertificate{
					CourseID:          courseID,
					UserID:            userID,
					CertificateNumber: generateCertificateNumber(courseID, userID),
					Status:            model.CertificateStatusIssued,
					IssuedAt:          now,
					Metadata:          model.LearningContent{"source": source},
				}
				if err := s.certificateRepo.CreateCertificate(ctx, &certificate); err != nil {
					return err
				}
			} else {
				return err
			}
		}
	}
	return s.enrollmentRepo.UpdateEnrollment(ctx, enrollment)
}

func applyLessonProgressUpdate(progress *model.LessonProgress, req model.UpdateLessonProgressRequest) {
	progress.LastPositionSeconds = req.LastPositionSeconds
	progress.TimeSpentSeconds = req.TimeSpentSeconds
	progress.IsCompleted = req.IsCompleted
	if req.IsCompleted {
		now := time.Now()
		progress.CompletedAt = &now
	}
}
