// internal/service/event.go
package service

import (
    "context"
    "fmt"
    "time"

    "gorm.io/gorm"

    "be-itts-community/internal/repository"
    "be-itts-community/internal/model"
    "be-itts-community/pkg/lock"
    "be-itts-community/pkg/observability/nr"
)

type EventService interface {
	// Events
	Create(ctx context.Context, in CreateEvent) (*model.Event, error)
	Get(ctx context.Context, id string) (*model.Event, error)
	GetBySlug(ctx context.Context, slug string) (*model.Event, error)
	Update(ctx context.Context, id string, in UpdateEvent) (*model.Event, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Event], error)
	SetStatus(ctx context.Context, id string, status model.EventStatus) (*model.Event, error)

	// Speakers
	AddSpeaker(ctx context.Context, in CreateSpeaker) (*model.EventSpeaker, error)
	UpdateSpeaker(ctx context.Context, id string, in UpdateSpeaker) (*model.EventSpeaker, error)
	DeleteSpeaker(ctx context.Context, id string) error
	ListSpeakers(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventSpeaker], error)

	// Registrations
	RegisterToEvent(ctx context.Context, in CreateEventRegistration) (*model.EventRegistration, error)
	Unregister(ctx context.Context, id string) error
	ListRegistrations(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventRegistration], error)
}

/* ======================
   DTOs
   ====================== */

type CreateEvent struct {
	Slug        *string            `json:"slug"`
	Title       string             `json:"title" validate:"required"`
	Summary     *string            `json:"summary"`
	Description *string            `json:"description"`
	ImageURL    *string            `json:"image_url"`
	Program     *model.ProgramEnum `json:"program"`
	Status      *model.EventStatus `json:"status"`
	StartsAt    time.Time          `json:"starts_at" validate:"required"`
	EndsAt      *time.Time         `json:"ends_at"`
	Venue       *string            `json:"venue"`
}

type UpdateEvent struct {
	Slug        *string            `json:"slug,omitempty"`
	Title       *string            `json:"title,omitempty"`
	Summary     *string            `json:"summary,omitempty"`
	Description *string            `json:"description,omitempty"`
	ImageURL    *string            `json:"image_url,omitempty"`
	Program     *model.ProgramEnum `json:"program,omitempty"`
	Status      *model.EventStatus `json:"status,omitempty"`
	StartsAt    *time.Time         `json:"starts_at,omitempty"`
	EndsAt      *time.Time         `json:"ends_at,omitempty"`
	Venue       *string            `json:"venue,omitempty"`
}

type CreateSpeaker struct {
	EventID   string  `json:"event_id" validate:"required"`
	Name      string  `json:"name" validate:"required"`
	Title     *string `json:"title"`
	AvatarURL *string `json:"avatar_url"`
	SortOrder *int    `json:"sort_order"`
}

