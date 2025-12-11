# syntax=docker/dockerfile:1.7

FROM oven/bun:latest AS base
WORKDIR /app

FROM base AS deps

COPY package.json bun.lockb* ./

RUN --mount=type=cache,target=/root/.bun \
    bun install

FROM base AS builder
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/bun.lock ./bun.lock

COPY . .

RUN --mount=type=cache,target=/root/.bun \
    bunx next build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
USER bun

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]
