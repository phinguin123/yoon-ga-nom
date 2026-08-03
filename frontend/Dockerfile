# syntax=docker/dockerfile:1
#
# Build context for this Dockerfile MUST be the monorepo root (not frontend/),
# because this is an npm-workspaces project and needs the root package.json +
# package-lock.json to install correctly. See docker-compose.yml:
#   build: { context: ., dockerfile: frontend/Dockerfile }
#
# node:22-alpine and nginx:1.27-alpine are both official multi-arch images
# published for linux/arm64 (aarch64) as well as linux/amd64, so this builds
# cleanly on an Oracle Cloud A1 Ampere instance with no extra flags.

# ---------- 1. Install & build ----------
FROM node:22-alpine AS build
WORKDIR /app

# Copy only manifests first so this layer is cached unless dependencies change.
# Both workspaces' package.json files are required for `npm ci` to validate
# against the root package-lock.json, even though we only build the frontend.
COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json
RUN npm ci

COPY frontend ./frontend
RUN npm run build --workspace=frontend

# ---------- 2. Serve the static build with nginx ----------
FROM nginx:1.27-alpine AS runtime

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]
