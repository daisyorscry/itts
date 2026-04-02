package service

import (
	"context"
	"errors"
	"fmt"
	"sort"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/validator"
)

func (s *learningService) ListPublicCourses(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.ListPublicCourses")()
	}

	result, err := s.catalogRepo.ListPublishedCourses(ctx, p)
	if err != nil {
		return model.CourseListResponse{}, fmt.Errorf("failed to list public courses: %w", err)
	}

	return toCourseListResponse(result), nil
}

func (s *learningService) GetPublicCourseBySlug(ctx context.Context, slug string) (model.CourseResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.GetPublicCourseBySlug")()
	}

	course, err := s.catalogRepo.GetPublishedCourseBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseResponse{}, core.NotFound("course", slug)
		}
		return model.CourseResponse{}, fmt.Errorf("failed to get public course: %w", err)
	}

	return model.CourseToResponse(*course), nil
}

func (s *learningService) ListCourses(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.ListCourses")()
	}

	result, err := s.catalogRepo.ListCourses(ctx, p)
	if err != nil {
		return model.CourseListResponse{}, fmt.Errorf("failed to list courses: %w", err)
	}

	return toCourseListResponse(result), nil
}

func (s *learningService) CreateCourse(ctx context.Context, authCtx *model.AuthContext, req model.CreateCourseRequest) (model.CourseResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.CreateCourse")()
	}
	if authCtx == nil || authCtx.UserID == "" {
		return model.CourseResponse{}, core.Unauthorized("authentication required")
	}
	req.Slug = strings.TrimSpace(req.Slug)
	req.Title = strings.TrimSpace(req.Title)
	req.Subtitle = strings.TrimSpace(req.Subtitle)
	req.Description = strings.TrimSpace(req.Description)
	req.ThumbnailURL = strings.TrimSpace(req.ThumbnailURL)
	if err := validator.Validate(req); err != nil {
		return model.CourseResponse{}, core.ValidationError(err)
	}

	exists, err := s.catalogRepo.CourseSlugExists(ctx, req.Slug, nil)
	if err != nil {
		return model.CourseResponse{}, fmt.Errorf("failed to check course slug: %w", err)
	}
	if exists {
		return model.CourseResponse{}, core.Conflict("Course slug already exists")
	}

	course := req.ToModel(authCtx.UserID)
	if err := s.catalogRepo.CreateCourse(ctx, &course); err != nil {
		return model.CourseResponse{}, fmt.Errorf("failed to create course: %w", err)
	}

	return model.CourseToResponse(course), nil
}

func (s *learningService) GetCourse(ctx context.Context, id string) (model.CourseResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.GetCourse")()
	}

	course, err := s.catalogRepo.GetCourseByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseResponse{}, core.NotFound("course", id)
		}
		return model.CourseResponse{}, fmt.Errorf("failed to get course: %w", err)
	}

	return model.CourseToResponse(*course), nil
}

func (s *learningService) UpdateCourse(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateCourseRequest) (model.CourseResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.UpdateCourse")()
	}
	if authCtx == nil || authCtx.UserID == "" {
		return model.CourseResponse{}, core.Unauthorized("authentication required")
	}
	if req.Slug != nil {
		trimmed := strings.TrimSpace(*req.Slug)
		req.Slug = &trimmed
	}
	if req.Title != nil {
		trimmed := strings.TrimSpace(*req.Title)
		req.Title = &trimmed
	}
	if req.Subtitle != nil {
		trimmed := strings.TrimSpace(*req.Subtitle)
		req.Subtitle = &trimmed
	}
	if req.Description != nil {
		trimmed := strings.TrimSpace(*req.Description)
		req.Description = &trimmed
	}
	if req.ThumbnailURL != nil {
		trimmed := strings.TrimSpace(*req.ThumbnailURL)
		req.ThumbnailURL = &trimmed
	}
	if err := validator.Validate(req); err != nil {
		return model.CourseResponse{}, core.ValidationError(err)
	}

	course, err := s.catalogRepo.GetCourseByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseResponse{}, core.NotFound("course", id)
		}
		return model.CourseResponse{}, fmt.Errorf("failed to get course: %w", err)
	}

	if req.Slug != nil && *req.Slug != course.Slug {
		exists, err := s.catalogRepo.CourseSlugExists(ctx, *req.Slug, &course.ID)
		if err != nil {
			return model.CourseResponse{}, fmt.Errorf("failed to check course slug: %w", err)
		}
		if exists {
			return model.CourseResponse{}, core.Conflict("Course slug already exists")
		}
		course.Slug = *req.Slug
	}
	if req.Title != nil {
		course.Title = *req.Title
	}
	if req.Subtitle != nil {
		course.Subtitle = req.Subtitle
	}
	if req.Description != nil {
		course.Description = req.Description
	}
	if req.ThumbnailURL != nil {
		course.ThumbnailURL = req.ThumbnailURL
	}
	if req.Program != nil {
		course.Program = req.Program
	}
	if req.Level != nil {
		course.Level = *req.Level
	}
	if req.EstimatedMinutes != nil {
		course.EstimatedMinutes = *req.EstimatedMinutes
	}
	if req.IsFeatured != nil {
		course.IsFeatured = *req.IsFeatured
	}
	if req.Status != nil {
		course.Status = *req.Status
		if *req.Status == model.CourseStatusPublished && course.PublishedAt == nil {
			now := time.Now()
			course.PublishedAt = &now
		}
	}
	course.UpdatedBy = learningServiceStrPtr(authCtx.UserID)

	if err := s.catalogRepo.UpdateCourse(ctx, course); err != nil {
		return model.CourseResponse{}, fmt.Errorf("failed to update course: %w", err)
	}

	return model.CourseToResponse(*course), nil
}

