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
| GET | `/api/type-challenge?type=&search=` | List/filter raw episodes |
| GET | `/api/type-challenge/:id` | Get one episode |
| GET | `/api/type-challenge/series?type=&search=` | List challenge **series** (episodes grouped + aggregated) |
| GET | `/api/type-challenge/series/:key` | Get one series with all its episodes |
| GET | `/api/roulette/presets` | List roulette presets |
| GET | `/api/roulette/presets/:id` | Get one preset |
| GET | `/api/schedule?type=` | List schedule events |
| GET | `/api/stream-log` | List stream logs |
| GET | `/api/stream-log/:id` | Get one stream log with entries |
| GET | `/api/dyang` | List Dyang collab timeline events |

### Type Challenge Archive: catalog + live YouTube data

Each type challenge is a numbered series of episodes (`전기타입 하트골드 #1, #2, ...`), always a single Pokémon type. This is modeled as two separate concerns in `backend/src/data/typeChallengeVideos.ts`:

- **Curated catalog** (hand-maintained): which video ID belongs to which type/series/episode number, and whether the series is `"ongoing"` or `"completed"`. YouTube has no way of knowing this, so it lives in our own data layer (swap the array for a real DB/CMS later).
- **Live stats** (`backend/src/services/youtube.service.ts`): title, thumbnail, publish date, view count, and duration are fetched from the official **YouTube Data API v3** and merged over the catalog's placeholder values, with an in-memory 1-hour cache to stay well under the free quota.

Aggregates like `totalViews` and `latestPublishedAt` on a series are computed **server-side** (`backend/src/lib/groupSeries.ts`) from this merged, real data — the frontend never recomputes them, it just renders whatever `/api/type-challenge/series` returns via a `useChallengeSeriesList()` React Query hook.

If `YOUTUBE_API_KEY` isn't set (see `backend/.env.example`), the app falls back to the catalog's static placeholder numbers instead of crashing — useful for local dev/demos. To go live:

1. Enable "YouTube Data API v3" for a project in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) and create an API key.
2. Set `YOUTUBE_API_KEY=...` in `backend/.env`.
3. Add/edit episodes with real video IDs from the channel via the `/admin` dashboard (see below) — no more editing source files.

### Admin dashboard (`/admin`)

The catalog above is now backed by a real SQLite database (`backend/data/app.db`, using Node's built-in `node:sqlite` — no native compilation, so it's ARM64/Alpine-friendly out of the box) instead of a hardcoded array. You manage it through a password-protected dashboard instead of editing code:

- **`/admin/login`** — password form. On success, the server sets an `httpOnly`, `SameSite=Strict` session cookie (JWT, 12h expiry); it's never exposed to JS, so it can't be stolen via XSS.
- **`/admin`** — add, edit, and delete episodes: pick the Pokémon type from a colored button grid, set series title/status, episode number, result, YouTube video ID, upload date, and freeform tags (type + Enter to add a tag chip). Changes are reflected immediately on the public Type Challenge pages.

Security measures in place:

- Passwords are hashed with **bcrypt** (`ADMIN_PASSWORD_HASH` in `.env` — the plaintext password is never stored anywhere).
- Sessions are **JWTs in an httpOnly cookie**, signed with `JWT_SECRET`, so they can't be read or forged from the browser.
- The login endpoint is **rate-limited** (10 attempts / 15 min / IP) to make password guessing impractical.
- Every `/api/admin/*` route independently re-verifies the session server-side (`requireAdmin` middleware) — the frontend route guard is UX only, not the actual security boundary.
- All input is validated with **Zod** before it touches the database, and all queries use parameterized statements (no SQL injection surface).

**One-time setup** — generate your own credentials (the repo ships with none):

```bash
cd backend
npm run hash-password -- "your-strong-password"   # prints ADMIN_PASSWORD_HASH
openssl rand -hex 32                               # generates JWT_SECRET
```

Add both to `backend/.env`:

```
ADMIN_PASSWORD_HASH=<paste the bcrypt hash>
JWT_SECRET=<paste the random hex string>
```

Without these two variables, the server still runs fine (the public site is unaffected) but logs a warning and `/admin` stays inaccessible (503 on login). The database file lives in `backend/data/` and is gitignored — back it up separately when deploying, since it's now the source of truth for episode content (it auto-seeds with starter data only the first time it's created).

