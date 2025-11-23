package model

import (
	"time"
)

// =====================================
// ENUM type bisa didefinisikan via string constants
// =====================================

type ProgramEnum string

const (
	ProgramNetworking  ProgramEnum = "networking"
	ProgramDevSecOps   ProgramEnum = "devsecops"
	ProgramProgramming ProgramEnum = "programming"
)

type RegistrationStatus string

const (
	RegPending  RegistrationStatus = "pending"
	RegApproved RegistrationStatus = "approved"
	RegRejected RegistrationStatus = "rejected"
)

type EventStatus string

const (
	EventDraft   EventStatus = "draft"
	EventOpen    EventStatus = "open"
	EventOngoing EventStatus = "ongoing"
	EventClosed  EventStatus = "closed"
)

type PartnerType string

const (
	PartnerLab      PartnerType = "lab"
	PartnerAcademic PartnerType = "partner_academic"
	PartnerIndustry PartnerType = "partner_industry"
)

// =====================================
// Registrations
// =====================================

type Registration struct {
	ID              string             `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FullName        string             `gorm:"not null"`
	Email           string             `gorm:"type:citext;not null;index"`
	Program         ProgramEnum        `gorm:"type:program_enum;not null;index"`
	StudentID       string             `gorm:"not null"`
	IntakeYear      int                `gorm:"not null;check:intake_year >= 2000 and intake_year <= 2100"`
	Motivation      string             `gorm:"not null"`
	Status          RegistrationStatus `gorm:"type:registration_status_enum;default:'pending';not null;index"`
	ApprovedBy      *string
	ApprovedAt      *time.Time
	RejectedReason  *string
	EmailVerifiedAt *time.Time // ← tambahan
	CreatedAt       time.Time  `gorm:"not null;default:now()"`
	UpdatedAt       time.Time  `gorm:"not null;default:now()"`
}

type EmailVerification struct {
	ID             string     `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RegistrationID string     `gorm:"type:uuid;not null;index"`
	TokenHash      string     `gorm:"type:char(64);not null;index"`
	ExpiresAt      time.Time  `gorm:"not null"`
	UsedAt         *time.Time `gorm:""`
	CreatedAt      time.Time  `gorm:"not null;default:now()"`
}

// =====================================
// Roadmap & Roadmap Items
// =====================================

type Roadmap struct {
	ID          string       `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Program     *ProgramEnum `gorm:"type:program_enum"` // nullable
	MonthNumber int          `gorm:"not null;check:month_number between 1 and 12"`
	Title       string       `gorm:"not null"`
	Description *string
	SortOrder   int  `gorm:"default:0"`
	IsActive    bool `gorm:"default:true"`
	CreatedAt   time.Time
	UpdatedAt   time.Time

	Items []RoadmapItem `gorm:"foreignKey:RoadmapID;constraint:OnDelete:CASCADE"`
}

type RoadmapItem struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	RoadmapID string `gorm:"type:uuid;not null;index"`
	ItemText  string `gorm:"not null"`
	SortOrder int    `gorm:"default:0"`
}

// =====================================
// Events & Speakers
// =====================================

type Event struct {
	ID          string  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Slug        *string `gorm:"uniqueIndex"`
	Title       string  `gorm:"not null"`
	Summary     *string
	Description *string
	ImageURL    *string
	Program     *ProgramEnum `gorm:"type:program_enum"`
	Status      EventStatus  `gorm:"type:event_status_enum;default:'draft';not null;index"`
	StartsAt    time.Time    `gorm:"not null;index"`
	EndsAt      *time.Time
	Venue       *string
	CreatedAt   time.Time
	UpdatedAt   time.Time

	Speakers []EventSpeaker `gorm:"foreignKey:EventID;constraint:OnDelete:CASCADE"`
}

type EventSpeaker struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	EventID   string `gorm:"type:uuid;not null;index"`
	Name      string `gorm:"not null"`
	Title     *string
	AvatarURL *string
	SortOrder int `gorm:"default:0"`
}

type EventRegistration struct {
	ID        string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	EventID   string    `gorm:"type:uuid;not null;index:idx_event_email,unique"`
	FullName  string    `gorm:"not null"`
	Email     string    `gorm:"type:citext;not null;index:idx_event_email,unique"`
	CreatedAt time.Time `gorm:"not null;default:now()"`
}

// =====================================
// Mentors
// =====================================

type Mentor struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FullName  string `gorm:"not null"`
	Title     *string
	Bio       *string
	AvatarURL *string
	Programs  []ProgramEnum `gorm:"type:program_enum[]"`
	IsActive  bool          `gorm:"default:true;index"`
	Priority  int           `gorm:"default:0;index"`
	CreatedAt time.Time
	UpdatedAt time.Time
}

// =====================================
// Partners / Labs
// =====================================

type Partner struct {
	ID          string      `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Name        string      `gorm:"not null"`
	Kind        PartnerType `gorm:"type:partner_type_enum;not null;index"`
	Subtitle    *string
	Description *string
	LogoURL     *string
	WebsiteURL  *string
	IsActive    bool `gorm:"default:true;index"`
	Priority    int  `gorm:"default:0;index"`
	CreatedAt   time.Time
	UpdatedAt   time.Time
}
