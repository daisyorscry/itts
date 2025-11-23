package service

import (
	"context"
	"fmt"
	"time"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

// ========================================
// Request DTOs
// ========================================

type CreateEventRequest struct {
	Slug        string            `json:"slug"`
	Title       string            `json:"title" validate:"required,min=3"`
	Summary     string            `json:"summary"`
	Description string            `json:"description"`
	ImageURL    string            `json:"image_url"`
	Program     model.ProgramEnum `json:"program" validate:"omitempty,oneof=networking devsecops programming"`
	Status      model.EventStatus `json:"status" validate:"omitempty,oneof=draft open ongoing closed"`
	StartsAt    time.Time         `json:"starts_at" validate:"required"`
	EndsAt      *time.Time        `json:"ends_at"`
	Venue       string            `json:"venue"`
}

type UpdateEventRequest struct {
	Slug        *string            `json:"slug,omitempty"`
	Title       *string            `json:"title,omitempty" validate:"omitempty,min=3"`
	Summary     *string            `json:"summary,omitempty"`
	Description *string            `json:"description,omitempty"`
	ImageURL    *string            `json:"image_url,omitempty"`
	Program     *model.ProgramEnum `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	Status      *model.EventStatus `json:"status,omitempty" validate:"omitempty,oneof=draft open ongoing closed"`
	StartsAt    *time.Time         `json:"starts_at,omitempty"`
	EndsAt      *time.Time         `json:"ends_at,omitempty"`
	Venue       *string            `json:"venue,omitempty"`
}

type SetEventStatusRequest struct {
	ID     string            `json:"id" validate:"required"`
	Status model.EventStatus `json:"status" validate:"required,oneof=draft open ongoing closed"`
}

type CreateSpeakerRequest struct {
	EventID   string `json:"event_id" validate:"required,uuid4"`
	Name      string `json:"name" validate:"required,min=2"`
	Title     string `json:"title"`
	AvatarURL string `json:"avatar_url"`
	SortOrder *int   `json:"sort_order"`
}

type UpdateSpeakerRequest struct {
	Name      *string `json:"name,omitempty" validate:"omitempty,min=2"`
	Title     *string `json:"title,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type CreateEventRegistrationRequest struct {
	EventID  string `json:"event_id" validate:"required,uuid4"`
	FullName string `json:"full_name" validate:"required,min=3"`
	Email    string `json:"email" validate:"required,email"`
}

// ========================================
// Response DTOs
// ========================================

type EventResponse struct {
	ID          string            `json:"id"`
	Slug        string            `json:"slug,omitempty"`
	Title       string            `json:"title"`
	Summary     string            `json:"summary,omitempty"`
	Description string            `json:"description,omitempty"`
	ImageURL    string            `json:"image_url,omitempty"`
	Program     string            `json:"program,omitempty"`
	Status      model.EventStatus `json:"status"`
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

// ========================================
// Mappers
// ========================================

func (r CreateEventRequest) ToModel() model.Event {
	ev := model.Event{
		Title:    r.Title,
		StartsAt: r.StartsAt,
		EndsAt:   r.EndsAt,
		Status:   model.EventDraft,
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

func (r CreateSpeakerRequest) ToModel() model.EventSpeaker {
	sp := model.EventSpeaker{
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

func (r CreateEventRegistrationRequest) ToModel() model.EventRegistration {
	return model.EventRegistration{
		EventID:  r.EventID,
		FullName: r.FullName,
		Email:    r.Email,
	}
}

func EventToResponse(m model.Event) EventResponse {
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

func SpeakerToResponse(m model.EventSpeaker) SpeakerResponse {
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

func EventRegistrationToResponse(m model.EventRegistration) EventRegistrationResponse {
	return EventRegistrationResponse{
		ID:        m.ID,
		EventID:   m.EventID,
		FullName:  m.FullName,
		Email:     m.Email,
		CreatedAt: m.CreatedAt,
	}
}

func EventListToResponse(pr repository.PageResult[model.Event]) EventListResponse {
	data := make([]EventResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, EventToResponse(m))
	}
	return EventListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}

func SpeakerListToResponse(pr repository.PageResult[model.EventSpeaker]) SpeakerListResponse {
	data := make([]SpeakerResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, SpeakerToResponse(m))
	}
	return SpeakerListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}

func EventRegistrationListToResponse(pr repository.PageResult[model.EventRegistration]) EventRegistrationListResponse {
	data := make([]EventRegistrationResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, EventRegistrationToResponse(m))
	}
	return EventRegistrationListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}

// ========================================
// Service Interface
// ========================================

type EventService interface {
	// Events
	Create(ctx context.Context, req CreateEventRequest) (EventResponse, error)
	Get(ctx context.Context, id string) (EventResponse, error)
	GetBySlug(ctx context.Context, slug string) (EventResponse, error)
	Update(ctx context.Context, id string, req UpdateEventRequest) (EventResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (EventListResponse, error)
	SetStatus(ctx context.Context, req SetEventStatusRequest) (EventResponse, error)

	// Speakers
	AddSpeaker(ctx context.Context, req CreateSpeakerRequest) (SpeakerResponse, error)
	UpdateSpeaker(ctx context.Context, id string, req UpdateSpeakerRequest) (SpeakerResponse, error)
	DeleteSpeaker(ctx context.Context, id string) error
	ListSpeakers(ctx context.Context, p repository.ListParams) (SpeakerListResponse, error)

	// Registrations
	RegisterToEvent(ctx context.Context, req CreateEventRegistrationRequest) (EventRegistrationResponse, error)
	Unregister(ctx context.Context, id string) error
	ListRegistrations(ctx context.Context, p repository.ListParams) (EventRegistrationListResponse, error)
}

// ========================================
// Service Implementation
// ========================================

type eventService struct {
	db     *gorm.DB
	repo   repository.EventRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewEventService(db *gorm.DB, repo repository.EventRepository, locker lock.Locker, tracer nr.Tracer) EventService {
	return &eventService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *eventService) Create(ctx context.Context, req CreateEventRequest) (EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Create")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventResponse{}, err
	}

	// Business validation
	if req.EndsAt != nil && req.EndsAt.Before(req.StartsAt) {
		return EventResponse{}, fmt.Errorf("ends_at must be after starts_at")
	}

	ev := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:events:create", 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.CreateEvent(ctx, &ev)
		})
	}); err != nil {
		return EventResponse{}, err
	}

	result, err := s.repo.GetEventByID(ctx, ev.ID)
	if err != nil {
		return EventResponse{}, err
	}
	return EventToResponse(*result), nil
}

func (s *eventService) Get(ctx context.Context, id string) (EventResponse, error) {
	m, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		return EventResponse{}, err
	}
	return EventToResponse(*m), nil
}

func (s *eventService) GetBySlug(ctx context.Context, slug string) (EventResponse, error) {
	m, err := s.repo.GetEventBySlug(ctx, slug)
	if err != nil {
		return EventResponse{}, err
	}
	return EventToResponse(*m), nil
}

func (s *eventService) Update(ctx context.Context, id string, req UpdateEventRequest) (EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Update")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventResponse{}, err
	}

	ev, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		return EventResponse{}, err
	}

	if req.Slug != nil {
		ev.Slug = req.Slug
	}
	if req.Title != nil {
		ev.Title = *req.Title
	}
	if req.Summary != nil {
		ev.Summary = req.Summary
	}
	if req.Description != nil {
		ev.Description = req.Description
	}
	if req.ImageURL != nil {
		ev.ImageURL = req.ImageURL
	}
	if req.Program != nil {
		ev.Program = req.Program
	}
	if req.Status != nil {
		ev.Status = *req.Status
	}
	if req.StartsAt != nil {
		ev.StartsAt = *req.StartsAt
	}
	if req.EndsAt != nil {
		ev.EndsAt = req.EndsAt
	}
	if req.Venue != nil {
		ev.Venue = req.Venue
	}

	// Business validation
	if ev.EndsAt != nil && ev.EndsAt.Before(ev.StartsAt) {
		return EventResponse{}, fmt.Errorf("ends_at must be after starts_at")
	}

	if err := s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.UpdateEvent(ctx, ev)
		})
	}); err != nil {
		return EventResponse{}, err
	}

	result, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		return EventResponse{}, err
	}
	return EventToResponse(*result), nil
}

