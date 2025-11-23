package model

import "time"

// Event DTOs

type CreateEventRequest struct {
	Slug        string      `json:"slug"`
	Title       string      `json:"title" validate:"required,min=3"`
	Summary     string      `json:"summary"`
	Description string      `json:"description"`
	ImageURL    string      `json:"image_url"`
	Program     ProgramEnum `json:"program" validate:"omitempty,oneof=networking devsecops programming"`
	Status      EventStatus `json:"status" validate:"omitempty,oneof=draft open ongoing closed"`
	StartsAt    time.Time   `json:"starts_at" validate:"required"`
	EndsAt      *time.Time  `json:"ends_at"`
	Venue       string      `json:"venue"`
}

type UpdateEventRequest struct {
	Slug        *string      `json:"slug,omitempty"`
	Title       *string      `json:"title,omitempty" validate:"omitempty,min=3"`
	Summary     *string      `json:"summary,omitempty"`
	Description *string      `json:"description,omitempty"`
	ImageURL    *string      `json:"image_url,omitempty"`
	Program     *ProgramEnum `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	Status      *EventStatus `json:"status,omitempty" validate:"omitempty,oneof=draft open ongoing closed"`
	StartsAt    *time.Time   `json:"starts_at,omitempty"`
	EndsAt      *time.Time   `json:"ends_at,omitempty"`
	Venue       *string      `json:"venue,omitempty"`
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
	EventID  string `json:"event_id" validate:"required,uuid4"`
	FullName string `json:"full_name" validate:"required,min=3"`
	Email    string `json:"email" validate:"required,email"`
}

type UpdateEventRegistrationRequest struct {
	FullName *string `json:"full_name,omitempty" validate:"omitempty,min=3"`
	Email    *string `json:"email,omitempty" validate:"omitempty,email"`
}

type EventResponse struct {
	ID          string            `json:"id"`
	Slug        string            `json:"slug,omitempty"`
	Title       string            `json:"title"`
	Summary     string            `json:"summary,omitempty"`
	Description string            `json:"description,omitempty"`
	ImageURL    string            `json:"image_url,omitempty"`
	Program     string            `json:"program,omitempty"`
	Status      EventStatus       `json:"status"`
	StartsAt    time.Time         `json:"starts_at"`
	EndsAt      *time.Time        `json:"ends_at,omitempty"`
	Venue       string            `json:"venue,omitempty"`
	Speakers    []SpeakerResponse `json:"speakers,omitempty"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
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
	ID        string    `json:"id"`
	EventID   string    `json:"event_id"`
	FullName  string    `json:"full_name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
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
	if r.ImageURL != "" {
		ev.ImageURL = &r.ImageURL
	}
	if r.Program != "" {
		ev.Program = &r.Program
	}
	if r.Status != "" {
		ev.Status = r.Status
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
	return EventRegistration{
		EventID:  r.EventID,
		FullName: r.FullName,
		Email:    r.Email,
	}
}

func EventToResponse(m Event) EventResponse {
	resp := EventResponse{
		ID:        m.ID,
		Title:     m.Title,
		Status:    m.Status,
		StartsAt:  m.StartsAt,
		EndsAt:    m.EndsAt,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
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
	}
	if m.Program != nil {
		resp.Program = string(*m.Program)
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

func EventRegistrationToResponse(m EventRegistration) EventRegistrationResponse {
	return EventRegistrationResponse{
		ID:        m.ID,
		EventID:   m.EventID,
		FullName:  m.FullName,
		Email:     m.Email,
		CreatedAt: m.CreatedAt,
	}
}

func EventRegistrationListToResponse(data []EventRegistration, total int64, page, pageSize, totalPages int) EventRegistrationListResponse {
	resp := make([]EventRegistrationResponse, 0, len(data))
	for _, reg := range data {
		resp = append(resp, EventRegistrationToResponse(reg))
	}
	return EventRegistrationListResponse{
		Data:       resp,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}
}
