# RBAC/IAM System Design Document

## 🎯 Overview

Sistem RBAC (Role-Based Access Control) yang lengkap dan dinamis untuk ITTS Community Backend. Design ini terinspirasi dari AWS IAM dengan kemampuan permission management yang sangat fleksibel.

## 📊 Database Schema

### Core Tables

#### 1. `users` - Admin/Staff Accounts
```sql
- id (UUID, PK)
- email (CITEXT, unique)
- password_hash (VARCHAR)
- full_name (VARCHAR)
- is_active (BOOLEAN)
- is_super_admin (BOOLEAN)
- last_login_at (TIMESTAMP)
- created_at, updated_at
```

#### 2. `roles` - User Roles
```sql
- id (UUID, PK)
- name (VARCHAR, unique) - e.g., "admin", "moderator"
- description (TEXT)
- is_system (BOOLEAN) - system roles can't be deleted
- parent_role_id (UUID, FK) - role hierarchy support
- created_at, updated_at
```

#### 3. `resources` - Domain Resources
```sql
- id (UUID, PK)
- name (VARCHAR, unique) - e.g., "events", "roadmaps"
- description (TEXT)
- created_at, updated_at
```

#### 4. `actions` - Operations
```sql
- id (UUID, PK)
- name (VARCHAR, unique) - e.g., "create", "read", "delete"
- description (TEXT)
- created_at, updated_at
```

#### 5. `permissions` - Resource+Action Combinations
```sql
- id (UUID, PK)
- resource_id (UUID, FK)
- action_id (UUID, FK)
- name (VARCHAR, unique) - computed: "events:create"
- description (TEXT)
- created_at, updated_at
- UNIQUE(resource_id, action_id)
```

#### 6. `role_permissions` - Junction Table
```sql
- id (UUID, PK)
- role_id (UUID, FK)
- permission_id (UUID, FK)
- created_at
- UNIQUE(role_id, permission_id)
```

#### 7. `user_roles` - User Role Assignments
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- role_id (UUID, FK)
- granted_by (UUID, FK) - who assigned this role
- granted_at (TIMESTAMP)
- expires_at (TIMESTAMP, nullable) - temporary assignments
- UNIQUE(user_id, role_id)
```

#### 8. `refresh_tokens` - JWT Refresh Tokens
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- token_hash (VARCHAR(64), unique)
- expires_at (TIMESTAMP)
- revoked_at (TIMESTAMP, nullable)
- created_at
```

#### 9. `audit_logs` - Audit Trail
```sql
- id (UUID, PK)
- user_id (UUID, FK, nullable)
- action (VARCHAR) - e.g., "user.login", "role.assign"
- resource_type (VARCHAR) - e.g., "users", "events"
- resource_id (UUID, nullable)
- metadata (JSONB) - flexible data
- ip_address (INET)
- user_agent (TEXT)
- created_at
```

## 🔑 Default Roles & Permissions

### Roles

1. **super_admin**
   - Full access to everything
   - Cannot be deleted (system role)
   - Bypass all permission checks

2. **admin**
   - Full CRUD on: events, roadmaps, mentors, partners, registrations
   - Cannot manage: users, roles, permissions

3. **moderator**
   - Read all resources
   - Manage: registrations (approve/reject), event registrations (delete)

4. **event_manager**
   - Full access to: events, speakers, event registrations
   - Read access to everything else

5. **content_manager**
   - Full access to: roadmaps, roadmap items, mentors, partners
   - Read access to everything else

6. **viewer**
   - Read-only access to all resources

### Resources (11 total)

- registrations
- events
- event_speakers
- event_registrations
- roadmaps
- roadmap_items
- mentors
- partners
- users
- roles
- permissions

### Actions (9 total)

- create
- read
- update
- delete
- list
- approve
- reject
- activate
- manage

### Permission Format

`<resource>:<action>`

Examples:
- `events:create`
- `registrations:approve`
- `users:manage`

## 🏗️ Architecture

### Layer Structure

```
Handler (REST)
    ↓
Service (Business Logic)
    ↓
Repository (Data Access)
```

### Dependency Injection Flow

```go
// In route.go
authRepo := repository.NewAuthRepository(deps.DBConn)
permissionRepo := repository.NewPermissionRepository(deps.DBConn)
auditRepo := repository.NewAuditLogRepository(deps.DBConn)

jwtManager := auth.NewJWTManager(secretKey, accessDuration, refreshDuration, "itts-api")

authSvc := service.NewAuthService(authRepo, permissionRepo, auditRepo, jwtManager, deps.Tracer)
authH := rest.NewAuthHandler(authSvc)
```

