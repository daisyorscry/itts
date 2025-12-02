.PHONY: help build run test clean dev docker-up docker-down docker-build \
        be-build be-run be-test be-lint be-tidy \
        fe-install fe-dev fe-build fe-lint \
        db-up db-down migrate

# Default target
help:
	@echo "ITTS Community - Available Commands"
	@echo ""
	@echo "Docker:"
	@echo "  docker-up       - Start all services with docker-compose"
	@echo "  docker-down     - Stop all services"
	@echo "  docker-build    - Build docker images"
	@echo "  docker-logs     - View docker logs"
	@echo "  db-up           - Start only database"
	@echo "  db-down         - Stop database"
	@echo ""
	@echo "Database Migrations:"
	@echo "  migrate-up      - Run all pending migrations"
	@echo "  migrate-down    - Rollback last migration"
	@echo "  migrate-status  - Show migration status"
	@echo "  migrate-reset   - Rollback all migrations"
	@echo "  migrate-create  - Create new migration (use: make migrate-create name=<name>)"
	@echo ""
	@echo "Backend (Go):"
	@echo "  be-build        - Build backend binary"
	@echo "  be-run          - Run backend server"
	@echo "  be-dev          - Run backend with hot reload (air)"
	@echo "  be-test         - Run backend tests"
	@echo "  be-lint         - Run golangci-lint"
	@echo "  be-tidy         - Run go mod tidy"
	@echo ""
	@echo "Frontend (Next.js):"
	@echo "  fe-install      - Install frontend dependencies"
	@echo "  fe-dev          - Run frontend dev server"
	@echo "  fe-build        - Build frontend for production"
	@echo "  fe-lint         - Run frontend linter"
	@echo ""
	@echo "Development:"
	@echo "  dev             - Run both backend and frontend (requires tmux)"
	@echo "  clean           - Clean build artifacts"

# =============================================================================
# Docker Commands
# =============================================================================

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-build:
	docker-compose build

docker-logs:
	docker-compose logs -f

db-up:
	docker-compose up -d db

db-down:
	docker-compose stop db

# =============================================================================
# Database Migrations (Goose)
# =============================================================================

MIGRATIONS_DIR := be-itts-community/migrations
DB_DSN ?= "postgres://root:root@localhost:5422/ittscommunity?sslmode=disable"

migrate-up:
	@if command -v goose > /dev/null; then \
		cd $(BE_DIR) && goose -dir migrations postgres $(DB_DSN) up; \
	else \
		echo "goose not installed. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"; \
		exit 1; \
	fi

migrate-down:
	@if command -v goose > /dev/null; then \
		cd $(BE_DIR) && goose -dir migrations postgres $(DB_DSN) down; \
	else \
		echo "goose not installed. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"; \
		exit 1; \
	fi

migrate-status:
	@if command -v goose > /dev/null; then \
		cd $(BE_DIR) && goose -dir migrations postgres $(DB_DSN) status; \
	else \
		echo "goose not installed. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"; \
		exit 1; \
	fi

migrate-reset:
	@if command -v goose > /dev/null; then \
		cd $(BE_DIR) && goose -dir migrations postgres $(DB_DSN) reset; \
	else \
		echo "goose not installed. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"; \
		exit 1; \
	fi

migrate-create:
	@if command -v goose > /dev/null; then \
		@if [ -z "$(name)" ]; then \
			echo "Usage: make migrate-create name=<migration_name>"; \
			exit 1; \
		fi; \
		cd $(BE_DIR) && goose -dir migrations create $(name) sql; \
	else \
		echo "goose not installed. Install with: go install github.com/pressly/goose/v3/cmd/goose@latest"; \
		exit 1; \
	fi

# =============================================================================
# Backend Commands
# =============================================================================

BE_DIR := be-itts-community
BE_BINARY := server

be-build:
	cd $(BE_DIR) && go build -o $(BE_BINARY) ./cmd

be-run: be-build
	cd $(BE_DIR) && ./$(BE_BINARY)

be-dev:
	@if command -v air > /dev/null; then \
		cd $(BE_DIR) && air; \
	else \
		echo "air not installed. Install with: go install github.com/air-verse/air@latest"; \
		exit 1; \
	fi

be-test:
	cd $(BE_DIR) && go test -v ./...

be-test-cover:
	cd $(BE_DIR) && go test -v -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html

be-lint:
	@if command -v golangci-lint > /dev/null; then \
		cd $(BE_DIR) && golangci-lint run; \
	else \
		echo "golangci-lint not installed. Install from: https://golangci-lint.run/usage/install/"; \
		exit 1; \
	fi

be-tidy:
	cd $(BE_DIR) && go mod tidy

be-clean:
	cd $(BE_DIR) && rm -f $(BE_BINARY) coverage.out coverage.html

# =============================================================================
# Frontend Commands
# =============================================================================

FE_DIR := fe-itts-community

fe-install:
	cd $(FE_DIR) && bun install

fe-dev:
	cd $(FE_DIR) && bun run dev

fe-build:
	cd $(FE_DIR) && bun run build

fe-lint:
	cd $(FE_DIR) && bun run lint

fe-clean:
	cd $(FE_DIR) && rm -rf .next node_modules

# =============================================================================
# Development
# =============================================================================

dev:
	@$(MAKE) -j2 be-run fe-dev

# =============================================================================
# Cleanup
# =============================================================================

clean: be-clean fe-clean
	@echo "Cleaned all build artifacts"
