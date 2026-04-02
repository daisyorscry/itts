package repository

import (
	"context"

	"be-itts-community/internal/model"
)

func (r *learningRepo) GetCertificateByCourseUser(ctx context.Context, courseID, userID string) (*model.CourseCertificate, error) {
	var certificate model.CourseCertificate
	if err := r.db.Get(ctx).
		Preload("Course").
		Preload("User").
		First(&certificate, "course_id = ? AND user_id = ?", courseID, userID).Error; err != nil {
		return nil, err
	}
	return &certificate, nil
}

func (r *learningRepo) GetCertificateByNumber(ctx context.Context, certificateNumber string) (*model.CourseCertificate, error) {
	var certificate model.CourseCertificate
	if err := r.db.Get(ctx).
		Preload("Course").
		Preload("User").
		First(&certificate, "certificate_number = ?", certificateNumber).Error; err != nil {
		return nil, err
	}
	return &certificate, nil
}

func (r *learningRepo) CreateCertificate(ctx context.Context, certificate *model.CourseCertificate) error {
	return r.db.Get(ctx).Create(certificate).Error
}

func (r *learningRepo) ListCertificates(ctx context.Context, p ListParams) (*PageResult[model.CourseCertificate], error) {
	base := r.db.Get(ctx).Model(&model.CourseCertificate{}).Preload("Course").Preload("User")
	return r.listCertificates(ctx, base, p)
}

func (r *learningRepo) ListCertificatesByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.CourseCertificate], error) {
	base := r.db.Get(ctx).Model(&model.CourseCertificate{}).Where("user_id = ?", userID).Preload("Course").Preload("User")
	return r.listCertificates(ctx, base, p)
}