### Authentication Flow

```
1. User → POST /api/v1/auth/login { email, password }
2. Handler validates input
3. Service verifies credentials
4. Service loads user roles & permissions
5. Service generates JWT (access + refresh tokens)
6. Response: { access_token, refresh_token, user }
7. Client stores tokens (httpOnly cookie or localStorage)
8. Future requests: Authorization: Bearer <access_token>
9. Middleware validates JWT → extracts claims → sets auth context
10. Handler checks permissions via service or middleware
```

### Authorization Flow

```
1. Middleware extracts JWT from Authorization header
2. Middleware verifies token signature & expiration
3. Middleware extracts user claims (id, roles, permissions)
4. Middleware creates AuthContext and stores in request context
5. Handler retrieves AuthContext
6. Handler/Service checks: authCtx.HasPermission("events:create")
7. If yes → proceed, if no → return 403 Forbidden
```

## 📂 File Structure

```
internal/
├── auth/
│   ├── handler/rest/
│   │   ├── auth_handler.go           # Login, logout, refresh, me
│   │   ├── user_handler.go           # User CRUD
│   │   ├── role_handler.go           # Role CRUD
│   │   └── permission_handler.go     # Permission list/get
│   ├── repository/
│   │   ├── auth_repo.go              # User operations
│   │   ├── auth_repo_interface.go
│   │   ├── permission_repo.go        # Permission/role queries
│   │   ├── permission_repo_interface.go
│   │   ├── audit_repo.go             # Audit logging
│   │   └── audit_repo_interface.go
│   ├── service/
│   │   ├── auth_service.go           # Authentication logic
│   │   ├── auth_service_interface.go
│   │   ├── permission_service.go     # Authorization logic
│   │   └── permission_service_interface.go
│   └── middleware/
│       ├── auth.go                   # JWT validation middleware
│       └── permission.go             # Permission check middleware
├── model/
│   ├── auth_model.go                 # User, Role, Permission models (DONE)
│   └── auth_dto.go                   # Request/Response DTOs (DONE)

pkg/
├── auth/
│   ├── jwt.go                        # JWT manager (DONE)
│   └── crypto.go                     # Password hashing (DONE)

migrations/
├── 00010_create_rbac_tables.sql      # RBAC schema (DONE)
└── 00011_seed_rbac_data.sql          # Default data (DONE)
```

## 🔐 API Endpoints

### Public Routes

```
POST   /api/v1/auth/login            # Login
POST   /api/v1/auth/refresh          # Refresh access token
POST   /api/v1/auth/logout           # Logout (revoke refresh token)
```

### Protected Routes (Authenticated)

```
GET    /api/v1/auth/me              # Get current user info
POST   /api/v1/auth/change-password # Change own password
```

### Admin Routes (Require Permissions)

#### User Management
```
POST   /api/v1/admin/users          # users:create
GET    /api/v1/admin/users          # users:list
GET    /api/v1/admin/users/:id      # users:read
PATCH  /api/v1/admin/users/:id      # users:update
DELETE /api/v1/admin/users/:id      # users:delete
POST   /api/v1/admin/users/:id/reset-password # users:manage
POST   /api/v1/admin/users/:id/roles # users:manage (assign roles)
```

#### Role Management
```
POST   /api/v1/admin/roles          # roles:create
GET    /api/v1/admin/roles          # roles:list
GET    /api/v1/admin/roles/:id      # roles:read
PATCH  /api/v1/admin/roles/:id      # roles:update
DELETE /api/v1/admin/roles/:id      # roles:delete
POST   /api/v1/admin/roles/:id/permissions # roles:manage
```

#### Permission Management (Read-only, seeded from migrations)
```
GET    /api/v1/admin/permissions    # permissions:list
GET    /api/v1/admin/permissions/:id # permissions:read
GET    /api/v1/admin/resources      # List available resources
GET    /api/v1/admin/actions        # List available actions
```

#### Audit Logs
```
GET    /api/v1/admin/audit-logs     # audit_logs:list
GET    /api/v1/admin/audit-logs/:id # audit_logs:read
```

## 🛡️ Middleware Integration

### Current Middleware Stack

