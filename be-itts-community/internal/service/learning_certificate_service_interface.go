package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

type LearningCertificateService interface {
	ListCertificates(ctx context.Context, p repository.ListParams) (model.CourseCertificateListResponse, error)
	ListMyCertificates(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.CourseCertificateListResponse, error)
	VerifyCertificate(ctx context.Context, certificateNumber string) (model.CertificateVerificationResponse, error)
}
