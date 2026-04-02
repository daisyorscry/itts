package service

import (
	"context"
	"errors"
	"strings"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

func (s *learningService) ListCertificates(ctx context.Context, p repository.ListParams) (model.CourseCertificateListResponse, error) {
	result, err := s.certificateRepo.ListCertificates(ctx, p)
	if err != nil {
		return model.CourseCertificateListResponse{}, core.InternalServerError("failed to list certificates").WithError(err)
	}
	return toCertificateListResponse(result), nil
}

func (s *learningService) ListMyCertificates(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.CourseCertificateListResponse, error) {
	if authCtx == nil || authCtx.UserID == "" {
		return model.CourseCertificateListResponse{}, core.Unauthorized("authentication required")
	}
	result, err := s.certificateRepo.ListCertificatesByUser(ctx, authCtx.UserID, p)
	if err != nil {
		return model.CourseCertificateListResponse{}, core.InternalServerError("failed to list certificates").WithError(err)
	}
	return toCertificateListResponse(result), nil
}

func (s *learningService) VerifyCertificate(ctx context.Context, certificateNumber string) (model.CertificateVerificationResponse, error) {
	certificateNumber = strings.TrimSpace(certificateNumber)
	if certificateNumber == "" {
		return model.CertificateVerificationResponse{}, core.ValidationError(errors.New("certificate_number is required"))
	}
	certificate, err := s.certificateRepo.GetCertificateByNumber(ctx, certificateNumber)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.CertificateVerificationResponse{Verified: false}, nil
		}
		return model.CertificateVerificationResponse{}, core.InternalServerError("failed to verify certificate").WithError(err)
	}
	if certificate.Status != model.CertificateStatusIssued {
		return model.CertificateVerificationResponse{
			Verified:    false,
			Certificate: model.CourseCertificateToResponse(*certificate),
		}, nil
	}
	return model.CertificateVerificationResponse{
		Verified:    true,
		Certificate: model.CourseCertificateToResponse(*certificate),
	}, nil
}

func toCertificateListResponse(result *repository.PageResult[model.CourseCertificate]) model.CourseCertificateListResponse {
	data := make([]model.CourseCertificateResponse, 0, len(result.Data))
	for _, item := range result.Data {
		data = append(data, model.CourseCertificateToResponse(item))
	}
	return model.CourseCertificateListResponse{
		Data:       data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}
}