func (s *eventService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.DeleteEvent(ctx, id)
		})
	})
}

func (s *eventService) List(ctx context.Context, p repository.ListParams) (EventListResponse, error) {
	result, err := s.repo.ListEvents(ctx, p)
	if err != nil {
		return EventListResponse{}, err
	}
	return EventListToResponse(*result), nil
}

func (s *eventService) SetStatus(ctx context.Context, req SetEventStatusRequest) (EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.SetStatus")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventResponse{}, err
	}

	ev, err := s.repo.GetEventByID(ctx, req.ID)
	if err != nil {
		return EventResponse{}, err
	}

	ev.Status = req.Status

	if err := s.locker.WithLock(ctx, "lock:events:"+req.ID, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.UpdateEvent(ctx, ev)
		})
	}); err != nil {
		return EventResponse{}, err
	}

	result, err := s.repo.GetEventByID(ctx, req.ID)
	if err != nil {
		return EventResponse{}, err
	}
	return EventToResponse(*result), nil
}

// ========================================
// Speakers
// ========================================

func (s *eventService) AddSpeaker(ctx context.Context, req CreateSpeakerRequest) (SpeakerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.AddSpeaker")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return SpeakerResponse{}, err
	}

	sp := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:event_speakers:"+req.EventID, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.CreateSpeaker(ctx, &sp)
		})
	}); err != nil {
		return SpeakerResponse{}, err
	}

	return SpeakerToResponse(sp), nil
}

