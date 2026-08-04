# syntax=docker/dockerfile:1
#
# Build context for this Dockerfile MUST be the monorepo root (not backend/),
# for the same npm-workspaces reason explained in frontend/Dockerfile.
#
# node:24-alpine is an official multi-arch image published for linux/arm64
# (aarch64) as well as linux/amd64, so this builds cleanly on an Oracle Cloud
# A1 Ampere instance with no extra flags or emulation required. Node 24 is
# required (not just 22) because this app uses the built-in `node:sqlite`
# module for admin-managed content, which only became stable (no warnings,
# no --experimental-sqlite flag needed) as of Node 24.2.0.

# ---------- 1. Install deps & compile TypeScript ----------
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci

COPY backend ./backend
RUN npm run build --workspace=backend

# ---------- 2. Install production-only dependencies ----------
# A separate, minimal install so the final image doesn't ship devDependencies
# (typescript, tsx, @types/*) or the frontend's dependency tree.
FROM node:24-alpine AS prod-deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
RUN npm ci --workspace=backend --omit=dev

# ---------- 3. Minimal runtime image ----------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/backend/package.json ./backend/package.json
# Workspace installs can place deps under backend/node_modules when versions
# differ from the hoisted root tree (e.g. backend zod@3 vs frontend zod@4).
COPY --from=prod-deps /app/backend/node_modules ./backend/node_modules
COPY --from=build /app/backend/dist ./backend/dist

# Persisted separately via a named volume in docker-compose.yml — this is
# where the SQLite database (admin-managed episodes) lives.
RUN mkdir -p /app/backend/data && chown appuser:appgroup /app/backend/data

USER appuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/health >/dev/null 2>&1 || exit 1

CMD ["node", "backend/dist/server.js"]
