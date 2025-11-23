package model

import (
	"strconv"
	"time"
)

// Registration DTOs

type RegisterRequest struct {
	FullName   string      `json:"full_name" validate:"required,min=3"`
	Email      string      `json:"email" validate:"required,email"`
	Program    ProgramEnum `json:"program" validate:"required,oneof=networking devsecops programming"`
	StudentID  int         `json:"student_id" validate:"required"`
	IntakeYear int         `json:"intake_year" validate:"required,gte=2000,lte=2100"`
	Motivation string      `json:"motivation" validate:"required,min=10"`
}

type AdminApproveRequest struct {
	ID      string `json:"id" validate:"required"`
	AdminID string `json:"admin_id" validate:"required"`
}

type AdminRejectRequest struct {
	ID      string `json:"id" validate:"required"`
	AdminID string `json:"admin_id" validate:"required"`
	Reason  string `json:"reason" validate:"required,min=5"`
}

type RegistrationResponse struct {
	ID              string             `json:"id"`
	FullName        string             `json:"full_name"`
	Email           string             `json:"email"`
	Program         ProgramEnum        `json:"program"`
	StudentID       string             `json:"student_id"`
	IntakeYear      int                `json:"intake_year"`
	Motivation      string             `json:"motivation"`
	Status          RegistrationStatus `json:"status"`
	ApprovedBy      *string            `json:"approved_by,omitempty"`
	ApprovedAt      *time.Time         `json:"approved_at,omitempty"`
	RejectedReason  *string            `json:"rejected_reason,omitempty"`
	EmailVerifiedAt *time.Time         `json:"email_verified_at,omitempty"`
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
}

type RegistrationListResponse struct {
	Data       []RegistrationResponse `json:"data"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"page_size"`
	TotalPages int                    `json:"total_pages"`
}

func (r RegisterRequest) ToModel() Registration {
	return Registration{
		FullName:   r.FullName,
		Email:      r.Email,
		Program:    r.Program,
		StudentID:  strconv.Itoa(r.StudentID),
		IntakeYear: r.IntakeYear,
		Motivation: r.Motivation,
		Status:     RegPending,
	}
}

func RegistrationToResponse(m Registration) RegistrationResponse {
	return RegistrationResponse{
		ID:              m.ID,
		FullName:        m.FullName,
		Email:           m.Email,
		Program:         m.Program,
		StudentID:       m.StudentID,
		IntakeYear:      m.IntakeYear,
		Motivation:      m.Motivation,
		Status:          m.Status,
		ApprovedBy:      m.ApprovedBy,
		ApprovedAt:      m.ApprovedAt,
		RejectedReason:  m.RejectedReason,
		EmailVerifiedAt: m.EmailVerifiedAt,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
	}
}
