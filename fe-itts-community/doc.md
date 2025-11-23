# Dev mode (Next.js hot reload + Go run)
make dev

# Lihat logs real-time
make logs

# Stop dev container
make stop

# Build & run production container
make prod

# Hentikan prod
make prod-down

# Build image saja
make build-web
make build-api

# Push ke registry (ubah REGISTRY)
make push-web REGISTRY=ghcr.io/your-org TAG=1.0.0
make push-api REGISTRY=ghcr.io/your-org TAG=1.0.0

# Hapus container + cache
make clean

# Jalankan lint
make lint
