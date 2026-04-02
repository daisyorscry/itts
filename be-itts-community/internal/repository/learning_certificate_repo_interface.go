package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type LearningCertificateRepository interface {
	GetCertificateByCourseUser(ctx context.Context, courseID, userID string) (*model.CourseCertificate, error)
	GetCertificateByNumber(ctx context.Context, certificateNumber string) (*model.CourseCertificate, error)
	CreateCertificate(ctx context.Context, certificate *model.CourseCertificate) error
	ListCertificates(ctx context.Context, p ListParams) (*PageResult[model.CourseCertificate], error)
	ListCertificatesByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.CourseCertificate], error)
}
