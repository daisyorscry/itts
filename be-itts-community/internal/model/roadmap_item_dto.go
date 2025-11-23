package model

// Roadmap Item DTOs

type CreateRoadmapItemRequest struct {
	RoadmapID string `json:"roadmap_id" validate:"required,uuid4"`
	ItemText  string `json:"item_text" validate:"required,min=1"`
	SortOrder *int   `json:"sort_order"`
}

type UpdateRoadmapItemRequest struct {
	RoadmapID *string `json:"roadmap_id,omitempty" validate:"omitempty,uuid4"`
	ItemText  *string `json:"item_text,omitempty" validate:"omitempty,min=1"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type RoadmapItemDetailResponse struct {
	ID        string `json:"id"`
	RoadmapID string `json:"roadmap_id"`
	ItemText  string `json:"item_text"`
	SortOrder int    `json:"sort_order"`
}

type RoadmapItemListResponse struct {
	Data       []RoadmapItemDetailResponse `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

func (r CreateRoadmapItemRequest) ToModel() RoadmapItem {
	it := RoadmapItem{
		RoadmapID: r.RoadmapID,
		ItemText:  r.ItemText,
		SortOrder: 0,
	}
	if r.SortOrder != nil {
		it.SortOrder = *r.SortOrder
	}
	return it
}

func RoadmapItemDetailToResponse(m RoadmapItem) RoadmapItemDetailResponse {
	return RoadmapItemDetailResponse{
		ID:        m.ID,
		RoadmapID: m.RoadmapID,
		ItemText:  m.ItemText,
		SortOrder: m.SortOrder,
	}
}