func (s *learningService) DeleteCourse(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.DeleteCourse")()
	}

	if _, err := s.catalogRepo.GetCourseByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("course", id)
		}
		return fmt.Errorf("failed to get course: %w", err)
	}

	if err := s.catalogRepo.DeleteCourse(ctx, id); err != nil {
		return fmt.Errorf("failed to delete course: %w", err)
	}

	return nil
}

func (s *learningService) CreateSection(ctx context.Context, req model.CreateCourseSectionRequest) (model.CourseSectionResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.CreateSection")()
	}
	req.CourseID = strings.TrimSpace(req.CourseID)
	req.Title = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	if err := validator.Validate(req); err != nil {
		return model.CourseSectionResponse{}, core.ValidationError(err)
	}
	if _, err := s.catalogRepo.GetCourseByID(ctx, req.CourseID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseSectionResponse{}, core.NotFound("course", req.CourseID)
		}
		return model.CourseSectionResponse{}, core.InternalServerError("failed to fetch course").WithError(err)
	}
	course, err := s.catalogRepo.GetCourseByID(ctx, req.CourseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseSectionResponse{}, core.NotFound("course", req.CourseID)
		}
		return model.CourseSectionResponse{}, core.InternalServerError("failed to fetch course").WithError(err)
	}
	section := req.ToModel()
	section.SortOrder = learningNextSectionSortOrder(course.Sections)
	if err := s.catalogRepo.CreateSection(ctx, &section); err != nil {
		return model.CourseSectionResponse{}, core.InternalServerError("failed to create course section").WithError(err)
	}
	return model.CourseSectionToResponse(section), nil
}

func (s *learningService) GetSection(ctx context.Context, id string) (model.CourseSectionResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.GetSection")()
	}
	section, err := s.catalogRepo.GetSectionByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseSectionResponse{}, core.NotFound("course_section", id)
		}
		return model.CourseSectionResponse{}, core.InternalServerError("failed to fetch course section").WithError(err)
	}
	return model.CourseSectionToResponse(*section), nil
}

func (s *learningService) UpdateSection(ctx context.Context, id string, req model.UpdateCourseSectionRequest) (model.CourseSectionResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.UpdateSection")()
	}
	if req.Title != nil {
		trimmed := strings.TrimSpace(*req.Title)
		req.Title = &trimmed
	}
	if req.Description != nil {
		trimmed := strings.TrimSpace(*req.Description)
		req.Description = &trimmed
	}
	if err := validator.Validate(req); err != nil {
		return model.CourseSectionResponse{}, core.ValidationError(err)
	}
	section, err := s.catalogRepo.GetSectionByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CourseSectionResponse{}, core.NotFound("course_section", id)
		}
		return model.CourseSectionResponse{}, core.InternalServerError("failed to fetch course section").WithError(err)
	}
	if req.Title != nil {
		section.Title = *req.Title
	}
	if req.Description != nil {
		section.Description = req.Description
	}
	if req.SortOrder != nil && *req.SortOrder != section.SortOrder {
		if err := s.reorderSection(ctx, section, *req.SortOrder); err != nil {
			return model.CourseSectionResponse{}, err
		}
	} else {
		if err := s.catalogRepo.UpdateSection(ctx, section); err != nil {
			return model.CourseSectionResponse{}, core.InternalServerError("failed to update course section").WithError(err)
		}
	}
	return model.CourseSectionToResponse(*section), nil
}

