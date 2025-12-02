package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type auditLogRepository struct {
	db db.Connection
}

// NewAuditLogRepository creates a new audit log repository
func NewAuditLogRepository(conn db.Connection) AuditLogRepository {
	return &auditLogRepository{db: conn}
}

// CreateAuditLog creates a new audit log entry
func (r *auditLogRepository) CreateAuditLog(ctx context.Context, log *model.AuditLog) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "audit_logs", "INSERT")()
	}
	return r.db.Get(ctx).Create(log).Error
}

// GetAuditLogByID retrieves audit log by ID
func (r *auditLogRepository) GetAuditLogByID(ctx context.Context, id string) (*model.AuditLog, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "audit_logs", "SELECT")()
	}
	var log model.AuditLog
	err := r.db.Get(ctx).
		Preload("User").
		Where("id = ?", id).
		First(&log).Error
	if err != nil {
		return nil, err
	}
	return &log, nil
}

// ListAuditLogs lists audit logs with pagination
func (r *auditLogRepository) ListAuditLogs(ctx context.Context, params ListParams) (*PageResult[model.AuditLog], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "audit_logs", "SELECT")()
	}

	query := r.db.Get(ctx).Model(&model.AuditLog{}).Preload("User")

	// Search
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("action ILIKE ?", searchPattern)
	}

	// Filters
	if userID, ok := params.Filters["user_id"].(string); ok {
		query = query.Where("user_id = ?", userID)
	}
	if action, ok := params.Filters["action"].(string); ok {
		query = query.Where("action = ?", action)
	}
	if resourceType, ok := params.Filters["resource_type"].(string); ok {
		query = query.Where("resource_type = ?", resourceType)
	}
	if resourceID, ok := params.Filters["resource_id"].(string); ok {
		query = query.Where("resource_id = ?", resourceID)
	}

	var logs []model.AuditLog
	return Paginate(ctx, query, &params, &logs)
}

// DeleteAuditLogsBefore deletes audit logs before a certain date
func (r *auditLogRepository) DeleteAuditLogsBefore(ctx context.Context, before string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "audit_logs", "DELETE")()
	}
	return r.db.Get(ctx).
		Where("created_at < ?", before).
		Delete(&model.AuditLog{}).Error
}