## Design System Notes

- Brand palette (`brand-*`) and a separate, softer `dyang-*` palette live in `frontend/src/index.css` as Tailwind v4 `@theme` tokens.
- Visiting any `/dyang/*` route adds a `theme-dyang` class in `MainLayout`, switching the background, font (`Gowun Dodum`), and color usage across that page — no separate app needed.
- Page navigation is instant with no transition animation, by design.

## Deployment (Docker + Caddy)

This repo ships with production Docker configs:

- `frontend/Dockerfile` — multi-stage build (Node → static build) served by nginx
- `backend/Dockerfile` — multi-stage build (Node → compiled JS) run on a minimal Node runtime
- `docker-compose.yml` — orchestrates `frontend`, `backend`, and `caddy`
- `Caddyfile` — reverse proxy + automatic HTTPS, routes `/api/*` to the backend and everything else to the frontend

All base images (`node:24-alpine`, `nginx:1.27-alpine`, `caddy:2-alpine`) are official multi-arch images with native `linux/arm64` support, so this builds natively (no emulation) on an Oracle Cloud A1 Ampere instance. Node 24 specifically is required for the backend because of `node:sqlite` (see the Admin dashboard section above).

The backend's `backend_data` Docker volume holds the SQLite database — it survives `docker compose down`/`up` and image rebuilds, but you should back it up separately (e.g. periodically `docker cp` the file out, or mount a host directory instead of a named volume) since it now holds your admin-managed content.

**Initial deploy** — see the step-by-step instructions in the PR/chat, or run:

```bash
cp backend/.env.example backend/.env   # then edit as needed
# edit Caddyfile: replace example.com with your real domain
docker compose up -d --build
```

### Updating the production server (`git pull` → redeploy)

Every future deploy — whether it's a UI tweak or a database schema change — is the same two commands:

```bash
git pull
docker compose up -d --build
```

That's it. You never need to run manual `psql`/`sqlite3` commands or touch the data volume by hand. Here's why it's safe:

- **Your data is untouched by rebuilds.** `backend_data` is a named Docker volume, not part of the image. Rebuilding/recreating the `backend` container reuses the same volume, so `app.db` persists exactly as-is.
- **Schema changes ship as code, and apply themselves.** Every migration lives as a numbered entry in `backend/src/db/migrations.ts`. On every boot, `runMigrations()` (`backend/src/db/migrate.ts`) checks a `schema_migrations` table for which migrations have already run on *this* database file, and applies only the ones that are new — each wrapped in a transaction, so a failed migration rolls back instead of leaving a half-migrated table. This means:
  - A brand-new production database gets every migration in order, ending up fully up to date.
  - Your existing production database (with real admin-entered episodes) only runs whatever migration(s) it hasn't seen yet — old data is preserved/transformed in place, never wiped or reseeded (`seedIfEmpty()` only inserts starter data into a table with zero rows).
  - Restarting the container again is a safe no-op — already-applied migrations are skipped.

**When you (or I) add a new schema change**, it'll be a new entry appended to the `MIGRATIONS` array in `backend/src/db/migrations.ts` — never an edit to an existing entry. That's the one rule that keeps this safe: past migrations must stay exactly as they were, since production may apply them at a different point in time than your local machine did.

**Recommended: back up before a risky change.** Cheap insurance before any schema-changing deploy:

```bash
# find the actual volume name if unsure:
docker volume ls | grep backend_data

docker run --rm \
  -v yoon-ga-nom_backend_data:/data \
  -v "$(pwd)":/backup \
  alpine cp /data/app.db /backup/app.db.bak
```

If a deploy ever goes wrong, `docker compose down`, restore `app.db.bak` into the volume the same way (reversed `cp`), and redeploy the previous git commit.

## Next Steps

- The Type Challenge Archive is fully database-backed with an admin dashboard (see above) — Schedule, Stream Log, and Dyang pages still use static mock data in `frontend/src/features/*/data` / `backend/src/data/*`. The same SQLite + admin-CRUD pattern used for episodes can be extended to those next.
- Add real audio files to `frontend/public/sounds/` (`tick.mp3`, `win.mp3`) to enable roulette sound effects.
- Consider adding an "upload thumbnail" flow (e.g. to S3/R2) instead of hand-pasting thumbnail URLs in the admin form.
