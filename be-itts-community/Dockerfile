# syntax=docker/dockerfile:1.7

ARG GO_VERSION=1.25.1
ARG TZ=Asia/Jakarta

FROM golang:${GO_VERSION}-bookworm AS builder

WORKDIR /app

LABEL org.opencontainers.image.authors="daisy daisyorscry@gmail.com" \
      org.opencontainers.image.title="ITTS Community Backend" \
      org.opencontainers.image.description="ITTS Community backend service" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.source="https://github.com/daisyorscry/itts"

ENV TZ=${TZ} \
    CGO_ENABLED=0 \
    GO111MODULE=on \
    GOPATH=/go

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates

COPY core ./core
COPY be-itts-community/go.mod be-itts-community/go.sum ./be-itts-community/

WORKDIR /app/be-itts-community

RUN --mount=type=cache,target=/go/pkg/mod go mod download

COPY be-itts-community ./

ARG TARGETOS
ARG TARGETARCH
ENV GOOS=$TARGETOS GOARCH=$TARGETARCH

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    go build -trimpath -ldflags="-s -w" -o server ./cmd

FROM golang:${GO_VERSION}-bookworm AS runner

WORKDIR /app

ENV TZ=${TZ}

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      tzdata && \
    rm -rf /var/lib/apt/lists/* && \
    update-ca-certificates && \
    useradd -m -u 10001 appuser && \
    mkdir -p /app /app/migrations /app/uploads/events && \
    chown -R appuser:appuser /app

COPY --from=builder /app/be-itts-community/server ./server
COPY --from=builder /app/be-itts-community/migrations ./migrations

USER appuser

EXPOSE 3002
CMD ["./server"]