```go
// Existing (from cmd/server.go)
1. core.ContextMiddleware()
2. core.RecoveryMiddleware(log)
3. core.LoggingMiddleware(log)
4. nr.Middleware(tracer)
5. cors.Handler()
```

### New Auth Middleware

```go
// Add after CORS, before routes
6. authmw.JWTMiddleware(jwtManager, authService) // extracts & validates JWT
```

### Permission Middleware (Decorator Pattern)

```go
// In route registration
admin.With(authmw.RequirePermission("events:create")).Post("/events", eventH.CreateEvent)
admin.With(authmw.RequirePermission("registrations:approve")).Patch("/registrations/{id}/approve", regH.AdminApprove)
```

OR

```go
// Group-based
admin.Group(func(protected chi.Router) {
    protected.Use(authmw.RequireAuthentication())

    // Events - require specific permissions
    protected.With(authmw.RequirePermission("events:create")).Post("/events", eventH.CreateEvent)
    protected.With(authmw.RequirePermission("events:list")).Get("/events", eventH.ListEvents)
    // ... more routes
})
```

## 🔄 Token Flow

### Access Token (JWT)
- **Duration**: 15 minutes (configurable)
- **Storage**: Authorization header (`Bearer <token>`)
- **Contains**: user_id, email, is_super_admin, roles[], permissions[]
- **Signing**: HMAC SHA256

### Refresh Token
- **Duration**: 7 days (configurable)
- **Storage**: httpOnly cookie or client storage
- **Format**: Random 32-byte hex string
- **Database**: Hashed with SHA256, stored in `refresh_tokens` table
- **Revocation**: Can be revoked (set `revoked_at`)

### Token Refresh Flow
```
1. Client detects expired access token (401 response)
2. Client → POST /api/v1/auth/refresh { refresh_token }
3. Service validates refresh token (not revoked, not expired)
4. Service loads user permissions (may have changed since last login)
5. Service generates new access token + new refresh token
6. Service revokes old refresh token (optional, depends on strategy)
7. Response: { access_token, refresh_token }
```

## 📝 Usage Examples

### Check Permission in Handler

```go
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    // Get auth context from middleware
    authCtx, err := authmw.GetAuthContext(ctx)
    if err != nil {
        core.WriteAppError(w, r, core.Unauthorized("Authentication required"))
        return
    }

    // Check permission
    if !authCtx.HasPermission("events:create") {
        core.WriteAppError(w, r, core.Forbidden("Insufficient permissions"))
        return
    }

    // Proceed with logic...
}
```

### Check Permission in Service

```go
func (s *eventService) CreateEvent(ctx context.Context, req CreateEventRequest) (*Event, error) {
    authCtx, err := authmw.GetAuthContext(ctx)
    if err != nil {
        return nil, core.Unauthorized("Authentication required")
    }

    if !authCtx.HasPermission("events:create") {
        return nil, core.Forbidden("Insufficient permissions")
    }

    // Business logic...
}
```

### Use Middleware Decorator

```go
// In route.go
admin.With(authmw.RequirePermission("events:create")).Post("/events", eventH.CreateEvent)

// Handler becomes simpler - permission already checked
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
    // No need to check permission, middleware already did it
    // Proceed with logic...
}
```

## 🎨 Audit Logging

Every sensitive operation should be audited:

```go
// In service layer
s.auditRepo.Log(ctx, audit.AuditLogInput{
    UserID:       authCtx.UserID,
    Action:       "event.create",
    ResourceType: "events",
    ResourceID:   &event.ID,
    Metadata: map[string]interface{}{
        "event_title": event.Title,
        "event_slug":  event.Slug,
    },
    IPAddress: core.GetIPFromContext(ctx),
    UserAgent: core.GetUserAgentFromContext(ctx),
})
```

### Auditable Actions

- user.login
- user.logout
- user.create
- user.update
- user.delete
- user.password_change
- role.assign
- role.revoke
- permission.grant
- permission.revoke
- <resource>.<action> for sensitive operations

## 🚀 Implementation Checklist

### Phase 1: Foundation ✅ (DONE)
- [x] Database migrations (tables + seed data)
- [x] Auth models (User, Role, Permission, etc)
- [x] Auth DTOs (request/response)
- [x] JWT package (token generation/validation)
- [x] Crypto package (password hashing)

### Phase 2: Data Layer (NEXT)
- [ ] Auth repository (user CRUD + authentication)
- [ ] Permission repository (role/permission queries)
- [ ] Audit log repository
- [ ] Repository interfaces
- [ ] Unit tests for repositories