func (s *eventService) UpdateSpeaker(ctx context.Context, id string, req UpdateSpeakerRequest) (SpeakerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.UpdateSpeaker")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return SpeakerResponse{}, err
	}

	list, err := s.repo.ListSpeakers(ctx, &repository.ListParams{
		Filters:  map[string]any{"id": id},
		Page:     1,
		PageSize: 1,
	})
	if err != nil {
		return SpeakerResponse{}, err
	}
	if len(list.Data) == 0 {
		return SpeakerResponse{}, gorm.ErrRecordNotFound
	}
	sp := list.Data[0]

	if req.Name != nil {
		sp.Name = *req.Name
	}
	if req.Title != nil {
		sp.Title = req.Title
	}
	if req.AvatarURL != nil {
		sp.AvatarURL = req.AvatarURL
	}
	if req.SortOrder != nil {
		sp.SortOrder = *req.SortOrder
	}

	if err := s.locker.WithLock(ctx, "lock:event_speakers:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.UpdateSpeaker(ctx, &sp)
		})
	}); err != nil {
		return SpeakerResponse{}, err
	}

	return SpeakerToResponse(sp), nil
}

func (s *eventService) DeleteSpeaker(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.DeleteSpeaker")()
	}
	return s.locker.WithLock(ctx, "lock:event_speakers:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.DeleteSpeaker(ctx, id)
		})
	})
}

func (s *eventService) ListSpeakers(ctx context.Context, p repository.ListParams) (SpeakerListResponse, error) {
	result, err := s.repo.ListSpeakers(ctx, &p)
	if err != nil {
		return SpeakerListResponse{}, err
	}
	return SpeakerListToResponse(*result), nil
}

// ========================================
// Registrations
// ========================================

func (s *eventService) RegisterToEvent(ctx context.Context, req CreateEventRegistrationRequest) (EventRegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.RegisterToEvent")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventRegistrationResponse{}, err
	}

	// Check event exists
	if _, err := s.repo.GetEventByID(ctx, req.EventID); err != nil {
		return EventRegistrationResponse{}, err
	}

	reg := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:event_reg:"+req.EventID+":"+req.Email, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.CreateRegistration(ctx, &reg)
		})
	}); err != nil {
		return EventRegistrationResponse{}, err
	}

	return EventRegistrationToResponse(reg), nil
}

func (s *eventService) Unregister(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Unregister")()
	}
	return s.locker.WithLock(ctx, "lock:event_reg:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewEventRepository(tx)
			return txRepo.DeleteRegistration(ctx, id)
		})
	})
}

func (s *eventService) ListRegistrations(ctx context.Context, p repository.ListParams) (EventRegistrationListResponse, error) {
	result, err := s.repo.ListRegistrations(ctx, &p)
	if err != nil {
		return EventRegistrationListResponse{}, err
	}
	return EventRegistrationListToResponse(*result), nil
}
