package model

import (
	"database/sql/driver"
	"fmt"
	"strings"
	"time"
)

// =====================================
// ENUM type bisa didefinisikan via string constants
// =====================================

type ProgramEnum string

type ProgramEnumArray []ProgramEnum
type StringArray []string

func (a ProgramEnumArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "{}", nil
	}

	values := make([]string, 0, len(a))
	for _, item := range a {
		values = append(values, string(item))
	}

	return "{" + strings.Join(values, ",") + "}", nil
}

func (a *ProgramEnumArray) Scan(value any) error {
	if value == nil {
		*a = nil
		return nil
	}

	var raw string
	switch v := value.(type) {
	case string:
		raw = v
	case []byte:
		raw = string(v)
	default:
		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type *model.ProgramEnumArray", value)
	}

	raw = strings.TrimSpace(raw)
	if raw == "" || raw == "{}" {
		*a = ProgramEnumArray{}
		return nil
	}

	raw = strings.TrimPrefix(raw, "{")
	raw = strings.TrimSuffix(raw, "}")
	if raw == "" {
		*a = ProgramEnumArray{}
		return nil
	}

	parts := strings.Split(raw, ",")
	out := make(ProgramEnumArray, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(strings.Trim(part, `"`))
		if part == "" {
			continue
		}
		out = append(out, ProgramEnum(part))
	}

	*a = out
	return nil
}

func (a StringArray) Value() (driver.Value, error) {
	if len(a) == 0 {
		return "{}", nil
	}

	values := make([]string, 0, len(a))
	for _, item := range a {
		clean := strings.TrimSpace(item)
		clean = strings.ReplaceAll(clean, `"`, `\"`)
		values = append(values, `"`+clean+`"`)
	}

	return "{" + strings.Join(values, ",") + "}", nil
}

func (a *StringArray) Scan(value any) error {
	if value == nil {
		*a = nil
		return nil
	}

	var raw string
	switch v := value.(type) {
	case string:
		raw = v
	case []byte:
		raw = string(v)
	default:
		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type *model.StringArray", value)
	}

	raw = strings.TrimSpace(raw)
	if raw == "" || raw == "{}" {
		*a = StringArray{}
		return nil
	}

	raw = strings.TrimPrefix(raw, "{")
	raw = strings.TrimSuffix(raw, "}")
	if raw == "" {
		*a = StringArray{}
		return nil
	}

	parts := strings.Split(raw, ",")
	out := make(StringArray, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(strings.Trim(part, `"`))
		if part == "" {
			continue
		}
		out = append(out, part)
	}

	*a = out
	return nil
}

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

type EventRegistrationStatus string

const (
	EventRegistrationPendingVerification EventRegistrationStatus = "pending_verification"
	EventRegistrationPendingPayment      EventRegistrationStatus = "pending_payment"
	EventRegistrationApproved            EventRegistrationStatus = "approved"
	EventRegistrationWaitlisted          EventRegistrationStatus = "waitlisted"
	EventRegistrationRejected            EventRegistrationStatus = "rejected"
	EventRegistrationCancelled           EventRegistrationStatus = "cancelled"
	EventRegistrationExpired             EventRegistrationStatus = "expired"
)

type EventPaymentStatus string

const (
	EventPaymentNotRequired EventPaymentStatus = "not_required"
	EventPaymentPending     EventPaymentStatus = "pending"
	EventPaymentPaid        EventPaymentStatus = "paid"
	EventPaymentFailed      EventPaymentStatus = "failed"
	EventPaymentExpired     EventPaymentStatus = "expired"
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
	ID                   string  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Slug                 *string `gorm:"uniqueIndex"`
	Title                string  `gorm:"not null"`
	Summary              *string
	Description          *string
	ImageURL             *string
	SquareImageURL       *string
	LandscapeImageURL    *string
	Benefits             StringArray  `gorm:"type:text[]"`
	Program              *ProgramEnum `gorm:"type:program_enum"`
	Status               EventStatus  `gorm:"type:event_status_enum;default:'draft';not null;index"`
	Capacity             int          `gorm:"default:0"`
	RegistrationDeadline *time.Time
	IsPaid               bool   `gorm:"default:false;not null"`
	Price                int64  `gorm:"default:0;not null"`
	Currency             string `gorm:"size:10;default:'IDR';not null"`
	Venue                *string
	StartsAt             time.Time `gorm:"not null;index"`
	EndsAt               *time.Time
	CreatedAt            time.Time
	UpdatedAt            time.Time

	Speakers      []EventSpeaker      `gorm:"foreignKey:EventID;constraint:OnDelete:CASCADE"`
	Registrations []EventRegistration `gorm:"foreignKey:EventID;constraint:OnDelete:CASCADE"`
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
	ID                    string                  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	EventID               string                  `gorm:"type:uuid;not null;index:idx_event_email,unique"`
	FullName              string                  `gorm:"not null"`
	Email                 string                  `gorm:"type:citext;not null;index:idx_event_email,unique"`
	PhoneNumber           *string                 `gorm:"size:20"`
	Institution           *string                 `gorm:"size:150"`
	Status                EventRegistrationStatus `gorm:"size:40;not null;default:'pending_verification';index"`
	RejectedReason        *string                 `gorm:"type:text"`
	EmailVerifiedAt       *time.Time
	VerificationTokenHash *string `gorm:"size:64;index"`
	VerificationExpiresAt *time.Time
	PaymentStatus         EventPaymentStatus `gorm:"size:20;not null;default:'not_required';index"`
	PaymentProvider       *string            `gorm:"size:50"`
	PaymentReference      *string            `gorm:"size:100"`
	PaymentURL            *string            `gorm:"type:text"`
	PaymentExpiresAt      *time.Time
	ApprovedAt            *time.Time
	WaitlistedAt          *time.Time
	RejectedAt            *time.Time
	CancelledAt           *time.Time
	CreatedAt             time.Time `gorm:"not null;default:now()"`
	UpdatedAt             time.Time `gorm:"not null;default:now()"`

	Event Event `gorm:"foreignKey:EventID;references:ID"`
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
	Programs  ProgramEnumArray `gorm:"type:program_enum[]"`
	IsActive  bool             `gorm:"default:true;index"`
	Priority  int              `gorm:"default:0;index"`
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
