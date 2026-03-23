package model

import "time"

// Event DTOs

type CreateEventRequest struct {
	Slug                 string      `json:"slug"`
	Title                string      `json:"title" validate:"required,min=3"`
	Summary              string      `json:"summary"`
	Description          string      `json:"description"`
	ImageURL             string      `json:"image_url"`
	FilePath             string      `json:"file_path"`
	Benefits             []string    `json:"benefits"`
	Program              ProgramEnum `json:"program" validate:"omitempty,oneof=networking devsecops programming"`
	Status               EventStatus `json:"status" validate:"omitempty,oneof=draft open ongoing closed"`
	Capacity             int         `json:"capacity" validate:"gte=0"`
	RegistrationDeadline *time.Time  `json:"registration_deadline"`
	IsPaid               bool        `json:"is_paid"`
	Price                int64       `json:"price" validate:"gte=0"`
	Currency             string      `json:"currency"`
	StartsAt             time.Time   `json:"starts_at" validate:"required"`
	EndsAt               *time.Time  `json:"ends_at"`
	Venue                string      `json:"venue"`
}

type UpdateEventRequest struct {
	Slug                 *string      `json:"slug,omitempty"`
	Title                *string      `json:"title,omitempty" validate:"omitempty,min=3"`
	Summary              *string      `json:"summary,omitempty"`
	Description          *string      `json:"description,omitempty"`
	ImageURL             *string      `json:"image_url,omitempty"`
	FilePath             *string      `json:"file_path,omitempty"`
	Benefits             *[]string    `json:"benefits,omitempty"`
	Program              *ProgramEnum `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	Status               *EventStatus `json:"status,omitempty" validate:"omitempty,oneof=draft open ongoing closed"`
	Capacity             *int         `json:"capacity,omitempty" validate:"omitempty,gte=0"`
	RegistrationDeadline *time.Time   `json:"registration_deadline,omitempty"`
	IsPaid               *bool        `json:"is_paid,omitempty"`
	Price                *int64       `json:"price,omitempty" validate:"omitempty,gte=0"`
	Currency             *string      `json:"currency,omitempty"`
	StartsAt             *time.Time   `json:"starts_at,omitempty"`
	EndsAt               *time.Time   `json:"ends_at,omitempty"`
	Venue                *string      `json:"venue,omitempty"`
}

type SetEventStatusRequest struct {
	ID     string      `json:"id" validate:"required"`
	Status EventStatus `json:"status" validate:"required,oneof=draft open ongoing closed"`
}

// Speakers

type CreateSpeakerRequest struct {
	EventID   string `json:"event_id" validate:"required,uuid4"`
	Name      string `json:"name" validate:"required,min=2"`
	Title     string `json:"title"`
	AvatarURL string `json:"avatar_url"`
	SortOrder *int   `json:"sort_order"`
}

type UpdateSpeakerRequest struct {
	EventID   *string `json:"event_id,omitempty" validate:"omitempty,uuid4"`
	Name      *string `json:"name,omitempty" validate:"omitempty,min=2"`
	Title     *string `json:"title,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type SetSpeakerOrderRequest struct {
	ID    string `json:"id" validate:"required"`
	Order int    `json:"order" validate:"gte=0"`
}

// Registrations

type CreateEventRegistrationRequest struct {
	EventID     string `json:"event_id" validate:"required"`
	FullName    string `json:"full_name" validate:"required,min=3"`
	Email       string `json:"email" validate:"required,email"`
	PhoneNumber string `json:"phone_number,omitempty"`
	Institution string `json:"institution,omitempty"`
}

type UpdateEventRegistrationRequest struct {
	FullName    *string                  `json:"full_name,omitempty" validate:"omitempty,min=3"`
	Email       *string                  `json:"email,omitempty" validate:"omitempty,email"`
	PhoneNumber *string                  `json:"phone_number,omitempty"`
	Institution *string                  `json:"institution,omitempty"`
	Status      *EventRegistrationStatus `json:"status,omitempty"`
}

type VerifyEventRegistrationRequest struct {
	Token string `json:"token" validate:"required"`
}

type CreateEventRegistrationPaymentRequest struct {
	Provider string `json:"provider" validate:"required"`
}

type EventRegistrationStatusUpdateRequest struct {
	Status EventRegistrationStatus `json:"status" validate:"required"`
}