func (s *learningService) DeleteSection(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.DeleteSection")()
	}
	if _, err := s.catalogRepo.GetSectionByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("course_section", id)
		}
		return core.InternalServerError("failed to fetch course section").WithError(err)
	}
	if err := s.catalogRepo.DeleteSection(ctx, id); err != nil {
		return core.InternalServerError("failed to delete course section").WithError(err)
	}
	return nil
}

func (s *learningService) CreateLesson(ctx context.Context, req model.CreateLessonRequest) (model.LessonResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.CreateLesson")()
	}
	req.CourseID = strings.TrimSpace(req.CourseID)
	req.SectionID = strings.TrimSpace(req.SectionID)
	req.Slug = strings.TrimSpace(req.Slug)
	req.Title = strings.TrimSpace(req.Title)
	req.Summary = strings.TrimSpace(req.Summary)
	req.VideoURL = strings.TrimSpace(req.VideoURL)
	req.AttachmentURL = strings.TrimSpace(req.AttachmentURL)
	if err := validator.Validate(req); err != nil {
		return model.LessonResponse{}, core.ValidationError(err)
	}
	section, err := s.catalogRepo.GetSectionByID(ctx, req.SectionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.LessonResponse{}, core.NotFound("course_section", req.SectionID)
		}
		return model.LessonResponse{}, core.InternalServerError("failed to fetch course section").WithError(err)
	}
	if section.CourseID != req.CourseID {
		return model.LessonResponse{}, core.ValidationError(fmt.Errorf("section_id does not belong to course_id"))
	}
	exists, err := s.catalogRepo.LessonSlugExists(ctx, req.CourseID, req.Slug, nil)
	if err != nil {
		return model.LessonResponse{}, core.InternalServerError("failed to check lesson slug").WithError(err)
	}
	if exists {
		return model.LessonResponse{}, core.Conflict("Lesson slug already exists in course")
	}
	prerequisiteLessonIDs, err := s.validateLessonPrerequisites(ctx, req.CourseID, "", req.PrerequisiteLessonIDs)
	if err != nil {
		return model.LessonResponse{}, err
	}
	lesson := req.ToModel()
	lesson.SortOrder = learningNextLessonSortOrder(section.Lessons)
	if err := s.catalogRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if err := s.catalogRepo.CreateLesson(tx, &lesson); err != nil {
			return err
		}
		return s.catalogRepo.ReplaceLessonPrerequisites(tx, lesson.ID, prerequisiteLessonIDs)
	}); err != nil {
		return model.LessonResponse{}, core.InternalServerError("failed to create lesson").WithError(err)
	}
	lesson.Prerequisites = make([]model.LessonPrerequisite, 0, len(prerequisiteLessonIDs))
	for _, prerequisiteLessonID := range prerequisiteLessonIDs {
		lesson.Prerequisites = append(lesson.Prerequisites, model.LessonPrerequisite{
			LessonID:             lesson.ID,
			PrerequisiteLessonID: prerequisiteLessonID,
		})
	}
	return model.LessonToResponse(lesson), nil
}

func (s *learningService) GetLesson(ctx context.Context, id string) (model.LessonResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.GetLesson")()
	}
	lesson, err := s.catalogRepo.GetLessonByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.LessonResponse{}, core.NotFound("lesson", id)
		}
		return model.LessonResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	return model.LessonToResponse(*lesson), nil
}

