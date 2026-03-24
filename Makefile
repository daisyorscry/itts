.PHONY: help dev be-dev fe-dev seed fresh

BE_DIR := be-itts-community
FE_DIR := web-app

help:
	@echo "ITTS Community"
	@echo ""
	@echo "Available commands:"
	@echo "  dev     - Run backend with air and frontend with bun run dev"
	@echo "  be-dev  - Run backend with air"
	@echo "  fe-dev  - Run frontend with bun run dev"
	@echo "  seed    - Run backend migrations and seeds, then exit"
	@echo "  fresh   - Reset public schema, rerun all migrations/seeds, then exit"

dev:
	@$(MAKE) -j2 be-dev fe-dev

be-dev:
	@if command -v air > /dev/null; then \
		cd $(BE_DIR) && air; \
	else \
		echo "air not installed. Install with: go install github.com/air-verse/air@latest"; \
		exit 1; \
	fi

fe-dev:
	cd $(FE_DIR) && bun run dev

seed:
	cd $(BE_DIR) && APP_MIGRATION_ONLY=true go run ./cmd

fresh:
	cd $(BE_DIR) && DB_FRESH_SEED=true APP_MIGRATION_ONLY=true go run ./cmd
