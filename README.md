# 윤가놈.gg — Fan & Utility Platform

A polished, scalable fan/utility site for the Pokémon streamer **Yoon-ga-nom** — Pokémon type-challenge archive, an interactive roulette, a stream schedule, a stream log ("stalker") archive, and a visually distinct "Dyang" collab page.

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS v4, React Router, Framer Motion, TanStack Query, Zustand
- **Backend**: Node.js + Express + TypeScript (ESM), Zod
- **Monorepo**: npm workspaces (`frontend/`, `backend/`)

## Getting Started

```bash
# from the repo root
npm install

# copy backend env vars
cp backend/.env.example backend/.env

# run both apps concurrently
npm run dev

# or run individually
npm run dev:frontend   # http://localhost:5173
npm run dev:backend    # http://localhost:4000
```

The Vite dev server proxies `/api/*` requests to the backend (see `frontend/vite.config.ts`), so the frontend can call `fetch("/api/...")` in both dev and prod without CORS issues.

## Project Structure

```
yoon-ga-nom/
├── frontend/                    # React + TypeScript SPA
│   └── src/
│       ├── app/                 # Router & app-level providers (React Query client)
│       ├── assets/              # Images, static media
│       ├── components/
│       │   ├── layout/          # Navbar, Footer, MainLayout, PageTransition
│       │   └── ui/               # Reusable design-system primitives
│       ├── features/            # Feature-first modules (one per core page)
│       │   ├── type-challenge/  #   video gallery + filters
│       │   ├── roulette/        #   spinning wheel tool
│       │   ├── schedule/        #   timeline of streams/events
│       │   ├── stream-log/      #   timestamped VOD archive
│       │   └── dyang/           #   romantic collab archive
│       │       └── components/, data/, hooks/
│       ├── hooks/                # Cross-feature hooks
│       ├── lib/                  # utils.ts (cn, formatters), api.ts (axios client)
│       ├── pages/                 # Route-level components (one per page)
│       ├── store/                 # Zustand stores (global client state)
│       └── types/                 # Shared domain types
│
└── backend/                     # Express + TypeScript API
    └── src/
        ├── config/               # env.ts — typed environment config
        ├── controllers/          # Request handlers (one per domain)
        ├── data/                 # In-memory data access layer (swap for a DB later)
        ├── lib/                  # response helpers, asyncHandler, HttpError
        ├── middleware/           # errorHandler, notFoundHandler
        ├── routes/               # Express routers, mounted under /api
        ├── types/                # Shared domain types (mirrors frontend)
        ├── app.ts                # Express app factory (helmet, cors, morgan, routes)
        └── server.ts             # Entry point — starts the HTTP server
```

**Why feature-first on the frontend?** Each of the 5 core pages (`type-challenge`, `roulette`, `schedule`, `stream-log`, `dyang`) owns its own `components/`, `data/`, and `hooks/`. This keeps things scalable — as each feature grows (e.g. roulette gets sound settings, saved custom wheels, etc.) its code stays contained instead of sprawling across shared folders.

**Why a data-access layer on the backend?** Controllers only call functions like `getAllVideos()` / `getVideoById()` — never touch storage directly. Today those functions return in-memory arrays; swapping to Postgres/Prisma or MongoDB later means only touching `src/data/*`, not the controllers or routes.

## API Overview

All responses are wrapped as `{ success: true, data }` or `{ success: false, error }`.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/type-challenge?type=&search=` | List/filter challenge videos |
| GET | `/api/type-challenge/:id` | Get one video |
| GET | `/api/roulette/presets` | List roulette presets |
| GET | `/api/roulette/presets/:id` | Get one preset |
| GET | `/api/schedule?type=` | List schedule events |
| GET | `/api/stream-log` | List stream logs |
| GET | `/api/stream-log/:id` | Get one stream log with entries |
| GET | `/api/dyang` | List Dyang collab timeline events |

## Design System Notes

- Brand palette (`brand-*`) and a separate, softer `dyang-*` palette live in `frontend/src/index.css` as Tailwind v4 `@theme` tokens.
- Visiting any `/dyang/*` route adds a `theme-dyang` class in `MainLayout`, switching the background, font (`Gowun Dodum`), and color usage across that page — no separate app needed.
- `PageTransition` + `AnimatePresence` in `MainLayout` gives every route a smooth fade/slide transition for free.

## Deployment (Docker + Caddy)

This repo ships with production Docker configs:

- `frontend/Dockerfile` — multi-stage build (Node → static build) served by nginx
- `backend/Dockerfile` — multi-stage build (Node → compiled JS) run on a minimal Node runtime
- `docker-compose.yml` — orchestrates `frontend`, `backend`, and `caddy`
- `Caddyfile` — reverse proxy + automatic HTTPS, routes `/api/*` to the backend and everything else to the frontend

All base images (`node:22-alpine`, `nginx:1.27-alpine`, `caddy:2-alpine`) are official multi-arch images with native `linux/arm64` support, so this builds natively (no emulation) on an Oracle Cloud A1 Ampere instance.

See the step-by-step deploy instructions in the PR/chat, or run:

```bash
cp backend/.env.example backend/.env   # then edit as needed
# edit Caddyfile: replace example.com with your real domain
docker compose up -d --build
```

## Next Steps

- Replace mock data in `frontend/src/features/*/data` and `backend/src/data/*` with real content (YouTube API, a CMS, or a database).
- Wire the frontend pages to the backend via TanStack Query (`@/lib/api.ts` is ready to go) instead of the bundled mock arrays.
- Add authentication if the streamer wants an admin panel to manage schedule/notices directly.
- Add real audio files to `frontend/public/sounds/` (`tick.mp3`, `win.mp3`) to enable roulette sound effects.