### Phase 3: Business Logic
- [ ] Auth service (login, logout, refresh, register user)
- [ ] Permission service (check permissions, assign roles)
- [ ] Service interfaces
- [ ] Unit tests for services

### Phase 4: API Layer
- [ ] Auth middleware (JWT validation)
- [ ] Permission middleware (decorator)
- [ ] Auth handler (login, refresh, me)
- [ ] User management handler
- [ ] Role management handler
- [ ] Permission/resource handler
- [ ] Audit log handler

### Phase 5: Integration
- [ ] Update route.go with auth routes
- [ ] Protect existing admin routes with permissions
- [ ] Update config for JWT settings
- [ ] Add JWT secret to .env
- [ ] Integration tests

### Phase 6: Documentation
- [ ] API documentation (Postman/Swagger)
- [ ] Setup guide for first admin user
- [ ] Permission matrix table
- [ ] Deployment guide

## 🔧 Configuration

Add to `config/config.go`:

```go
type Config struct {
    // ... existing fields

    // JWT Configuration
    JWTSecret            string        `mapstructure:"JWT_SECRET"`
    JWTAccessDuration    time.Duration `mapstructure:"JWT_ACCESS_DURATION"`   // 15m
    JWTRefreshDuration   time.Duration `mapstructure:"JWT_REFRESH_DURATION"`  // 7d
    JWTIssuer            string        `mapstructure:"JWT_ISSUER"`            // "itts-api"
}
```

Add to `.env.example`:

```bash
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_ACCESS_DURATION=15m
JWT_REFRESH_DURATION=168h
JWT_ISSUER=itts-api
```

## 📈 Scalability Considerations

1. **Permission Caching**: Cache user permissions in Redis (TTL: 5 minutes)
2. **Token Blacklist**: Use Redis for revoked token tracking
3. **Audit Log Archival**: Archive old logs to separate table/S3
4. **Role Hierarchy**: Leverage parent_role_id for inheritance
5. **Lazy Loading**: Only load permissions when needed, not on every request

## 🧪 Testing Strategy

1. **Unit Tests**
   - Repository layer: CRUD operations
   - Service layer: Business logic
   - JWT manager: Token generation/validation
   - Password crypto: Hash/verify

2. **Integration Tests**
   - Full auth flow (login → access resource → refresh → logout)
   - Permission checks
   - Role assignments
   - Token expiration/revocation

3. **E2E Tests**
   - User registration → role assignment → resource access
   - Admin creates user → assigns role → user logs in → performs action

## 🔐 Security Best Practices

1. **Password Policy**
   - Minimum 8 characters
   - Bcrypt with cost 10
   - No password reuse (optional: track password history)

2. **Token Security**
   - Short-lived access tokens (15 min)
   - HttpOnly cookies for refresh tokens (if web)
   - Rotate refresh tokens on use
   - Revoke tokens on password change/logout

3. **Rate Limiting**
   - Login attempts: 5 per 15 minutes per IP
   - Token refresh: 10 per hour per user

4. **Audit Everything**
   - All authentication attempts (success/failure)
   - All permission changes
   - All sensitive resource access

5. **Super Admin Protection**
   - Cannot delete super admin accounts
   - Require additional verification for super admin actions

## 📊 Permission Matrix

| Role | Registrations | Events | Roadmaps | Mentors | Partners | Users | Roles |
|------|--------------|--------|----------|---------|----------|-------|-------|
| super_admin | ALL | ALL | ALL | ALL | ALL | ALL | ALL |
| admin | ALL | ALL | ALL | ALL | ALL | ❌ | ❌ |
| moderator | approve, reject, read | read | read | read | read | ❌ | ❌ |
| event_manager | read | ALL | read | read | read | ❌ | ❌ |
| content_manager | read | read | ALL | ALL | ALL | ❌ | ❌ |
| viewer | read | read | read | read | read | ❌ | ❌ |

## 🎯 Next Steps

Gua udah design lengkap RBAC system-nya. Sekarang tinggal implement:

1. **Repositories** - Data access layer untuk user, role, permission
2. **Services** - Business logic untuk auth & authorization
3. **Middleware** - JWT validation & permission checks
4. **Handlers** - REST API endpoints
5. **Route Integration** - Protect existing routes

Mau gua lanjut implement semua file-nya atau ada yang mau lu review/ubah dari design ini?