type EventResponse struct {
	ID                   string            `json:"id"`
	Slug                 string            `json:"slug,omitempty"`
	Title                string            `json:"title"`
	Summary              string            `json:"summary,omitempty"`
	Description          string            `json:"description,omitempty"`
	ImageURL             string            `json:"image_url,omitempty"`
	FilePath             string            `json:"file_path,omitempty"`
	Benefits             []string          `json:"benefits,omitempty"`
	Program              string            `json:"program,omitempty"`
	Status               EventStatus       `json:"status"`
	Capacity             int               `json:"capacity"`
	RemainingSlots       int               `json:"remaining_slots"`
	RegistrationDeadline *time.Time        `json:"registration_deadline,omitempty"`
	IsPaid               bool              `json:"is_paid"`
	Price                int64             `json:"price"`
	Currency             string            `json:"currency,omitempty"`
	StartsAt             time.Time         `json:"starts_at"`
	EndsAt               *time.Time        `json:"ends_at,omitempty"`
	Venue                string            `json:"venue,omitempty"`
	Speakers             []SpeakerResponse `json:"speakers,omitempty"`
	CreatedAt            time.Time         `json:"created_at"`
	UpdatedAt            time.Time         `json:"updated_at"`
}

type SpeakerResponse struct {
	ID        string `json:"id"`
	EventID   string `json:"event_id"`
	Name      string `json:"name"`
	Title     string `json:"title,omitempty"`
	AvatarURL string `json:"avatar_url,omitempty"`
	SortOrder int    `json:"sort_order"`
}

type EventRegistrationResponse struct {
	ID            string                  `json:"id"`
	EventID       string                  `json:"event_id"`
	FullName      string                  `json:"full_name"`
	Email         string                  `json:"email"`
	PhoneNumber   string                  `json:"phone_number,omitempty"`
	Institution   string                  `json:"institution,omitempty"`
	Status        EventRegistrationStatus `json:"status"`
	PaymentStatus EventPaymentStatus      `json:"payment_status"`
	PaymentURL    string                  `json:"payment_url,omitempty"`
	VerifiedAt    *time.Time              `json:"verified_at,omitempty"`
	ApprovedAt    *time.Time              `json:"approved_at,omitempty"`
	WaitlistedAt  *time.Time              `json:"waitlisted_at,omitempty"`
	RejectedAt    *time.Time              `json:"rejected_at,omitempty"`
	CreatedAt     time.Time               `json:"created_at"`
}

type EventListResponse struct {
	Data       []EventResponse `json:"data"`
	Total      int64           `json:"total"`
	Page       int             `json:"page"`
	PageSize   int             `json:"page_size"`
	TotalPages int             `json:"total_pages"`
}

