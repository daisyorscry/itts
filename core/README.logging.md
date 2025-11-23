# Core Logging Documentation

Dokumentasi lengkap untuk penggunaan core logging package yang terintegrasi dengan Loki, Promtail, Grafana, dan Prometheus Alertmanager.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
  - [Basic Logging](#basic-logging)
  - [Context-Aware Logging](#context-aware-logging)
  - [Structured Logging](#structured-logging)
  - [Error Logging](#error-logging)
  - [Critical Errors & Alerting](#critical-errors--alerting)
  - [Specialized Log Methods](#specialized-log-methods)
- [HTTP Middleware](#http-middleware)
- [Integration](#integration)
  - [Loki & Promtail](#loki--promtail)
  - [Grafana](#grafana)
  - [Prometheus Alerting](#prometheus-alerting)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

Core logging package adalah wrapper di atas `zerolog` yang menyediakan:
- **Structured logging** dengan JSON output
- **Context-aware logging** untuk request tracking
- **HTTP middleware** untuk automatic request logging
- **Specialized methods** untuk berbagai event types
- **Critical error flagging** untuk alerting
- **Compatible** dengan Loki, Promtail, Grafana, Prometheus

---

## Features

**Structured JSON logging** - Format standar untuk log aggregation
**Context injection** - Auto-track requestId, userId, orgId, traceId
**HTTP middleware** - Auto-log semua HTTP requests
**Panic recovery** - Auto-recover & log panic sebagai critical error
**Specialized loggers** - Database, HTTP, MQ, Audit, Service State
**Critical error flagging** - Tag errors untuk Prometheus alerting
**Development mode** - Pretty console output untuk development
**Production ready** - JSON output untuk Loki/Promtail

---

## Installation

Package ini sudah include di `core` module. Pastikan dependencies sudah terinstall:

```bash
go get github.com/rs/zerolog
go get github.com/google/uuid
```

---

## Quick Start

### 1. Initialize Logger

```go
package main

import (
    "os"
    "github.com/your-org/core"
)

func main() {
    // Create logger
    logger := core.NewLogger(core.LogConfig{
        Level:       core.LevelInfo,
        ServiceName: "control-plane-api",
        Environment: os.Getenv("ENVIRONMENT"),
        Pretty:      os.Getenv("ENVIRONMENT") == "development",
    })

    logger.Info("Service started")
}
```

### 2. Setup HTTP Server dengan Middleware

```go
package main

import (
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/your-org/core"
)

func main() {
    logger := core.NewLogger(core.LogConfig{
        Level:       core.LevelInfo,
        ServiceName: "control-plane-api",
        Environment: "production",
        Pretty:      false,
    })

    r := chi.NewRouter()

    // Setup middleware (order matters!)
    r.Use(core.RecoveryMiddleware(logger))  // 1. Recover from panic
    r.Use(core.LoggingMiddleware(logger))   // 2. Log all requests
    r.Use(core.ContextMiddleware())         // 3. Extract context

    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("OK"))
    })

    http.ListenAndServe(":8080", r)
}
```

---

## Configuration

### LogConfig

```go
type LogConfig struct {
    Level       LogLevel  // Log level: debug, info, warn, error, fatal
    ServiceName string    // Service name (e.g., "control-plane-api")
    Environment string    // Environment: production, staging, development
    Pretty      bool      // true = console output, false = JSON output
    Output      io.Writer // Optional: custom output writer
}
```

### Log Levels

```go
core.LevelDebug  // Detailed debug information
core.LevelInfo   // General information
core.LevelWarn   // Warning messages
core.LevelError  // Error messages
core.LevelFatal  // Fatal errors (exits program)
```

### Environment-Based Configuration

```go
func newLogger() *core.Logger {
    env := os.Getenv("ENVIRONMENT")
    level := core.LevelInfo

    if env == "development" {
        level = core.LevelDebug
    }

    return core.NewLogger(core.LogConfig{
        Level:       level,
        ServiceName: "my-service",
        Environment: env,
        Pretty:      env == "development",
    })
}
```

---

## Usage

### Basic Logging

```go
logger := core.NewLogger(cfg)

// Log levels
logger.Debug("Debugging information")
logger.Info("Application started")
logger.Warn("Warning message")
logger.Error("Error occurred")
logger.Fatal("Fatal error") // Exits program

// Formatted logging
logger.Infof("User %s logged in", userID)
logger.Errorf("Failed to connect to database: %v", err)
```

### Context-Aware Logging

Context-aware logging automatically includes requestId, userId, orgId, traceId dalam log output.

#### Di Handler (HTTP)

```go
func (h *Handler) GetProject(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context() // Context sudah di-inject oleh middleware

    // Logger akan auto-include request_id, user_id, org_id, trace_id
    h.logger.WithContext(ctx).Info("Fetching project")

    projectID := chi.URLParam(r, "id")
    project, err := h.service.GetProject(ctx, projectID)

    if err != nil {
        h.logger.WithContext(ctx).
            WithField("project_id", projectID).
            WithError(err).
            Error("Failed to get project")
        core.RespondError(w, r, err)
        return
    }

    h.logger.WithContext(ctx).
        WithField("project_id", projectID).
        Info("Project fetched successfully")

    core.OK(w, r, project)
}
```

#### Di Service Layer

```go
func (s *Service) CreateProject(ctx context.Context, req *request.CreateProject) error {
    s.logger.WithContext(ctx).
        WithField("project_name", req.Name).
        Info("Creating project")

    // Business logic...
    project, err := s.repo.Insert(ctx, projectDAO)
    if err != nil {
        s.logger.WithContext(ctx).
            WithError(err).
            Error("Failed to insert project")
        return core.InternalServerError("Failed to create project").WithError(err)
    }

    s.logger.WithContext(ctx).
        WithField("project_id", project.ID).
        Info("Project created successfully")

    return nil
}
```

#### Manual Context Injection

```go
// Add context values manually
ctx := context.Background()
ctx = core.WithRequestID(ctx, "req_123")
ctx = core.WithUserID(ctx, "usr_456")
ctx = core.WithOrgID(ctx, "org_789")
ctx = core.WithTraceID(ctx, "trace_abc")

logger.WithContext(ctx).Info("Processing request")
// Output includes: request_id, user_id, org_id, trace_id
```

### Structured Logging

```go
// Single field
logger.WithField("user_id", "usr_123").Info("User logged in")

// Multiple fields
logger.WithFields(map[string]interface{}{
    "user_id":   "usr_123",
    "action":    "login",
    "ip_address": "192.168.1.1",
    "timestamp": time.Now(),
}).Info("User authentication successful")

// Chainable
logger.
    WithField("project_id", "prj_123").
    WithField("environment", "production").
    WithField("region", "us-east-1").
    Info("Deployment started")
```

### Error Logging

```go
// Simple error
err := errors.New("connection timeout")
logger.WithError(err).Error("Database connection failed")

// Error dengan context
logger.WithContext(ctx).
    WithError(err).
    WithField("retry_count", 3).
    Error("Failed after retries")

// Error dari AppError
if err := someOperation(); err != nil {
    if appErr, ok := core.IsAppError(err); ok {
        logger.WithError(err).
            WithField("error_code", appErr.Code).
            WithField("http_status", appErr.HTTPStatus).
            Error("Operation failed")
    } else {
        logger.WithError(err).Error("Unexpected error")
    }
}
```

### Critical Errors & Alerting

Critical errors akan di-flag dengan `critical: true` dan `severity: critical` untuk trigger alerting di Prometheus.

```go
// Critical error - akan trigger alert
err := connectToDatabase()
if err != nil {
    logger.Critical("Database connection failed", err)
    // Prometheus akan detect log ini dan trigger alert
}

// Critical error dengan format
logger.Criticalf(err, "Failed to connect to %s after %d retries", dbHost, maxRetries)

// Critical error dengan context
logger.WithContext(ctx).
    WithField("database", "postgres").
    WithField("host", dbHost).
    Critical("Critical database error", err)
```

**Output JSON:**
```json
{
  "level": "error",
  "critical": true,
  "severity": "critical",
  "error": "connection refused",
  "message": "Database connection failed",
  "service": "control-plane-api",
  "timestamp": "2025-10-22T10:35:45Z"
}
```

### Specialized Log Methods

#### LogServiceState - Track service state changes

```go
logger.LogServiceState("running", "start", map[string]interface{}{
    "pid": os.Getpid(),
    "port": 8080,
    "version": "1.0.0",
})

logger.LogServiceState("stopping", "shutdown", map[string]interface{}{
    "uptime": uptime,
    "reason": "SIGTERM received",
})
```

#### LogDatabaseQuery - Log database queries (debug)

```go
start := time.Now()
err := db.Exec("INSERT INTO projects (name, org_id) VALUES (?, ?)", name, orgID)
duration := time.Since(start)

logger.LogDatabaseQuery("INSERT INTO projects", duration, err)
```

#### LogHTTPRequest - Log HTTP requests

```go
// Biasanya dipanggil otomatis oleh middleware, tapi bisa manual:
logger.LogHTTPRequest(
    "POST",
    "/api/projects",
    201,
    150*time.Millisecond,
    map[string]interface{}{
        "remote_addr": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "bytes_out": 1024,
    },
)
```

#### LogMQEvent - Log message queue events

```go
// Publish event
logger.LogMQEvent("publish", "build.completed", true, map[string]interface{}{
    "build_id": "bld_123",
    "duration": 300,
    "status": "success",
})

// Subscribe/consume event
logger.LogMQEvent("consume", "deploy.requested", true, map[string]interface{}{
    "deploy_id": "dep_456",
    "service_id": "svc_789",
})
```

#### LogAudit - Audit logging (security/compliance)

```go
logger.LogAudit(
    "usr_123",           // actor (who)
    "delete",            // action (what)
    "project",           // resource (where)
    map[string]interface{}{
        "project_id": "prj_456",
        "project_name": "my-api",
        "reason": "User requested deletion",
    },
)
```

---

## HTTP Middleware

### LoggingMiddleware

Auto-log semua HTTP requests dengan detail lengkap.

```go
r.Use(core.LoggingMiddleware(logger))
```

**Output:**
```json
{
  "level": "info",
  "event_type": "http_request",
  "request_id": "req_abc123",
  "method": "POST",
  "path": "/api/projects",
  "status_code": 201,
  "duration_ms": 145,
  "remote_addr": "192.168.1.1",
  "user_agent": "PostmanRuntime/7.29.0",
  "content_type": "application/json",
  "bytes_out": 512,
  "timestamp": "2025-10-22T10:35:45Z",
  "message": "HTTP request processed"
}
```

### RecoveryMiddleware

Auto-recover dari panic dan log sebagai critical error.

```go
r.Use(core.RecoveryMiddleware(logger))
```

Jika panic terjadi:
```json
{
  "level": "error",
  "critical": true,
  "severity": "critical",
  "panic": "runtime error: index out of range",
  "method": "GET",
  "path": "/api/projects/123",
  "message": "Panic recovered in HTTP handler",
  "timestamp": "2025-10-22T10:35:45Z"
}
```

### ContextMiddleware

Extract context values dari HTTP headers.

```go
r.Use(core.ContextMiddleware())
```

**Supported headers:**
- `X-User-Id` → `user_id` in context
- `X-Org-Id` → `org_id` in context
- `X-Trace-Id` → `trace_id` in context
- `X-Request-Id` → `request_id` in context (auto-generated if not present)

---

## Integration

### Loki & Promtail

#### 1. Setup Promtail Config

```yaml
# promtail-config.yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: control-plane-api
    static_configs:
      - targets:
          - localhost
        labels:
          job: control-plane-api
          __path__: /var/log/control-plane-api/*.log
    pipeline_stages:
      - json:
          expressions:
            level: level
            service: service
            environment: environment
            request_id: request_id
            user_id: user_id
            event_type: event_type
      - labels:
          level:
          service:
          environment:
          event_type:
```

#### 2. Output Logs ke File (Production)

```go
func main() {
    // Open log file
    logFile, err := os.OpenFile(
        "/var/log/control-plane-api/app.log",
        os.O_APPEND|os.O_CREATE|os.O_WRONLY,
        0644,
    )
    if err != nil {
        log.Fatal(err)
    }
    defer logFile.Close()

    logger := core.NewLogger(core.LogConfig{
        Level:       core.LevelInfo,
        ServiceName: "control-plane-api",
        Environment: "production",
        Pretty:      false,
        Output:      logFile, // Output ke file
    })

    // App logic...
}
```

#### 3. Docker Compose Setup

```yaml
# docker-compose.yaml
version: '3'
services:
  app:
    image: control-plane-api:latest
    volumes:
      - ./logs:/var/log/control-plane-api
    environment:
      - ENVIRONMENT=production

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./logs:/var/log/control-plane-api:ro
      - ./promtail-config.yaml:/etc/promtail/config.yaml
    command: -config.file=/etc/promtail/config.yaml

  loki:
    image: grafana/loki:latest
    ports:
      - "3100:3100"

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
```

### Grafana

#### 1. Add Loki Data Source

1. Login ke Grafana (http://localhost:3000)
2. Configuration → Data Sources → Add data source
3. Pilih **Loki**
4. URL: `http://loki:3100`
5. Save & Test

#### 2. Query Logs di Explore

**Query semua logs:**
```logql
{service="control-plane-api"}
```

**Query by level:**
```logql
{service="control-plane-api", level="error"}
```

**Query by event type:**
```logql
{service="control-plane-api"} |= "event_type=\"http_request\""
```

**Query critical errors:**
```logql
{service="control-plane-api"} |= "critical=true"
```

**Query by request ID:**
```logql
{service="control-plane-api"} |= "request_id=\"req_abc123\""
```

#### 3. Create Dashboard

**Panel: Error Rate**
```logql
sum(rate({service="control-plane-api", level="error"}[5m]))
```

**Panel: Request Duration (p95)**
```logql
histogram_quantile(0.95,
  sum(rate({service="control-plane-api", event_type="http_request"}
    | json
    | unwrap duration_ms [5m])) by (le)
)
```

**Panel: Critical Errors Count**
```logql
sum(count_over_time({service="control-plane-api"} |= "critical=true" [5m]))
```

### Prometheus Alerting

#### 1. Setup Prometheus to Scrape Loki Logs

Install `promtail` exporter atau gunakan Loki metrics endpoint.

#### 2. Alert Rules

```yaml
# alert-rules.yaml
groups:
  - name: critical_errors
    interval: 30s
    rules:
      - alert: CriticalErrorDetected
        expr: |
          count_over_time({service="control-plane-api"} |= "critical=true" [5m]) > 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Critical error detected in {{ $labels.service }}"
          description: "Service {{ $labels.service }} reported a critical error"

      - alert: HighErrorRate
        expr: |
          sum(rate({service="control-plane-api", level="error"}[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate in {{ $labels.service }}"
          description: "Error rate is {{ $value }} errors/sec"

      - alert: PanicRecovered
        expr: |
          count_over_time({service="control-plane-api"} |= "Panic recovered" [5m]) > 0
        labels:
          severity: critical
        annotations:
          summary: "Panic recovered in {{ $labels.service }}"
```

#### 3. Alertmanager Config

```yaml
# alertmanager.yaml
global:
  resolve_timeout: 5m

route:
  group_by: ['alertname', 'service']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack'

receivers:
  - name: 'slack'
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## Best Practices

### 1. Always Use Context-Aware Logging

**Good:**
```go
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    h.logger.WithContext(ctx).Info("Fetching user")
}
```

❌ **Bad:**
```go
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    h.logger.Info("Fetching user") // Missing context
}
```

### 2. Add Relevant Fields

**Good:**
```go
logger.WithContext(ctx).
    WithField("project_id", projectID).
    WithField("action", "delete").
    Info("Project deleted")
```

❌ **Bad:**
```go
logger.Info("Project deleted") // No details
```

### 3. Use Appropriate Log Levels

- **Debug**: Development details, verbose
- **Info**: Normal operations (created, updated, deleted)
- **Warn**: Unusual but not error (retry, deprecated API)
- **Error**: Error that doesn't stop service
- **Critical**: Error that needs immediate attention
- **Fatal**: Error that stops service

### 4. Log Errors with Context

**Good:**
```go
if err != nil {
    logger.WithContext(ctx).
        WithError(err).
        WithField("user_id", userID).
        Error("Failed to update user")
    return err
}
```

### 5. Use Critical Sparingly

Only use `Critical()` for errors that need immediate attention:
- Database connection lost
- External service completely down
- Data corruption detected
- Security breach

### 6. Structured vs String Messages

**Good:**
```go
logger.WithField("duration_ms", duration).Info("Request completed")
```

❌ **Bad:**
```go
logger.Infof("Request completed in %dms", duration) // Harder to query
```

---

## Examples

### Complete Handler Example

```go
package handler

import (
    "net/http"
    "github.com/go-chi/chi/v5"
    "github.com/your-org/core"
)

type ProjectHandler struct {
    logger  *core.Logger
    service *service.ProjectService
}

func NewProjectHandler(logger *core.Logger, svc *service.ProjectService) *ProjectHandler {
    return &ProjectHandler{
        logger:  logger,
        service: svc,
    }
}

func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    var req request.CreateProject
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.logger.WithContext(ctx).
            WithError(err).
            Warn("Invalid request body")
        core.RespondError(w, r, core.BadRequest("Invalid request body"))
        return
    }

    h.logger.WithContext(ctx).
        WithField("project_name", req.Name).
        Info("Creating project")

    project, err := h.service.CreateProject(ctx, &req)
    if err != nil {
        h.logger.WithContext(ctx).
            WithError(err).
            WithField("project_name", req.Name).
            Error("Failed to create project")
        core.RespondError(w, r, err)
        return
    }

    h.logger.WithContext(ctx).
        WithField("project_id", project.ID).
        WithField("project_name", project.Name).
        Info("Project created successfully")

    core.Created(w, r, project)
}
```

### Complete Service Example

```go
package service

import (
    "context"
    "time"
    "github.com/your-org/core"
)

type ProjectService struct {
    logger *core.Logger
    repo   *repository.ProjectRepository
}

func (s *ProjectService) CreateProject(ctx context.Context, req *request.CreateProject) (*response.Project, error) {
    // Validation
    if err := s.validator.Struct(req); err != nil {
        return nil, core.ValidationError(err)
    }

    // Check duplicate
    s.logger.WithContext(ctx).
        WithField("project_name", req.Name).
        Debug("Checking for duplicate project")

    exists, err := s.repo.ExistsByName(ctx, req.Name)
    if err != nil {
        s.logger.WithContext(ctx).
            WithError(err).
            Error("Failed to check duplicate project")
        return nil, core.InternalServerError("Failed to check project").WithError(err)
    }

    if exists {
        s.logger.WithContext(ctx).
            WithField("project_name", req.Name).
            Warn("Duplicate project name")
        return nil, core.Conflict("Project with this name already exists")
    }

    // Create project
    projectDAO := mapper.ToProjectDAO(req)

    start := time.Now()
    project, err := s.repo.Insert(ctx, projectDAO)
    duration := time.Since(start)

    s.logger.LogDatabaseQuery("INSERT INTO projects", duration, err)

    if err != nil {
        s.logger.WithContext(ctx).
            WithError(err).
            Critical("Failed to insert project", err)
        return nil, core.InternalServerError("Failed to create project").WithError(err)
    }

    // Audit log
    s.logger.LogAudit(
        core.GetUserIDFromContext(ctx),
        "create",
        "project",
        map[string]interface{}{
            "project_id": project.ID,
            "project_name": project.Name,
        },
    )

    return mapper.ToProjectResponse(project), nil
}
```

### Main Application Setup

```go
package main

import (
    "context"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/go-chi/chi/v5"
    "github.com/your-org/core"
)

func main() {
    // Initialize logger
    logger := core.NewLogger(core.LogConfig{
        Level:       getLogLevel(),
        ServiceName: "control-plane-api",
        Environment: os.Getenv("ENVIRONMENT"),
        Pretty:      os.Getenv("ENVIRONMENT") == "development",
    })

    logger.LogServiceState("starting", "init", map[string]interface{}{
        "pid": os.Getpid(),
        "version": "1.0.0",
    })

    // Setup router
    r := chi.NewRouter()

    // Middleware
    r.Use(core.RecoveryMiddleware(logger))
    r.Use(core.LoggingMiddleware(logger))
    r.Use(core.ContextMiddleware())

    // Routes
    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Write([]byte("OK"))
    })

    // Start server
    srv := &http.Server{
        Addr:    ":8080",
        Handler: r,
    }

    go func() {
        logger.LogServiceState("running", "start", map[string]interface{}{
            "port": 8080,
        })

        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            logger.Critical("Server failed", err)
            os.Exit(1)
        }
    }()

    // Graceful shutdown
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    logger.LogServiceState("stopping", "shutdown", map[string]interface{}{
        "signal": "SIGTERM",
    })

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        logger.Critical("Server shutdown failed", err)
    }

    logger.Info("Server stopped gracefully")
}

func getLogLevel() core.LogLevel {
    switch os.Getenv("LOG_LEVEL") {
    case "debug":
        return core.LevelDebug
    case "warn":
        return core.LevelWarn
    case "error":
        return core.LevelError
    default:
        return core.LevelInfo
    }
}
```

---

## Troubleshooting

### Logs tidak muncul di Loki

1. Check Promtail logs: `docker logs promtail`
2. Verify log file path di config
3. Check Promtail dapat akses file: `ls -la /var/log/control-plane-api/`
4. Test Loki connection: `curl http://loki:3100/ready`

### Critical alerts tidak trigger

1. Verify Prometheus scraping Loki
2. Check alert rules syntax
3. Test query di Grafana Explore:
   ```logql
   {service="control-plane-api"} |= "critical=true"
   ```

### Context values tidak muncul

1. Pastikan middleware order benar (ContextMiddleware setelah LoggingMiddleware)
2. Verify headers di-set: `X-User-Id`, `X-Org-Id`, dll
3. Check `WithContext()` dipanggil pada logger

---

## Summary

Core logging package menyediakan:
- Structured JSON logging ready untuk Loki/Grafana
- Context-aware automatic tracking
- HTTP middleware untuk request logging
- Critical error flagging untuk alerting
- Specialized methods untuk berbagai event types

**Next steps:**
1. Setup logger di service kamu
2. Configure Loki + Promtail + Grafana
3. Setup Prometheus alert rules
4. Create Grafana dashboards

Happy logging! 🚀
