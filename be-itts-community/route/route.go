package routes

import (
	"time"

	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/db"
	"be-itts-community/internal/handler/rest"
	"be-itts-community/internal/middleware"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
	"be-itts-community/pkg/auth"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/oauth"
	"be-itts-community/pkg/observability/nr"
)

type RouteDeps struct {
	DBConn              db.Connection
	VerifyEmailURL      string
	Mailer              service.Mailer
	Locker              lock.Locker
	Tracer              nr.Tracer
	JWTSecret           string
	JWTAccessDur        time.Duration
	JWTRefreshDur       time.Duration
	JWTIssuer           string
	GitHubClientID      string
	GitHubClientSecret  string
	GitHubRedirectURI   string
}

func RegisterRoutes(r chi.Router, deps RouteDeps) {
	if deps.Locker == nil {
		deps.Locker = lock.NewNoopLocker()
	}
	if deps.Tracer == nil {
		deps.Tracer = nr.NewNoopTracer()
	}

	// ===== JWT MANAGER =====
	jwtManager := auth.NewJWTManager(
		deps.JWTSecret,
		deps.JWTAccessDur,
		deps.JWTRefreshDur,
		deps.JWTIssuer,
	)

	// ===== RBAC REPOSITORIES =====
	authRepo := repository.NewAuthRepository(deps.DBConn)
	permissionRepo := repository.NewPermissionRepository(deps.DBConn)
	auditRepo := repository.NewAuditLogRepository(deps.DBConn)

	// ===== RBAC SERVICES =====
	authSvc := service.NewAuthService(authRepo, permissionRepo, auditRepo, jwtManager, deps.Tracer)
	permissionSvc := service.NewPermissionService(permissionRepo, auditRepo, deps.Tracer)

	// ===== RBAC HANDLERS =====
	authH := rest.NewAuthHandler(authSvc)
	userH := rest.NewUserHandler(authSvc)
	roleH := rest.NewRoleHandler(permissionSvc)
	permissionH := rest.NewPermissionHandler(permissionSvc)

	// ===== OAUTH =====
	githubClient := oauth.NewGitHubOAuthClient(deps.GitHubClientID, deps.GitHubClientSecret, deps.GitHubRedirectURI)
	oauthH := rest.NewOAuthHandler(authSvc, githubClient)

	// ===== AUTH / REGISTRATION =====
	regRepo := repository.NewRegistrationRepository(deps.DBConn)
	emailVerRepo := repository.NewEmailVerificationRepository(deps.DBConn)
	regSvc := service.NewRegistrationService(regRepo, emailVerRepo, deps.Mailer, deps.Locker, deps.Tracer)
	regH := rest.NewRegistrationHandler(regSvc, deps.VerifyEmailURL)

	// ===== ROADMAPS =====
	roadmapRepo := repository.NewRoadmapRepository(deps.DBConn)
	roadmapSvc := service.NewRoadmapService(roadmapRepo, deps.Locker, deps.Tracer)
	roadmapH := rest.NewRoadmapHandler(roadmapSvc)

	// ===== ROADMAP ITEMS =====
	itemRepo := repository.NewRoadmapItemRepository(deps.DBConn)
	itemSvc := service.NewRoadmapItemService(itemRepo, deps.Locker, deps.Tracer)
	itemH := rest.NewRoadmapItemHandler(itemSvc)

	// ===== MENTORS =====
	mentorRepo := repository.NewMentorRepository(deps.DBConn)
	mentorSvc := service.NewMentorService(mentorRepo, deps.Locker, deps.Tracer)
	mentorH := rest.NewMentorHandler(mentorSvc)

	// ===== PARTNERS =====
	partnerRepo := repository.NewPartnerRepository(deps.DBConn)
	partnerSvc := service.NewPartnerService(partnerRepo, deps.Locker, deps.Tracer)
	partnerH := rest.NewPartnerHandler(partnerSvc)

	// ===== EVENTS =====
	eventRepo := repository.NewEventRepository(deps.DBConn)
	eventSvc := service.NewEventService(eventRepo, deps.Locker, deps.Tracer)
	eventSpeakerRepo := repository.NewEventSpeakerRepository(deps.DBConn)
	eventSpeakerSvc := service.NewEventSpeakerService(eventSpeakerRepo, deps.Locker, deps.Tracer)
	eventRegRepo := repository.NewEventRegistrationRepository(deps.DBConn)
	eventRegSvc := service.NewEventRegistrationService(eventRepo, eventRegRepo, deps.Locker, deps.Tracer)
	eventH := rest.NewEventHandler(eventSvc, eventSpeakerSvc, eventRegSvc)

	// ========= ROUTES =========
	r.Route("/api/v1", func(api chi.Router) {
		// Apply JWT middleware globally
		api.Use(middleware.JWTMiddleware(jwtManager))

		// ===== PUBLIC AUTH ROUTES =====
		api.Route("/auth", func(auth chi.Router) {
			// Public endpoints
			auth.Post("/login", authH.Login)
			auth.Post("/refresh", authH.RefreshToken)
			auth.Post("/logout", authH.Logout)

			// OAuth endpoints
			auth.Get("/oauth/github", oauthH.HandleGitHubAuth)
			auth.Get("/oauth/github/callback", oauthH.HandleGitHubCallback)

			// Member registration (public)
			auth.Post("/register", regH.Register)
			auth.Get("/verify-email", regH.VerifyEmail)

			// Protected endpoints (require authentication)
			auth.Group(func(protected chi.Router) {
				protected.Use(middleware.RequireAuth())
				protected.Get("/me", authH.Me)
				protected.Patch("/me", authH.UpdateProfile)
				protected.Post("/change-password", authH.ChangePassword)
			})
		})

		// Public events
		api.Get("/events/slug/{slug}", eventH.GetEventBySlug)
		api.Post("/events/{event_id}/register", eventH.RegisterToEvent)

		// ===== ADMIN ROUTES (Protected) =====
		api.Route("/admin", func(admin chi.Router) {
			// Require authentication for all admin routes
			admin.Use(middleware.RequireAuth())

			// ===== USER MANAGEMENT =====
			admin.With(middleware.RequirePermission("users:create")).Post("/users", userH.CreateUser)
			admin.With(middleware.RequirePermission("users:list")).Get("/users", userH.ListUsers)
			admin.With(middleware.RequirePermission("users:read")).Get("/users/{id}", userH.GetUser)
			admin.With(middleware.RequirePermission("users:update")).Patch("/users/{id}", userH.UpdateUser)
			admin.With(middleware.RequirePermission("users:delete")).Delete("/users/{id}", userH.DeleteUser)
			admin.With(middleware.RequirePermission("users:manage")).Post("/users/{id}/reset-password", userH.ResetPassword)
			admin.With(middleware.RequirePermission("users:manage")).Post("/users/{id}/roles", userH.AssignRoles)

			// ===== ROLE MANAGEMENT =====
			admin.With(middleware.RequirePermission("roles:create")).Post("/roles", roleH.CreateRole)
			admin.With(middleware.RequirePermission("roles:list")).Get("/roles", roleH.ListRoles)
			admin.With(middleware.RequirePermission("roles:read")).Get("/roles/{id}", roleH.GetRole)
			admin.With(middleware.RequirePermission("roles:update")).Patch("/roles/{id}", roleH.UpdateRole)
			admin.With(middleware.RequirePermission("roles:delete")).Delete("/roles/{id}", roleH.DeleteRole)
			admin.With(middleware.RequirePermission("roles:manage")).Post("/roles/{id}/permissions", roleH.AssignPermissions)
			admin.With(middleware.RequirePermission("roles:read")).Get("/roles/{id}/permissions", roleH.GetRolePermissions)

			// ===== PERMISSION & RESOURCE QUERIES (Read-only) =====
			admin.With(middleware.RequirePermission("permissions:list")).Get("/permissions", permissionH.ListPermissions)
			admin.With(middleware.RequirePermission("permissions:read")).Get("/permissions/{id}", permissionH.GetPermission)
			admin.With(middleware.RequireAnyPermission("permissions:list", "roles:create", "roles:update")).Get("/resources", permissionH.ListResources)
			admin.With(middleware.RequireAnyPermission("permissions:list", "roles:create", "roles:update")).Get("/actions", permissionH.ListActions)

			// ===== MEMBER REGISTRATIONS =====
			admin.With(middleware.RequirePermission("registrations:list")).Get("/registrations", regH.AdminList)
			admin.With(middleware.RequirePermission("registrations:read")).Get("/registrations/{id}", regH.AdminGet)
			admin.With(middleware.RequirePermission("registrations:approve")).Patch("/registrations/{id}/approve", regH.AdminApprove)
			admin.With(middleware.RequirePermission("registrations:reject")).Patch("/registrations/{id}/reject", regH.AdminReject)
			admin.With(middleware.RequirePermission("registrations:delete")).Delete("/registrations/{id}", regH.AdminDelete)

			// ===== ROADMAPS =====
			admin.With(middleware.RequirePermission("roadmaps:create")).Post("/roadmaps", roadmapH.Create)
			admin.With(middleware.RequirePermission("roadmaps:list")).Get("/roadmaps", roadmapH.List)
			admin.With(middleware.RequirePermission("roadmaps:read")).Get("/roadmaps/{id}", roadmapH.Get)
			admin.With(middleware.RequirePermission("roadmaps:update")).Patch("/roadmaps/{id}", roadmapH.Update)
			admin.With(middleware.RequirePermission("roadmaps:delete")).Delete("/roadmaps/{id}", roadmapH.Delete)

			// ===== ROADMAP ITEMS =====
			admin.With(middleware.RequirePermission("roadmap_items:create")).Post("/roadmap-items", itemH.Create)
			admin.With(middleware.RequirePermission("roadmap_items:list")).Get("/roadmap-items", itemH.List)
			admin.With(middleware.RequirePermission("roadmap_items:read")).Get("/roadmap-items/{id}", itemH.Get)
			admin.With(middleware.RequirePermission("roadmap_items:update")).Patch("/roadmap-items/{id}", itemH.Update)
			admin.With(middleware.RequirePermission("roadmap_items:delete")).Delete("/roadmap-items/{id}", itemH.Delete)
			admin.With(middleware.RequirePermission("roadmap_items:create")).Post("/roadmaps/{roadmap_id}/items", itemH.CreateUnderRoadmap)

			// ===== MENTORS =====
			admin.With(middleware.RequirePermission("mentors:create")).Post("/mentors", mentorH.Create)
			admin.With(middleware.RequirePermission("mentors:list")).Get("/mentors", mentorH.List)
			admin.With(middleware.RequirePermission("mentors:read")).Get("/mentors/{id}", mentorH.Get)
			admin.With(middleware.RequirePermission("mentors:update")).Patch("/mentors/{id}", mentorH.Update)
			admin.With(middleware.RequirePermission("mentors:activate")).Patch("/mentors/{id}/active", mentorH.SetActive)
			admin.With(middleware.RequirePermission("mentors:update")).Patch("/mentors/{id}/priority", mentorH.SetPriority)
			admin.With(middleware.RequirePermission("mentors:delete")).Delete("/mentors/{id}", mentorH.Delete)

			// ===== PARTNERS =====
			admin.With(middleware.RequirePermission("partners:create")).Post("/partners", partnerH.Create)
			admin.With(middleware.RequirePermission("partners:list")).Get("/partners", partnerH.List)
			admin.With(middleware.RequirePermission("partners:read")).Get("/partners/{id}", partnerH.Get)
			admin.With(middleware.RequirePermission("partners:update")).Patch("/partners/{id}", partnerH.Update)
			admin.With(middleware.RequirePermission("partners:activate")).Patch("/partners/{id}/active", partnerH.SetActive)
			admin.With(middleware.RequirePermission("partners:update")).Patch("/partners/{id}/priority", partnerH.SetPriority)
			admin.With(middleware.RequirePermission("partners:delete")).Delete("/partners/{id}", partnerH.Delete)

			// ===== EVENTS =====
			admin.With(middleware.RequirePermission("events:create")).Post("/events", eventH.CreateEvent)
			admin.With(middleware.RequirePermission("events:list")).Get("/events", eventH.ListEvents)
			admin.With(middleware.RequirePermission("events:read")).Get("/events/{id}", eventH.GetEvent)
			admin.With(middleware.RequirePermission("events:update")).Patch("/events/{id}", eventH.UpdateEvent)
			admin.With(middleware.RequirePermission("events:delete")).Delete("/events/{id}", eventH.DeleteEvent)
			admin.With(middleware.RequirePermission("events:update")).Patch("/events/{id}/status", eventH.SetEventStatus)

			// ===== EVENT SPEAKERS =====
			admin.With(middleware.RequirePermission("event_speakers:list")).Get("/event-speakers", eventH.ListSpeakers)
			admin.With(middleware.RequirePermission("event_speakers:create")).Post("/events/{event_id}/speakers", eventH.AddSpeaker)
			admin.With(middleware.RequirePermission("event_speakers:update")).Patch("/event-speakers/{id}", eventH.UpdateSpeaker)
			admin.With(middleware.RequirePermission("event_speakers:delete")).Delete("/event-speakers/{id}", eventH.DeleteSpeaker)

			// ===== EVENT REGISTRATIONS =====
			admin.With(middleware.RequirePermission("event_registrations:list")).Get("/event-registrations", eventH.ListRegistrations)
			admin.With(middleware.RequirePermission("event_registrations:delete")).Delete("/event-registrations/{id}", eventH.Unregister)
		})
	})
}
