package repository

import (
	"context"

	"be-itts-community/internal/model"
	"gorm.io/gorm"
)

func (r *learningRepo) CreateQuiz(ctx context.Context, quiz *model.Quiz) error {
	return r.db.Get(ctx).Create(quiz).Error
}

func (r *learningRepo) CreateQuizQuestion(ctx context.Context, question *model.QuizQuestion) error {
	return r.db.Get(ctx).Create(question).Error
}

func (r *learningRepo) CreateQuizOption(ctx context.Context, option *model.QuizOption) error {
	return r.db.Get(ctx).Create(option).Error
}

func (r *learningRepo) GetQuizByID(ctx context.Context, id string) (*model.Quiz, error) {
	var quiz model.Quiz
	err := r.db.Get(ctx).
		Preload("Questions", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		Preload("Questions.Options", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		First(&quiz, "id = ?", id).Error
	if err != nil {
		return nil, err
	}
	return &quiz, nil
}

func (r *learningRepo) GetQuizByLessonID(ctx context.Context, lessonID string) (*model.Quiz, error) {
	var quiz model.Quiz
	err := r.db.Get(ctx).
		Preload("Questions", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		Preload("Questions.Options", func(db *gorm.DB) *gorm.DB { return db.Order("sort_order ASC") }).
		First(&quiz, "lesson_id = ?", lessonID).Error
	if err != nil {
		return nil, err
	}
	return &quiz, nil
}

func (r *learningRepo) UpdateQuiz(ctx context.Context, quiz *model.Quiz) error {
	return r.db.Get(ctx).Save(quiz).Error
}

func (r *learningRepo) DeleteQuiz(ctx context.Context, id string) error {
	return r.db.Get(ctx).Delete(&model.Quiz{}, "id = ?", id).Error
}

func (r *learningRepo) DeleteQuizQuestions(ctx context.Context, quizID string) error {
	return r.db.Get(ctx).Delete(&model.QuizQuestion{}, "quiz_id = ?", quizID).Error
}

func (r *learningRepo) CreateQuizAttempt(ctx context.Context, attempt *model.QuizAttempt) error {
	return r.db.Get(ctx).Create(attempt).Error
}

func (r *learningRepo) CreateQuizAttemptAnswer(ctx context.Context, answer *model.QuizAttemptAnswer) error {
	return r.db.Get(ctx).Create(answer).Error
}

func (r *learningRepo) CountQuizAttemptsByUser(ctx context.Context, quizID, userID string) (int64, error) {
	var count int64
	err := r.db.Get(ctx).Model(&model.QuizAttempt{}).
		Where("quiz_id = ? AND user_id = ?", quizID, userID).
		Count(&count).Error
	return count, err
}