func (s *learningService) UpdateLesson(ctx context.Context, id string, req model.UpdateLessonRequest) (model.LessonResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.UpdateLesson")()
	}
	if req.Slug != nil {
		trimmed := strings.TrimSpace(*req.Slug)
		req.Slug = &trimmed
	}
	if req.Title != nil {
		trimmed := strings.TrimSpace(*req.Title)
		req.Title = &trimmed
	}
	if req.Summary != nil {
		trimmed := strings.TrimSpace(*req.Summary)
		req.Summary = &trimmed
	}
	if req.VideoURL != nil {
		trimmed := strings.TrimSpace(*req.VideoURL)
		req.VideoURL = &trimmed
	}
	if req.AttachmentURL != nil {
		trimmed := strings.TrimSpace(*req.AttachmentURL)
		req.AttachmentURL = &trimmed
	}
	if err := validator.Validate(req); err != nil {
		return model.LessonResponse{}, core.ValidationError(err)
	}
	lesson, err := s.catalogRepo.GetLessonWithSection(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.LessonResponse{}, core.NotFound("lesson", id)
		}
		return model.LessonResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	if req.Slug != nil && *req.Slug != lesson.Slug {
		exists, err := s.catalogRepo.LessonSlugExists(ctx, lesson.CourseID, *req.Slug, &lesson.ID)
		if err != nil {
			return model.LessonResponse{}, core.InternalServerError("failed to check lesson slug").WithError(err)
		}
		if exists {
			return model.LessonResponse{}, core.Conflict("Lesson slug already exists in course")
		}
		lesson.Slug = *req.Slug
	}
	if req.Title != nil {
		lesson.Title = *req.Title
	}
	if req.Summary != nil {
		lesson.Summary = req.Summary
	}
	if req.ContentJSON != nil {
		lesson.ContentJSON = model.LearningContent(req.ContentJSON)
	}
	if req.VideoURL != nil {
		lesson.VideoURL = req.VideoURL
	}
	if req.AttachmentURL != nil {
		lesson.AttachmentURL = req.AttachmentURL
	}
	if req.LessonType != nil {
		lesson.LessonType = *req.LessonType
	}
	if req.DurationMinutes != nil {
		lesson.DurationMinutes = *req.DurationMinutes
	}
	if req.IsPreview != nil {
		lesson.IsPreview = *req.IsPreview
	}
	if req.IsPublished != nil {
		lesson.IsPublished = *req.IsPublished
	}
	prerequisiteLessonIDs := []string(nil)
	if req.PrerequisiteLessonIDs != nil {
		prerequisiteLessonIDs, err = s.validateLessonPrerequisites(ctx, lesson.CourseID, lesson.ID, req.PrerequisiteLessonIDs)
		if err != nil {
			return model.LessonResponse{}, err
		}
	}
	if err := s.catalogRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if req.SortOrder != nil && *req.SortOrder != lesson.SortOrder {
			if err := s.reorderLesson(tx, lesson, *req.SortOrder); err != nil {
				return err
			}
		} else if err := s.catalogRepo.UpdateLesson(tx, lesson); err != nil {
			return err
		}
		if req.PrerequisiteLessonIDs != nil {
			return s.catalogRepo.ReplaceLessonPrerequisites(tx, lesson.ID, prerequisiteLessonIDs)
		}
		return nil
	}); err != nil {
		return model.LessonResponse{}, core.InternalServerError("failed to update lesson").WithError(err)
	}
	if req.PrerequisiteLessonIDs != nil {
		lesson.Prerequisites = make([]model.LessonPrerequisite, 0, len(prerequisiteLessonIDs))
		for _, prerequisiteLessonID := range prerequisiteLessonIDs {
			lesson.Prerequisites = append(lesson.Prerequisites, model.LessonPrerequisite{
				LessonID:             lesson.ID,
				PrerequisiteLessonID: prerequisiteLessonID,
			})
		}
	}
	return model.LessonToResponse(*lesson), nil
}

func (s *learningService) reorderSection(ctx context.Context, section *model.CourseSection, targetSortOrder int) error {
	course, err := s.catalogRepo.GetCourseByID(ctx, section.CourseID)
	if err != nil {
		return core.InternalServerError("failed to fetch course for section reorder").WithError(err)
	}

	targetSortOrder = learningClampSortOrder(targetSortOrder, len(course.Sections)-1)
	currentSortOrder := section.SortOrder
	if targetSortOrder == currentSortOrder {
		return s.catalogRepo.UpdateSection(ctx, section)
	}

	return s.catalogRepo.RunInTransaction(ctx, func(tx context.Context) error {
		temporarySection := *section
		temporarySection.SortOrder = -1
		if err := s.catalogRepo.UpdateSection(tx, &temporarySection); err != nil {
			return err
		}

		siblings := learningSortedSectionSiblings(course.Sections, section.ID)
		if targetSortOrder < currentSortOrder {
			for index := len(siblings) - 1; index >= 0; index-- {
				sibling := siblings[index]
				if sibling.SortOrder < targetSortOrder || sibling.SortOrder >= currentSortOrder {
					continue
				}
				nextSibling := sibling
				nextSibling.SortOrder++
				if err := s.catalogRepo.UpdateSection(tx, &nextSibling); err != nil {
					return err
				}
			}
		} else {
			for _, sibling := range siblings {
				if sibling.SortOrder <= currentSortOrder || sibling.SortOrder > targetSortOrder {
					continue
				}
				nextSibling := sibling
				nextSibling.SortOrder--
				if err := s.catalogRepo.UpdateSection(tx, &nextSibling); err != nil {
					return err
				}
			}
		}

		section.SortOrder = targetSortOrder
		return s.catalogRepo.UpdateSection(tx, section)
	})
}

