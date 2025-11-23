package model

import "time"

// Roadmap DTOs

type CreateRoadmapRequest struct {
	Program     ProgramEnum `json:"program" validate:"omitempty,oneof=networking devsecops programming"`
	MonthNumber int         `json:"month_number" validate:"required,gte=1,lte=12"`
	Title       string      `json:"title" validate:"required,min=3"`
	Description string      `json:"description"`
	SortOrder   *int        `json:"sort_order"`
	IsActive    *bool       `json:"is_active"`
}

type UpdateRoadmapRequest struct {
	Program     *ProgramEnum `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	MonthNumber *int         `json:"month_number,omitempty" validate:"omitempty,gte=1,lte=12"`
	Title       *string      `json:"title,omitempty" validate:"omitempty,min=3"`
	Description *string      `json:"description,omitempty"`
	SortOrder   *int         `json:"sort_order,omitempty"`
	IsActive    *bool        `json:"is_active,omitempty"`
}

type RoadmapItemResponse struct {
	ID        string `json:"id"`
	RoadmapID string `json:"roadmap_id"`
	ItemText  string `json:"item_text"`
	SortOrder int    `json:"sort_order"`
}

type RoadmapResponse struct {
	ID          string                `json:"id"`
	Program     string                `json:"program,omitempty"`
	MonthNumber int                   `json:"month_number"`
	Title       string                `json:"title"`
	Description string                `json:"description,omitempty"`
	SortOrder   int                   `json:"sort_order"`
	IsActive    bool                  `json:"is_active"`
	Items       []RoadmapItemResponse `json:"items,omitempty"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
}

type RoadmapListResponse struct {
	Data       []RoadmapResponse `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

func (r CreateRoadmapRequest) ToModel() Roadmap {
	rm := Roadmap{
		MonthNumber: r.MonthNumber,
		Title:       r.Title,
		SortOrder:   0,
		IsActive:    true,
	}
	if r.Program != "" {
		rm.Program = &r.Program
	}
	if r.Description != "" {
		rm.Description = &r.Description
	}
	if r.SortOrder != nil {
		rm.SortOrder = *r.SortOrder
	}
	if r.IsActive != nil {
		rm.IsActive = *r.IsActive
	}
	return rm
}

func RoadmapItemToResponse(m RoadmapItem) RoadmapItemResponse {
	return RoadmapItemResponse{
		ID:        m.ID,
		RoadmapID: m.RoadmapID,
		ItemText:  m.ItemText,
		SortOrder: m.SortOrder,
	}
}

func RoadmapToResponse(m Roadmap) RoadmapResponse {
	resp := RoadmapResponse{
		ID:          m.ID,
		MonthNumber: m.MonthNumber,
		Title:       m.Title,
		SortOrder:   m.SortOrder,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
	if m.Program != nil {
		resp.Program = string(*m.Program)
	}
	if m.Description != nil {
		resp.Description = *m.Description
	}
	if len(m.Items) > 0 {
		resp.Items = make([]RoadmapItemResponse, 0, len(m.Items))
		for _, item := range m.Items {
			resp.Items = append(resp.Items, RoadmapItemToResponse(item))
		}
	}
	return resp
}
