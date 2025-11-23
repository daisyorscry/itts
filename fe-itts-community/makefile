PROJECT_NAME := itts-community
WEB_IMAGE := $(PROJECT_NAME)-web
API_IMAGE := $(PROJECT_NAME)-api
REGISTRY ?= ghcr.io/your-org 
TAG ?= latest

DEV_COMPOSE := docker-compose.yml
PROD_COMPOSE := docker-compose.prod.yml

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make dev          - Jalankan development (hot reload)"
	@echo "  make stop         - Stop container dev"
	@echo "  make logs         - Tampilkan logs semua service"
	@echo "  make prod         - Jalankan production build & container"
	@echo "  make prod-down    - Stop production container"
	@echo "  make build-web    - Build image web"
	@echo "  make build-api    - Build image api"
	@echo "  make push-web     - Push image web ke registry"
	@echo "  make push-api     - Push image api ke registry"
	@echo "  make clean        - Hapus container & image build cache"
	@echo "  make lint         - Jalankan lint (frontend & backend)"

.PHONY: dev
dev:
	docker compose -f $(DEV_COMPOSE) up --build

.PHONY: stop
stop:
	docker compose -f $(DEV_COMPOSE) down

.PHONY: logs
logs:
	docker compose -f $(DEV_COMPOSE) logs -f

.PHONY: prod
prod:
	docker compose -f $(PROD_COMPOSE) up --build -d

.PHONY: prod-down
prod-down:
	docker compose -f $(PROD_COMPOSE) down

.PHONY: build-web
build-web:
	docker build -t $(WEB_IMAGE):$(TAG) .

.PHONY: build-api
build-api:
	docker build -t $(API_IMAGE):$(TAG) -f api/Dockerfile .

.PHONY: push-web
push-web: build-web
	docker tag $(WEB_IMAGE):$(TAG) $(REGISTRY)/$(WEB_IMAGE):$(TAG)
	docker push $(REGISTRY)/$(WEB_IMAGE):$(TAG)

.PHONY: push-api
push-api: build-api
	docker tag $(API_IMAGE):$(TAG) $(REGISTRY)/$(API_IMAGE):$(TAG)
	docker push $(REGISTRY)/$(API_IMAGE):$(TAG)

.PHONY: clean
clean:
	docker compose -f $(DEV_COMPOSE) down -v --remove-orphans || true
	docker compose -f $(PROD_COMPOSE) down -v --remove-orphans || true
	docker system prune -af

.PHONY: lint
lint:
	@echo "Linting frontend..."
	docker run --rm -v $(PWD):/app -w /app node:20-alpine sh -c "npm ci && npm run lint"
	@echo "Linting backend..."
	docker run --rm -v $(PWD)/api:/app -w /app golang:1.22-alpine go vet ./...
