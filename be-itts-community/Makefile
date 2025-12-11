PROJECT_NAME := itts-community-api
TAG ?= latest

# Harbor registry config
HARBOR_REGISTRY := harbor.itts.fun
HARBOR_IMAGE := $(HARBOR_REGISTRY)/ittscommunity/core-service

# Docker config
DOCKERFILE := Dockerfile

.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make build        - Build Docker image"
	@echo "  make push-harbor  - Build & push image ke Harbor registry"
	@echo "  make run          - Jalankan server lokal (go run)"
	@echo "  make test         - Jalankan tests"
	@echo "  make migrate-up   - Jalankan migrasi database up"
	@echo "  make migrate-down - Jalankan migrasi database down"
	@echo "  make clean        - Hapus binary & cache"

.PHONY: build
build:
	docker build -t $(HARBOR_IMAGE):$(TAG) -f $(DOCKERFILE) .

.PHONY: push-harbor
push-harbor: build
	docker push $(HARBOR_IMAGE):$(TAG)

.PHONY: run
run:
	go run ./cmd

.PHONY: test
test:
	go test -v ./...

.PHONY: migrate-up
migrate-up:
	make -C . migrate-up

.PHONY: migrate-down
migrate-down:
	make -C . migrate-down

.PHONY: migrate-status
migrate-status:
	make -C . migrate-status

.PHONY: clean
clean:
	rm -f server
	go clean -cache -testcache -modcache

.PHONY: lint
lint:
	go vet ./...
	gofmt -s -w .

.PHONY: deps
deps:
	go mod download
	go mod tidy
