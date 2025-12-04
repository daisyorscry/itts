package model

import (
	"time"
)

// =====================================
// RBAC Models
// =====================================

// User represents an admin/staff user account (not member registration)
type User struct {
	ID           string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Email        string     `gorm:"type:citext;not null;uniqueIndex"`
	PasswordHash *string    `gorm:"column:password_hash"` // nullable for OAuth users
	FullName     string     `gorm:"column:full_name;not null"`
	IsActive     bool       `gorm:"column:is_active;default:true;index"`
	IsSuperAdmin bool       `gorm:"column:is_super_admin;default:false"`
	LastLoginAt  *time.Time `gorm:"column:last_login_at"`
	CreatedAt    time.Time  `gorm:"not null;default:now()"`
	UpdatedAt    time.Time  `gorm:"not null;default:now()"`

	// Relations
	Roles         []Role         `gorm:"many2many:user_roles"`
	RefreshTokens []RefreshToken `gorm:"foreignKey:UserID"`
	OAuthAccounts []OAuthAccount `gorm:"foreignKey:UserID"`
}

func (User) TableName() string {
	return "users"
}

// Role represents a user role with associated permissions
type Role struct {
	ID           string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name         string    `gorm:"size:100;not null;uniqueIndex"`
	Description  *string   `gorm:"type:text"`
	IsSystem     bool      `gorm:"column:is_system;default:false"` // system roles can't be deleted
	ParentRoleID *string   `gorm:"type:uuid;column:parent_role_id"`
	CreatedAt    time.Time `gorm:"not null;default:now()"`
	UpdatedAt    time.Time `gorm:"not null;default:now()"`

	// Relations
	ParentRole  *Role        `gorm:"foreignKey:ParentRoleID"`
	Permissions []Permission `gorm:"many2many:role_permissions"`
	Users       []User       `gorm:"many2many:user_roles"`
}

func (Role) TableName() string {
	return "roles"
}

// Resource represents a domain entity (e.g., "events", "roadmaps")
type Resource struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string    `gorm:"size:100;not null;uniqueIndex"`
	Description *string   `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"not null;default:now()"`
	UpdatedAt   time.Time `gorm:"not null;default:now()"`

	// Relations
	Permissions []Permission `gorm:"foreignKey:ResourceID"`
}

func (Resource) TableName() string {
	return "resources"
}

// Action represents an operation (e.g., "create", "read", "delete")
type Action struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string    `gorm:"size:100;not null;uniqueIndex"`
	Description *string   `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"not null;default:now()"`
	UpdatedAt   time.Time `gorm:"not null;default:now()"`

	// Relations
	Permissions []Permission `gorm:"foreignKey:ActionID"`
}

func (Action) TableName() string {
	return "actions"
}

// Permission represents a resource+action combination (e.g., "events:create")
type Permission struct {
	ID          string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ResourceID  string    `gorm:"type:uuid;not null;index:idx_resource_action,priority:1"`
	ActionID    string    `gorm:"type:uuid;not null;index:idx_resource_action,priority:2"`
	Name        string    `gorm:"size:255;not null;uniqueIndex"` // computed: "events:create"
	Description *string   `gorm:"type:text"`
	CreatedAt   time.Time `gorm:"not null;default:now()"`
	UpdatedAt   time.Time `gorm:"not null;default:now()"`

	// Relations
	Resource Resource `gorm:"foreignKey:ResourceID"`
	Action   Action   `gorm:"foreignKey:ActionID"`
	Roles    []Role   `gorm:"many2many:role_permissions"`
}

func (Permission) TableName() string {
	return "permissions"
}

// RolePermission junction table
type RolePermission struct {
	ID           string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RoleID       string    `gorm:"type:uuid;not null;uniqueIndex:idx_role_permission,priority:1"`
	PermissionID string    `gorm:"type:uuid;not null;uniqueIndex:idx_role_permission,priority:2"`
	CreatedAt    time.Time `gorm:"not null;default:now()"`
}

func (RolePermission) TableName() string {
	return "role_permissions"
}

// UserRole junction table with additional metadata
type UserRole struct {
	ID        string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    string     `gorm:"type:uuid;not null;uniqueIndex:idx_user_role,priority:1"`
	RoleID    string     `gorm:"type:uuid;not null;uniqueIndex:idx_user_role,priority:2"`
	GrantedBy *string    `gorm:"type:uuid"` // who assigned this role
	GrantedAt time.Time  `gorm:"not null;default:now()"`
	ExpiresAt *time.Time `gorm:"index"` // optional: temporary role assignment

	// Relations
	User    User  `gorm:"foreignKey:UserID"`
	Role    Role  `gorm:"foreignKey:RoleID"`
	Granter *User `gorm:"foreignKey:GrantedBy"`
}

func (UserRole) TableName() string {
	return "user_roles"
}

// RefreshToken for JWT token refresh
type RefreshToken struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID    string    `gorm:"type:uuid;not null;index"`
	TokenHash string    `gorm:"size:64;not null;uniqueIndex"`
	ExpiresAt time.Time `gorm:"not null;index"`
	RevokedAt *time.Time
	CreatedAt time.Time `gorm:"not null;default:now()"`

	// Relations
	User User `gorm:"foreignKey:UserID"`
}

func (RefreshToken) TableName() string {
	return "refresh_tokens"
}

// AuditLog tracks permission changes and sensitive operations
type AuditLog struct {
	ID           string                 `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID       *string                `gorm:"type:uuid;index"`
	Action       string                 `gorm:"size:100;not null;index"`
	ResourceType *string                `gorm:"size:100;index:idx_audit_resource,priority:1"`
	ResourceID   *string                `gorm:"type:uuid;index:idx_audit_resource,priority:2"`
	Metadata     map[string]interface{} `gorm:"type:jsonb"`
	IPAddress    *string                `gorm:"type:inet"`
	UserAgent    *string                `gorm:"type:text"`
	CreatedAt    time.Time              `gorm:"not null;default:now();index:,sort:desc"`

	// Relations
	User *User `gorm:"foreignKey:UserID"`
}

func (AuditLog) TableName() string {
	return "audit_logs"
}

// OAuthAccount represents OAuth provider account linkage
type OAuthAccount struct {
	ID           string                 `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID       string                 `gorm:"type:uuid;not null;index"`
	Provider     string                 `gorm:"size:50;not null;index:idx_oauth_provider_id,priority:1"`        // github, google
	ProviderID   string                 `gorm:"size:255;not null;uniqueIndex:idx_oauth_provider_id,priority:2"` // OAuth provider's user ID
	ProviderData map[string]interface{} `gorm:"type:jsonb"`                                                     // Store additional OAuth data
	CreatedAt    time.Time              `gorm:"not null;default:now()"`
	UpdatedAt    time.Time              `gorm:"not null;default:now()"`

	// Relations
	User User `gorm:"foreignKey:UserID"`
}

func (OAuthAccount) TableName() string {
	return "oauth_accounts"
}
