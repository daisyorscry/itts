package model

import "time"

// Mentor DTOs

type CreateMentorRequest struct {
	FullName  string        `json:"full_name" validate:"required,min=3"`
	Title     string        `json:"title"`
	Bio       string        `json:"bio"`
	AvatarURL string        `json:"avatar_url"`
	Programs  []ProgramEnum `json:"programs"`
	IsActive  *bool         `json:"is_active"`
	Priority  *int          `json:"priority"`
}

type UpdateMentorRequest struct {
	FullName  *string       `json:"full_name,omitempty" validate:"omitempty,min=3"`
	Title     *string       `json:"title,omitempty"`
	Bio       *string       `json:"bio,omitempty"`
	AvatarURL *string       `json:"avatar_url,omitempty"`
	Programs  []ProgramEnum `json:"programs,omitempty"`
	IsActive  *bool         `json:"is_active,omitempty"`
	Priority  *int          `json:"priority,omitempty"`
}

type SetMentorActiveRequest struct {
	ID     string `json:"id" validate:"required"`
	Active bool   `json:"active"`
}

type SetMentorPriorityRequest struct {
	ID       string `json:"id" validate:"required"`
	Priority int    `json:"priority" validate:"gte=0"`
}

type MentorResponse struct {
	ID        string        `json:"id"`
	FullName  string        `json:"full_name"`
	Title     string        `json:"title,omitempty"`
	Bio       string        `json:"bio,omitempty"`
	AvatarURL string        `json:"avatar_url,omitempty"`
	Programs  []ProgramEnum `json:"programs,omitempty"`
	IsActive  bool          `json:"is_active"`
	Priority  int           `json:"priority"`
	CreatedAt time.Time     `json:"created_at"`
	UpdatedAt time.Time     `json:"updated_at"`
}

type MentorListResponse struct {
	Data       []MentorResponse `json:"data"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}

func (r CreateMentorRequest) ToModel() Mentor {
	m := Mentor{
		FullName: r.FullName,
		Programs: r.Programs,
		IsActive: true,
		Priority: 0,
	}
	if r.Title != "" {
		m.Title = &r.Title
	}
	if r.Bio != "" {
		m.Bio = &r.Bio
	}
	if r.AvatarURL != "" {
		m.AvatarURL = &r.AvatarURL
	}
	if r.IsActive != nil {
		m.IsActive = *r.IsActive
	}
	if r.Priority != nil {
		m.Priority = *r.Priority
	}
	return m
}

func MentorToResponse(m Mentor) MentorResponse {
	resp := MentorResponse{
		ID:        m.ID,
		FullName:  m.FullName,
		Programs:  m.Programs,
		IsActive:  m.IsActive,
		Priority:  m.Priority,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if m.Title != nil {
		resp.Title = *m.Title
	}
	if m.Bio != nil {
		resp.Bio = *m.Bio
	}
	if m.AvatarURL != nil {
		resp.AvatarURL = *m.AvatarURL
	}
	return resp
}
