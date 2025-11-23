package routes

import (
    "github.com/go-chi/chi/v5"
    "gorm.io/gorm"

    "be-itts-community/internal/handler/rest"
    "be-itts-community/internal/repository"
    "be-itts-community/internal/service"
    "be-itts-community/pkg/lock"
    "be-itts-community/pkg/observability/nr"
)

type RouteDeps struct {
    DB             *gorm.DB
    VerifyEmailURL string
    Mailer         service.Mailer
    Locker         lock.Locker
    Tracer         nr.Tracer
}

func RegisterRoutes(r chi.Router, deps RouteDeps) {
    if deps.Locker == nil {
        deps.Locker = lock.NewNoopLocker()
    }
    if deps.Tracer == nil {
        deps.Tracer = nr.NewNoopTracer()
    }
    // ===== AUTH / REGISTRATION =====
    regRepo := repository.NewRegistrationRepository(deps.DB)
    emailVerRepo := repository.NewEmailVerificationRepository(deps.DB)
    regSvc := service.NewRegistrationService(deps.DB, regRepo, emailVerRepo, deps.Mailer, deps.Locker, deps.Tracer)
    regH := rest.NewRegistrationHandler(regSvc, deps.VerifyEmailURL)

	// ===== ROADMAPS =====
	roadmapRepo := repository.NewRoadmapRepository(deps.DB)
    roadmapSvc := service.NewRoadmapService(deps.DB, roadmapRepo, deps.Locker, deps.Tracer)
	roadmapH := rest.NewRoadmapHandler(roadmapSvc)

	// ===== ROADMAP ITEMS =====
	itemRepo := repository.NewRoadmapItemRepository(deps.DB)
    itemSvc := service.NewRoadmapItemService(deps.DB, itemRepo, deps.Locker, deps.Tracer)
	itemH := rest.NewRoadmapItemHandler(itemSvc)

	// ===== MENTORS =====
	mentorRepo := repository.NewMentorRepository(deps.DB)
    mentorSvc := service.NewMentorService(deps.DB, mentorRepo, deps.Locker, deps.Tracer)
	mentorH := rest.NewMentorHandler(mentorSvc)

	// ===== PARTNERS =====
	partnerRepo := repository.NewPartnerRepository(deps.DB)
    partnerSvc := service.NewPartnerService(deps.DB, partnerRepo, deps.Locker, deps.Tracer)
	partnerH := rest.NewPartnerHandler(partnerSvc)

	// ===== EVENTS (repo unified: events + speakers + registrations) =====
	eventRepo := repository.NewEventRepository(deps.DB)
    eventSvc := service.NewEventService(deps.DB, eventRepo, deps.Locker, deps.Tracer)
	eventH := rest.NewEventHandler(eventSvc)

    // ========= ROUTES =========
    r.Route("/api/v1", func(api chi.Router) {

        // Auth (public)
        api.Route("/auth", func(auth chi.Router) {
            auth.Post("/register", regH.Register)
            auth.Get("/verify-email", regH.VerifyEmail)
        })

        // Public events
        api.Get("/events/slug/{slug}", eventH.GetEventBySlug)
        api.Post("/events/{event_id}/register", eventH.RegisterToEvent)

        // Admin group (TODO: add auth middleware)
        api.Route("/admin", func(admin chi.Router) {

            // Admin: registrations
            admin.Route("/registrations", func(regAdmin chi.Router) {
                regAdmin.Get("/", regH.AdminList)
                regAdmin.Get("/{id}", regH.AdminGet)
                regAdmin.Patch("/{id}/approve", regH.AdminApprove)
                regAdmin.Patch("/{id}/reject", regH.AdminReject)
                regAdmin.Delete("/{id}", regH.AdminDelete)
            })

            // Admin: roadmaps
            admin.Post("/roadmaps", roadmapH.Create)
            admin.Get("/roadmaps", roadmapH.List)
            admin.Get("/roadmaps/{id}", roadmapH.Get)
            admin.Patch("/roadmaps/{id}", roadmapH.Update)
            admin.Delete("/roadmaps/{id}", roadmapH.Delete)

            // Admin: roadmap items
            admin.Post("/roadmap-items", itemH.Create)
            admin.Get("/roadmap-items", itemH.List)
            admin.Get("/roadmap-items/{id}", itemH.Get)
            admin.Patch("/roadmap-items/{id}", itemH.Update)
            admin.Delete("/roadmap-items/{id}", itemH.Delete)
            admin.Post("/roadmaps/{roadmap_id}/items", itemH.CreateUnderRoadmap)

            // Admin: mentors
            admin.Post("/mentors", mentorH.Create)
            admin.Get("/mentors", mentorH.List)
            admin.Get("/mentors/{id}", mentorH.Get)
            admin.Patch("/mentors/{id}", mentorH.Update)
            admin.Patch("/mentors/{id}/active", mentorH.SetActive)
            admin.Patch("/mentors/{id}/priority", mentorH.SetPriority)
            admin.Delete("/mentors/{id}", mentorH.Delete)

            // Admin: partners
            admin.Post("/partners", partnerH.Create)
            admin.Get("/partners", partnerH.List)
            admin.Get("/partners/{id}", partnerH.Get)
            admin.Patch("/partners/{id}", partnerH.Update)
            admin.Patch("/partners/{id}/active", partnerH.SetActive)
            admin.Patch("/partners/{id}/priority", partnerH.SetPriority)
            admin.Delete("/partners/{id}", partnerH.Delete)

            // Admin: events
            admin.Post("/events", eventH.CreateEvent)
            admin.Get("/events", eventH.ListEvents)
            admin.Get("/events/{id}", eventH.GetEvent)
            admin.Patch("/events/{id}", eventH.UpdateEvent)
            admin.Delete("/events/{id}", eventH.DeleteEvent)
            admin.Patch("/events/{id}/status", eventH.SetEventStatus)

            // Admin: speakers
            admin.Get("/event-speakers", eventH.ListSpeakers)
            admin.Post("/events/{event_id}/speakers", eventH.AddSpeaker) // nested create
            admin.Patch("/event-speakers/{id}", eventH.UpdateSpeaker)
            admin.Delete("/event-speakers/{id}", eventH.DeleteSpeaker)

            // Admin: event registrations
            admin.Get("/event-registrations", eventH.ListRegistrations)
            admin.Delete("/event-registrations/{id}", eventH.Unregister)
        })
    })
}
