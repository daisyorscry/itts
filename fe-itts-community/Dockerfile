# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM base AS builder
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_OPTIONS=--max-old-space-size=2048
RUN node node_modules/next/dist/bin/next build

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