func (s *learningService) reorderLesson(ctx context.Context, lesson *model.Lesson, targetSortOrder int) error {
	section, err := s.catalogRepo.GetSectionByID(ctx, lesson.SectionID)
	if err != nil {
		return core.InternalServerError("failed to fetch section for lesson reorder").WithError(err)
	}

	targetSortOrder = learningClampSortOrder(targetSortOrder, len(section.Lessons)-1)
	currentSortOrder := lesson.SortOrder
	if targetSortOrder == currentSortOrder {
		return s.catalogRepo.UpdateLesson(ctx, lesson)
	}

	lessons := make([]model.Lesson, 0, len(section.Lessons))
	for _, item := range section.Lessons {
		lessons = append(lessons, item)
	}

	return s.catalogRepo.RunInTransaction(ctx, func(tx context.Context) error {
		temporaryLesson := *lesson
		temporaryLesson.SortOrder = -1
		if err := s.catalogRepo.UpdateLesson(tx, &temporaryLesson); err != nil {
			return err
		}

		siblings := learningSortedLessonSiblings(lessons, lesson.ID)
		if targetSortOrder < currentSortOrder {
			for index := len(siblings) - 1; index >= 0; index-- {
				sibling := siblings[index]
				if sibling.SortOrder < targetSortOrder || sibling.SortOrder >= currentSortOrder {
					continue
				}
				nextSibling := sibling
				nextSibling.SortOrder++
				if err := s.catalogRepo.UpdateLesson(tx, &nextSibling); err != nil {
					return err
				}
			}
		} else {
			for _, sibling := range siblings {
				if sibling.SortOrder <= currentSortOrder || sibling.SortOrder > targetSortOrder {
					continue
				}
				nextSibling := sibling
				nextSibling.SortOrder--
				if err := s.catalogRepo.UpdateLesson(tx, &nextSibling); err != nil {
					return err
				}
			}
		}

		lesson.SortOrder = targetSortOrder
		return s.catalogRepo.UpdateLesson(tx, lesson)
	})
}

func learningNextSectionSortOrder(sections []model.CourseSection) int {
	maxOrder := -1
	for _, section := range sections {
		if section.SortOrder > maxOrder {
			maxOrder = section.SortOrder
		}
	}
	return maxOrder + 1
}

func learningNextLessonSortOrder(lessons []model.Lesson) int {
	maxOrder := -1
	for _, lesson := range lessons {
		if lesson.SortOrder > maxOrder {
			maxOrder = lesson.SortOrder
		}
	}
	return maxOrder + 1
}

func learningClampSortOrder(target, maxIndex int) int {
	if maxIndex < 0 {
		return 0
	}
	if target < 0 {
		return 0
	}
	if target > maxIndex {
		return maxIndex
	}
	return target
}

func learningSortedSectionSiblings(sections []model.CourseSection, excludeID string) []model.CourseSection {
	siblings := make([]model.CourseSection, 0, len(sections))
	for _, section := range sections {
		if section.ID == excludeID {
			continue
		}
		siblings = append(siblings, section)
	}
	sort.Slice(siblings, func(i, j int) bool {
		if siblings[i].SortOrder == siblings[j].SortOrder {
			return siblings[i].ID < siblings[j].ID
		}
		return siblings[i].SortOrder < siblings[j].SortOrder
	})
	return siblings
}

func learningSortedLessonSiblings(lessons []model.Lesson, excludeID string) []model.Lesson {
	siblings := make([]model.Lesson, 0, len(lessons))
	for _, lesson := range lessons {
		if lesson.ID == excludeID {
			continue
		}
		siblings = append(siblings, lesson)
	}
	sort.Slice(siblings, func(i, j int) bool {
		if siblings[i].SortOrder == siblings[j].SortOrder {
			return siblings[i].ID < siblings[j].ID
		}
		return siblings[i].SortOrder < siblings[j].SortOrder
	})
	return siblings
}

func (s *learningService) DeleteLesson(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "LearningService.DeleteLesson")()
	}
	if _, err := s.catalogRepo.GetLessonByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("lesson", id)
		}
		return core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	if err := s.catalogRepo.DeleteLesson(ctx, id); err != nil {
		return core.InternalServerError("failed to delete lesson").WithError(err)
	}
	return nil
}

func toCourseListResponse(result *repository.PageResult[model.Course]) model.CourseListResponse {
	data := make([]model.CourseResponse, 0, len(result.Data))
	for _, item := range result.Data {
		data = append(data, model.CourseToResponse(item))
	}

	return model.CourseListResponse{
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}
}
