package model

import "time"

// Partner DTOs

type CreatePartnerRequest struct {
	Name        string      `json:"name" validate:"required,min=2"`
	Kind        PartnerType `json:"kind" validate:"required,oneof=lab partner_academic partner_industry"`
	Subtitle    string      `json:"subtitle"`
	Description string      `json:"description"`
	LogoURL     string      `json:"logo_url"`
	WebsiteURL  string      `json:"website_url"`
	IsActive    *bool       `json:"is_active"`
	Priority    *int        `json:"priority"`
}

type UpdatePartnerRequest struct {
	Name        *string      `json:"name,omitempty" validate:"omitempty,min=2"`
	Kind        *PartnerType `json:"kind,omitempty" validate:"omitempty,oneof=lab partner_academic partner_industry"`
	Subtitle    *string      `json:"subtitle,omitempty"`
	Description *string      `json:"description,omitempty"`
	LogoURL     *string      `json:"logo_url,omitempty"`
	WebsiteURL  *string      `json:"website_url,omitempty"`
	IsActive    *bool        `json:"is_active,omitempty"`
	Priority    *int         `json:"priority,omitempty"`
}

type SetPartnerActiveRequest struct {
	ID     string `json:"id" validate:"required"`
	Active bool   `json:"active"`
}

type SetPartnerPriorityRequest struct {
	ID       string `json:"id" validate:"required"`
	Priority int    `json:"priority" validate:"gte=0"`
}

type PartnerResponse struct {
	ID          string      `json:"id"`
	Name        string      `json:"name"`
	Kind        PartnerType `json:"kind"`
	Subtitle    string      `json:"subtitle,omitempty"`
	Description string      `json:"description,omitempty"`
	LogoURL     string      `json:"logo_url,omitempty"`
	WebsiteURL  string      `json:"website_url,omitempty"`
	IsActive    bool        `json:"is_active"`
	Priority    int         `json:"priority"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
}

type PartnerListResponse struct {
	Data       []PartnerResponse `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

func (r CreatePartnerRequest) ToModel() Partner {
	p := Partner{
		Name:     r.Name,
		Kind:     r.Kind,
		IsActive: true,
		Priority: 0,
	}
	if r.Subtitle != "" {
		p.Subtitle = &r.Subtitle
	}
	if r.Description != "" {
		p.Description = &r.Description
	}
	if r.LogoURL != "" {
		p.LogoURL = &r.LogoURL
	}
	if r.WebsiteURL != "" {
		p.WebsiteURL = &r.WebsiteURL
	}
	if r.IsActive != nil {
		p.IsActive = *r.IsActive
	}
	if r.Priority != nil {
		p.Priority = *r.Priority
	}
	return p
}

func PartnerToResponse(m Partner) PartnerResponse {
	resp := PartnerResponse{
		ID:        m.ID,
		Name:      m.Name,
		Kind:      m.Kind,
		IsActive:  m.IsActive,
		Priority:  m.Priority,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if m.Subtitle != nil {
		resp.Subtitle = *m.Subtitle
	}
	if m.Description != nil {
		resp.Description = *m.Description
	}
	if m.LogoURL != nil {
		resp.LogoURL = *m.LogoURL
	}
	if m.WebsiteURL != nil {
		resp.WebsiteURL = *m.WebsiteURL
	}
	return resp
}