type UpdateSpeaker struct {
	Name      *string `json:"name,omitempty"`
	Title     *string `json:"title,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type CreateEventRegistration struct {
	EventID  string `json:"event_id" validate:"required"`
	FullName string `json:"full_name" validate:"required"`
	Email    string `json:"email" validate:"required,email"`
}

/* ======================
   Service impl
   ====================== */

type eventService struct {
    db     *gorm.DB
    repo   repository.EventRepository
    locker lock.Locker
    tracer nr.Tracer
}

func NewEventService(db *gorm.DB, repo repository.EventRepository, locker lock.Locker, tracer nr.Tracer) EventService {
    return &eventService{db: db, repo: repo, locker: locker, tracer: tracer}
}

/* -------- Events -------- */

func (s *eventService) Create(ctx context.Context, in CreateEvent) (*model.Event, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.Create")() }
	// validasi sederhana waktu
	if in.EndsAt != nil && in.EndsAt.Before(in.StartsAt) {
		return nil, fmt.Errorf("ends_at must be after starts_at")
	}

	ev := &model.Event{
		Slug:        in.Slug,
		Title:       in.Title,
		Summary:     in.Summary,
		Description: in.Description,
		ImageURL:    in.ImageURL,
		Program:     in.Program,
		StartsAt:    in.StartsAt,
		EndsAt:      in.EndsAt,
		Venue:       in.Venue,
		Status:      model.EventDraft,
	}
    if in.Status != nil {
        ev.Status = *in.Status
    }
    if err := s.locker.WithLock(ctx, "lock:events:create", 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            if err := txRepo.CreateEvent(ctx, ev); err != nil {
                return err
            }
            return nil
        })
    }); err != nil {
        return nil, err
    }
    // kembalikan dengan child preloaded (repo GetEventByID sudah preload)
    return s.repo.GetEventByID(ctx, ev.ID)
}

func (s *eventService) Get(ctx context.Context, id string) (*model.Event, error) {
	return s.repo.GetEventByID(ctx, id) // preload Speakers di repo
}

func (s *eventService) GetBySlug(ctx context.Context, slug string) (*model.Event, error) {
	return s.repo.GetEventBySlug(ctx, slug) // preload Speakers di repo
}

func (s *eventService) Update(ctx context.Context, id string, in UpdateEvent) (*model.Event, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.Update")() }
    ev, err := s.repo.GetEventByID(ctx, id)
    if err != nil {
        return nil, err
    }

	if in.Slug != nil {
		ev.Slug = in.Slug
	}
	if in.Title != nil {
		ev.Title = *in.Title
	}
	if in.Summary != nil {
		ev.Summary = in.Summary
	}
	if in.Description != nil {
		ev.Description = in.Description
	}
	if in.ImageURL != nil {
		ev.ImageURL = in.ImageURL
	}
	if in.Program != nil {
		ev.Program = in.Program
	}
	if in.Status != nil {
		ev.Status = *in.Status
	}
	if in.StartsAt != nil {
		ev.StartsAt = *in.StartsAt
	}
	if in.EndsAt != nil {
		ev.EndsAt = in.EndsAt
	}
	if in.Venue != nil {
		ev.Venue = in.Venue
	}

	// validasi sederhana waktu
	if ev.EndsAt != nil && ev.EndsAt.Before(ev.StartsAt) {
		return nil, fmt.Errorf("ends_at must be after starts_at")
	}

    if err := s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.UpdateEvent(ctx, ev)
        })
    }); err != nil {
        return nil, err
    }
    return s.repo.GetEventByID(ctx, id)
}

func (s *eventService) Delete(ctx context.Context, id string) error {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.Delete")() }
    return s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.DeleteEvent(ctx, id)
        })
    })
}

func (s *eventService) List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Event], error) {
	return s.repo.ListEvents(ctx, p) // preload Speakers di repo
}

func (s *eventService) SetStatus(ctx context.Context, id string, status model.EventStatus) (*model.Event, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.SetStatus")() }
    ev, err := s.repo.GetEventByID(ctx, id)
    if err != nil {
        return nil, err
    }
    ev.Status = status
    if err := s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.UpdateEvent(ctx, ev)
        })
    }); err != nil {
        return nil, err
    }
    return s.repo.GetEventByID(ctx, id)
}

/* -------- Speakers -------- */

func (s *eventService) AddSpeaker(ctx context.Context, in CreateSpeaker) (*model.EventSpeaker, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.AddSpeaker")() }
    sp := &model.EventSpeaker{
        EventID:   in.EventID,
        Name:      in.Name,
        Title:     in.Title,
        AvatarURL: in.AvatarURL,
    }
    if in.SortOrder != nil {
        sp.SortOrder = *in.SortOrder
    }
    if err := s.locker.WithLock(ctx, "lock:event_speakers:"+in.EventID, 5*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.CreateSpeaker(ctx, sp)
        })
    }); err != nil {
        return nil, err
    }
    return sp, nil
}

func (s *eventService) UpdateSpeaker(ctx context.Context, id string, in UpdateSpeaker) (*model.EventSpeaker, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.UpdateSpeaker")() }
    // Ambil dulu speaker existing
    list, err := s.repo.ListSpeakers(ctx, &repository.ListParams{
        Filters: map[string]any{
            "id": id,
        },
        Page:     1,
        PageSize: 1,
    })

	if err != nil {
		return nil, err
	}
	if len(list.Data) == 0 {
		return nil, gorm.ErrRecordNotFound
	}
	sp := list.Data[0]

	if in.Name != nil {
		sp.Name = *in.Name
	}
	if in.Title != nil {
		sp.Title = in.Title
	}
	if in.AvatarURL != nil {
		sp.AvatarURL = in.AvatarURL
	}
	if in.SortOrder != nil {
		sp.SortOrder = *in.SortOrder
	}

    if err := s.locker.WithLock(ctx, "lock:event_speakers:"+id, 5*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.UpdateSpeaker(ctx, &sp)
        })
    }); err != nil {
        return nil, err
    }
    return &sp, nil
}

func (s *eventService) DeleteSpeaker(ctx context.Context, id string) error {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.DeleteSpeaker")() }
    return s.locker.WithLock(ctx, "lock:event_speakers:"+id, 5*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.DeleteSpeaker(ctx, id)
        })
    })
}

func (s *eventService) ListSpeakers(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventSpeaker], error) {
	return s.repo.ListSpeakers(ctx, p)
}

/* -------- Registrations -------- */

func (s *eventService) RegisterToEvent(ctx context.Context, in CreateEventRegistration) (*model.EventRegistration, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.RegisterToEvent")() }
    // Opsional: validasi event exist
    if _, err := s.repo.GetEventByID(ctx, in.EventID); err != nil {
        return nil, err
    }
    reg := &model.EventRegistration{
        EventID:  in.EventID,
        FullName: in.FullName,
        Email:    in.Email,
    }
    if err := s.locker.WithLock(ctx, "lock:event_reg:"+in.EventID+":"+in.Email, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.CreateRegistration(ctx, reg)
        })
    }); err != nil {
        return nil, err
    }
    return reg, nil
}

func (s *eventService) Unregister(ctx context.Context, id string) error {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "EventService.Unregister")() }
    return s.locker.WithLock(ctx, "lock:event_reg:"+id, 5*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            txRepo := repository.NewEventRepository(tx)
            return txRepo.DeleteRegistration(ctx, id)
        })
    })
}

func (s *eventService) ListRegistrations(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventRegistration], error) {
	return s.repo.ListRegistrations(ctx, p)
}
