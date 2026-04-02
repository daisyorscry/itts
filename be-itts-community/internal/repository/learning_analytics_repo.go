package repository

import (
	"context"

	"be-itts-community/internal/model"
)

func (r *learningRepo) GetLearningAnalyticsOverview(ctx context.Context) (model.LearningAnalyticsOverviewResponse, error) {
	type overviewRow struct {
		TotalCourses               int64
		PublishedCourses           int64
		TotalEnrollments           int64
		CompletedEnrollments       int64
		TotalCertificatesIssued    int64
		TotalQuizAttempts          int64
		TotalAssignmentSubmissions int64
	}

	var row overviewRow
	if err := r.db.Get(ctx).Raw(`
		SELECT
			(SELECT COUNT(*) FROM courses) AS total_courses,
			(SELECT COUNT(*) FROM courses WHERE status = 'published') AS published_courses,
			(SELECT COUNT(*) FROM course_enrollments) AS total_enrollments,
			(SELECT COUNT(*) FROM course_enrollments WHERE status = 'completed') AS completed_enrollments,
			(SELECT COUNT(*) FROM course_certificates WHERE status = 'issued') AS total_certificates_issued,
			(SELECT COUNT(*) FROM quiz_attempts) AS total_quiz_attempts,
			(SELECT COUNT(*) FROM assignment_submissions) AS total_assignment_submissions
	`).Scan(&row).Error; err != nil {
		return model.LearningAnalyticsOverviewResponse{}, err
	}

	completionRate := 0.0
	if row.TotalEnrollments > 0 {
		completionRate = (float64(row.CompletedEnrollments) / float64(row.TotalEnrollments)) * 100
	}

	return model.LearningAnalyticsOverviewResponse{
		TotalCourses:               row.TotalCourses,
		PublishedCourses:           row.PublishedCourses,
		TotalEnrollments:           row.TotalEnrollments,
		CompletedEnrollments:       row.CompletedEnrollments,
		CompletionRate:             completionRate,
		TotalCertificatesIssued:    row.TotalCertificatesIssued,
		TotalQuizAttempts:          row.TotalQuizAttempts,
		TotalAssignmentSubmissions: row.TotalAssignmentSubmissions,
	}, nil
}

func (r *learningRepo) ListCourseAnalytics(ctx context.Context, p ListParams) (*PageResult[model.CourseAnalyticsResponse], error) {
	base := r.db.Get(ctx).Table("courses").
		Joins(`LEFT JOIN (
			SELECT course_id, COUNT(*) AS enrollments, COUNT(*) FILTER (WHERE status = 'completed') AS completed_enrollments
			FROM course_enrollments
			GROUP BY course_id
		) ce ON ce.course_id = courses.id`).
		Joins(`LEFT JOIN (
			SELECT lessons.course_id AS course_id, COUNT(quiz_attempts.id) AS quiz_attempts, COALESCE(AVG(quiz_attempts.score), 0) AS average_quiz_score
			FROM lessons
			JOIN quizzes ON quizzes.lesson_id = lessons.id
			LEFT JOIN quiz_attempts ON quiz_attempts.quiz_id = quizzes.id
			GROUP BY lessons.course_id
		) qa ON qa.course_id = courses.id`).
		Joins(`LEFT JOIN (
			SELECT course_id, COUNT(*) AS certificates_issued
			FROM course_certificates
			WHERE status = 'issued'
			GROUP BY course_id
		) cc ON cc.course_id = courses.id`).
		Joins(`LEFT JOIN (
			SELECT lessons.course_id AS course_id, COUNT(assignment_submissions.id) AS assignment_submissions
			FROM lessons
			JOIN assignments ON assignments.lesson_id = lessons.id
			LEFT JOIN assignment_submissions ON assignment_submissions.assignment_id = assignments.id
			GROUP BY lessons.course_id
		) ass ON ass.course_id = courses.id`)

	searchable := []string{"courses.slug", "courses.title"}
	sorts := map[string]string{
		"title":                  "courses.title",
		"slug":                   "courses.slug",
		"status":                 "courses.status",
		"enrollments":            "COALESCE(ce.enrollments, 0)",
		"completed_enrollments":  "COALESCE(ce.completed_enrollments, 0)",
		"certificates_issued":    "COALESCE(cc.certificates_issued, 0)",
		"quiz_attempts":          "COALESCE(qa.quiz_attempts, 0)",
		"average_quiz_score":     "COALESCE(qa.average_quiz_score, 0)",
		"assignment_submissions": "COALESCE(ass.assignment_submissions, 0)",
		"created_at":             "courses.created_at",
	}

	q, err := ApplyListQuery(base, &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	if len(p.Sort) == 0 {
		q = q.Order("courses.created_at DESC")
	}
	q = q.Select(`
		courses.id AS course_id,
		courses.title AS course_title,
		courses.slug AS course_slug,
		courses.status AS status,
		COALESCE(ce.enrollments, 0) AS enrollments,
		COALESCE(ce.completed_enrollments, 0) AS completed_enrollments,
		CASE
			WHEN COALESCE(ce.enrollments, 0) = 0 THEN 0
			ELSE (COALESCE(ce.completed_enrollments, 0)::float / ce.enrollments::float) * 100
		END AS completion_rate,
		COALESCE(cc.certificates_issued, 0) AS certificates_issued,
		COALESCE(qa.quiz_attempts, 0) AS quiz_attempts,
		COALESCE(qa.average_quiz_score, 0) AS average_quiz_score,
		COALESCE(ass.assignment_submissions, 0) AS assignment_submissions
	`)

	var rows []model.CourseAnalyticsResponse
	return Paginate[model.CourseAnalyticsResponse](ctx, q, &p, &rows)
}