type SpeakerListResponse struct {
	Data       []SpeakerResponse `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

type EventRegistrationListResponse struct {
	Data       []EventRegistrationResponse `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

func (r CreateEventRequest) ToModel() Event {
	ev := Event{
		Title:    r.Title,
		StartsAt: r.StartsAt,
		EndsAt:   r.EndsAt,
		Status:   EventDraft,
	}
	if r.Slug != "" {
		ev.Slug = &r.Slug
	}
	if r.Summary != "" {
		ev.Summary = &r.Summary
	}
	if r.Description != "" {
		ev.Description = &r.Description
	}
	imagePath := r.ImageURL
	if imagePath == "" {
		imagePath = r.FilePath
	}
	if imagePath != "" {
		ev.ImageURL = &imagePath
	}
	if len(r.Benefits) > 0 {
		ev.Benefits = append(StringArray{}, r.Benefits...)
	}
	if r.Program != "" {
		ev.Program = &r.Program
	}
	if r.Status != "" {
		ev.Status = r.Status
	}
	if r.Capacity > 0 {
		ev.Capacity = r.Capacity
	}
	if r.RegistrationDeadline != nil {
		ev.RegistrationDeadline = r.RegistrationDeadline
	}
	ev.IsPaid = r.IsPaid
	ev.Price = r.Price
	if r.Currency != "" {
		ev.Currency = r.Currency
	} else {
		ev.Currency = "IDR"
	}
	if r.Venue != "" {
		ev.Venue = &r.Venue
	}
	return ev
}

func (r CreateSpeakerRequest) ToModel() EventSpeaker {
	sp := EventSpeaker{
		EventID: r.EventID,
		Name:    r.Name,
	}
	if r.Title != "" {
		sp.Title = &r.Title
	}
	if r.AvatarURL != "" {
		sp.AvatarURL = &r.AvatarURL
	}
	if r.SortOrder != nil {
		sp.SortOrder = *r.SortOrder
	}
	return sp
}

func (r CreateEventRegistrationRequest) ToModel() EventRegistration {
	reg := EventRegistration{
		EventID:       r.EventID,
		FullName:      r.FullName,
		Email:         r.Email,
		Status:        EventRegistrationPendingVerification,
		PaymentStatus: EventPaymentNotRequired,
	}
	if r.PhoneNumber != "" {
		reg.PhoneNumber = &r.PhoneNumber
	}
	if r.Institution != "" {
		reg.Institution = &r.Institution
	}
	return reg
}

func EventToResponse(m Event) EventResponse {
	resp := EventResponse{
		ID:             m.ID,
		Title:          m.Title,
		Status:         m.Status,
		Capacity:       m.Capacity,
		IsPaid:         m.IsPaid,
		Price:          m.Price,
		Currency:       m.Currency,
		StartsAt:       m.StartsAt,
		EndsAt:         m.EndsAt,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
		RemainingSlots: m.Capacity,
	}
	if m.Slug != nil {
		resp.Slug = *m.Slug
	}
	if m.Summary != nil {
		resp.Summary = *m.Summary
	}
	if m.Description != nil {
		resp.Description = *m.Description
	}
	if m.ImageURL != nil {
		resp.ImageURL = *m.ImageURL
		resp.FilePath = *m.ImageURL
	}
	if len(m.Benefits) > 0 {
		resp.Benefits = append([]string{}, m.Benefits...)
	}
	if m.Program != nil {
		resp.Program = string(*m.Program)
	}
	if m.RegistrationDeadline != nil {
		resp.RegistrationDeadline = m.RegistrationDeadline
	}
	if m.Venue != nil {
		resp.Venue = *m.Venue
	}
	if len(m.Speakers) > 0 {
		resp.Speakers = make([]SpeakerResponse, 0, len(m.Speakers))
		for _, sp := range m.Speakers {
			resp.Speakers = append(resp.Speakers, SpeakerToResponse(sp))
		}
	}
	return resp
}

func SpeakerToResponse(m EventSpeaker) SpeakerResponse {
	resp := SpeakerResponse{
		ID:        m.ID,
		EventID:   m.EventID,
		Name:      m.Name,
		SortOrder: m.SortOrder,
	}
	if m.Title != nil {
		resp.Title = *m.Title
	}
	if m.AvatarURL != nil {
		resp.AvatarURL = *m.AvatarURL
	}
	return resp
}

func EventRegistrationToResponse(m EventRegistration) EventRegistrationResponse {
	resp := EventRegistrationResponse{
		ID:            m.ID,
		EventID:       m.EventID,
		FullName:      m.FullName,
		Email:         m.Email,
		Status:        m.Status,
		PaymentStatus: m.PaymentStatus,
		VerifiedAt:    m.EmailVerifiedAt,
		ApprovedAt:    m.ApprovedAt,
		WaitlistedAt:  m.WaitlistedAt,
		RejectedAt:    m.RejectedAt,
		CreatedAt:     m.CreatedAt,
	}
	if m.PhoneNumber != nil {
		resp.PhoneNumber = *m.PhoneNumber
	}
	if m.Institution != nil {
		resp.Institution = *m.Institution
	}
	if m.PaymentURL != nil {
		resp.PaymentURL = *m.PaymentURL
	}
	return resp
}

func EventRegistrationListToResponse(data []EventRegistration, total int64, page, pageSize, totalPages int) EventRegistrationListResponse {
	resp := make([]EventRegistrationResponse, 0, len(data))
	for _, item := range data {
		resp = append(resp, EventRegistrationToResponse(item))
	}
	return EventRegistrationListResponse{
		Data:       resp,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}

func SpeakerListToResponse(data []EventSpeaker, total int64, page, pageSize, totalPages int) SpeakerListResponse {
	resp := make([]SpeakerResponse, 0, len(data))
	for _, sp := range data {
		resp = append(resp, SpeakerToResponse(sp))
	}
	return SpeakerListResponse{
		Data:       resp,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
