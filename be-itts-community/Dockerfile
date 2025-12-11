# syntax=docker/dockerfile:1.7

ARG BASE_IMAGE=harbor.itts.fun/baseimage/go-base:1.25.1 
ARG GO_VERSION=1.25.1

FROM ${BASE_IMAGE} AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY . .

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=$TARGETOS GOARCH=$TARGETARCH

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o server ./cmd

FROM ${BASE_IMAGE} AS runner

USER appuser
WORKDIR /app

COPY --from=builder /app/server ./server
COPY --from=builder /app/migrations ./migrations

EXPOSE 3002
CMD ["./server"]
