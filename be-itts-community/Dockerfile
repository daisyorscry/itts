# syntax=docker/dockerfile:1.7
ARG GO_VERSION=1.25.1

FROM golang:${GO_VERSION}-bookworm AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY . .

ENV CGO_ENABLED=0
ARG TARGETOS
ARG TARGETARCH
ENV GOOS=$TARGETOS GOARCH=$TARGETARCH

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o server ./cmd

FROM debian:bookworm-slim AS runner
WORKDIR /app
ENV TZ=Asia/Jakarta
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates tzdata && \
    rm -rf /var/lib/apt/lists/* && useradd -m -u 10001 appuser
COPY --from=builder /app/server ./server
USER appuser
EXPOSE 3002
CMD ["./server"]
