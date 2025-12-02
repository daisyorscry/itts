package repository

import (
	"context"

	"be-itts-community/internal/model"
)

// AuditLogRepository handles audit log data operations
type AuditLogRepository interface {
	// Create audit log entry
	CreateAuditLog(ctx context.Context, log *model.AuditLog) error

	// Query audit logs
	GetAuditLogByID(ctx context.Context, id string) (*model.AuditLog, error)
	ListAuditLogs(ctx context.Context, params ListParams) (*PageResult[model.AuditLog], error)

	// Cleanup old logs
	DeleteAuditLogsBefore(ctx context.Context, before string) error
}
