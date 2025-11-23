package routes

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"be-itts-community/internal/handler/rest"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type RouteDeps struct {
	DB             *gorm.DB
	VerifyEmailURL string
	Mailer         service.Mailer
}

func RegisterRoutes(app *fiber.App, deps RouteDeps) {
	// ===== AUTH / REGISTRATION =====
	regRepo := repository.NewRegistrationRepository(deps.DB)
	emailVerRepo := repository.NewEmailVerificationRepository(deps.DB)
	regSvc := service.NewRegistrationService(deps.DB, regRepo, emailVerRepo, deps.Mailer)
	regH := rest.NewRegistrationHandler(regSvc, deps.VerifyEmailURL)

	// ===== ROADMAPS =====
	roadmapRepo := repository.NewRoadmapRepository(deps.DB)
	roadmapSvc := service.NewRoadmapService(deps.DB, roadmapRepo)
	roadmapH := rest.NewRoadmapHandler(roadmapSvc)

	// ===== ROADMAP ITEMS =====
	itemRepo := repository.NewRoadmapItemRepository(deps.DB)
	itemSvc := service.NewRoadmapItemService(deps.DB, itemRepo)
	itemH := rest.NewRoadmapItemHandler(itemSvc)

	// ===== MENTORS =====
	mentorRepo := repository.NewMentorRepository(deps.DB)
	mentorSvc := service.NewMentorService(deps.DB, mentorRepo)
	mentorH := rest.NewMentorHandler(mentorSvc)

	// ===== PARTNERS =====
	partnerRepo := repository.NewPartnerRepository(deps.DB)
	partnerSvc := service.NewPartnerService(deps.DB, partnerRepo)
	partnerH := rest.NewPartnerHandler(partnerSvc)

	// ===== EVENTS (repo unified: events + speakers + registrations) =====
	eventRepo := repository.NewEventRepository(deps.DB)
	eventSvc := service.NewEventService(deps.DB, eventRepo)
	eventH := rest.NewEventHandler(eventSvc)

	// ========= ROUTES =========
	api := app.Group("/api/v1")

	// Public health endpoints (opsional)
	api.Get("/", func(c *fiber.Ctx) error { return c.SendString("ok") })

	// Auth (public)
	auth := api.Group("/auth")
	auth.Post("/register", regH.Register)
	auth.Get("/verify-email", regH.VerifyEmail)

	// Public events
	api.Get("/events/slug/:slug", eventH.GetEventBySlug)
	api.Post("/events/:event_id/register", eventH.RegisterToEvent)

	// Admin group (pasang middleware auth-admin di sini kalau sudah siap)
	admin := api.Group("/admin")

	// Admin: registrations
	regAdmin := admin.Group("/registrations")
	regAdmin.Get("/", regH.AdminList)
	regAdmin.Get("/:id", regH.AdminGet)
	regAdmin.Patch("/:id/approve", regH.AdminApprove)
	regAdmin.Patch("/:id/reject", regH.AdminReject)
	regAdmin.Delete("/:id", regH.AdminDelete)

	// Admin: roadmaps
	admin.Post("/roadmaps", roadmapH.Create)
	admin.Get("/roadmaps", roadmapH.List)
	admin.Get("/roadmaps/:id", roadmapH.Get)
	admin.Patch("/roadmaps/:id", roadmapH.Update)
	admin.Delete("/roadmaps/:id", roadmapH.Delete)

	// Admin: roadmap items
	admin.Post("/roadmap-items", itemH.Create)
	admin.Get("/roadmap-items", itemH.List)
	admin.Get("/roadmap-items/:id", itemH.Get)
	admin.Patch("/roadmap-items/:id", itemH.Update)
	admin.Delete("/roadmap-items/:id", itemH.Delete)
	admin.Post("/roadmaps/:roadmap_id/items", itemH.CreateUnderRoadmap)

	// Admin: mentors
	admin.Post("/mentors", mentorH.Create)
	admin.Get("/mentors", mentorH.List)
	admin.Get("/mentors/:id", mentorH.Get)
	admin.Patch("/mentors/:id", mentorH.Update)
	admin.Patch("/mentors/:id/active", mentorH.SetActive)
	admin.Patch("/mentors/:id/priority", mentorH.SetPriority)
	admin.Delete("/mentors/:id", mentorH.Delete)

	// Admin: partners
	admin.Post("/partners", partnerH.Create)
	admin.Get("/partners", partnerH.List)
	admin.Get("/partners/:id", partnerH.Get)
	admin.Patch("/partners/:id", partnerH.Update)
	admin.Patch("/partners/:id/active", partnerH.SetActive)
	admin.Patch("/partners/:id/priority", partnerH.SetPriority)
	admin.Delete("/partners/:id", partnerH.Delete)

	// Admin: events
	admin.Post("/events", eventH.CreateEvent)
	admin.Get("/events", eventH.ListEvents)
	admin.Get("/events/:id", eventH.GetEvent)
	admin.Patch("/events/:id", eventH.UpdateEvent)
	admin.Delete("/events/:id", eventH.DeleteEvent)
	admin.Patch("/events/:id/status", eventH.SetEventStatus)

	// Admin: speakers
	admin.Get("/event-speakers", eventH.ListSpeakers)
	admin.Post("/events/:event_id/speakers", eventH.AddSpeaker) // nested create
	admin.Patch("/event-speakers/:id", eventH.UpdateSpeaker)
	admin.Delete("/event-speakers/:id", eventH.DeleteSpeaker)

	// Admin: event registrations
	admin.Get("/event-registrations", eventH.ListRegistrations)
	admin.Delete("/event-registrations/:id", eventH.Unregister)
}
