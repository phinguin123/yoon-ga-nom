import type { DatabaseSync } from "node:sqlite";

export interface Migration {
  /** Must be unique and sort correctly as a string (zero-padded prefix). Never rename or reorder past entries. */
  id: string;
  up: (db: DatabaseSync) => void;
}

const EPISODES_SCHEMA = `
  id TEXT PRIMARY KEY,
  series_title TEXT NOT NULL,
  series_status TEXT NOT NULL CHECK (series_status IN ('ongoing', 'completed')),
  episode_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  youtube_id TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  type TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('clear', 'in-progress')),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  published_at TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
`;

/**
 * Ordered, append-only list of schema migrations. Each one runs at most once
 * (tracked in the `schema_migrations` table by `id`) and is wrapped in a
 * transaction by the runner in `migrate.ts`. To make a schema change:
 *
 *   1. Add a new entry at the end with the next zero-padded number.
 *   2. Never edit or remove a past entry, even if its logic looks stale —
 *      other environments (prod, teammates) may not have applied it yet.
 *   3. Deploying is then just `git pull && docker compose up -d --build`;
 *      the new backend container applies any pending migrations on boot.
 */
export const MIGRATIONS: Migration[] = [
  {
    id: "001_create_episodes",
    up: (db) => {
      db.exec(`CREATE TABLE IF NOT EXISTS episodes (${EPISODES_SCHEMA});`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);`);
    },
  },
  {
    id: "002_episode_result_clear_or_in_progress",
    // Original schema allowed result IN ('clear', 'fail'). SQLite can't ALTER
    // a CHECK constraint in place, so rebuild the table under the new
    // constraint and remap any legacy 'fail' rows to 'in-progress'. Safe/no-op
    // if a database already has the new constraint (e.g. freshly created by
    // migration 001 above, which already writes the correct constraint).
    up: (db) => {
      const existingSql = (
        db
          .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'episodes'")
          .get() as { sql: string } | undefined
      )?.sql;

      if (!existingSql?.includes("'fail'")) return;

      db.exec(`CREATE TABLE episodes_new (${EPISODES_SCHEMA});`);
      db.exec(`
        INSERT INTO episodes_new
        SELECT id, series_title, series_status, episode_number, title, youtube_id,
               thumbnail_url, type,
               CASE result WHEN 'fail' THEN 'in-progress' ELSE result END,
               duration_seconds, published_at, views, tags, created_at, updated_at
        FROM episodes;
      `);
      db.exec(`DROP TABLE episodes;`);
      db.exec(`ALTER TABLE episodes_new RENAME TO episodes;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);`);
    },
  },
  {
    id: "003_create_drips",
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS drips (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          youtube_video_id TEXT NOT NULL,
          timestamp TEXT NOT NULL DEFAULT '0m0s',
          likes INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_likes ON drips(likes DESC);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_created_at ON drips(created_at DESC);`);
    },
  },
  {
    id: "004_add_drip_year",
    up: (db) => {
      db.exec(`ALTER TABLE drips ADD COLUMN year INTEGER NOT NULL DEFAULT 2026;`);
      db.exec(`UPDATE drips SET year = CAST(substr(created_at, 1, 4) AS INTEGER);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_year ON drips(year);`);
    },
  },
  {
    id: "005_drop_drip_year",
    // Year is derived from the YouTube upload date at read time — no manual DOTY year field.
    up: (db) => {
      db.exec(`DROP INDEX IF EXISTS idx_drips_year;`);
      db.exec(`ALTER TABLE drips DROP COLUMN year;`);
    },
  },
  {
    id: "006_add_drip_published_at",
    up: (db) => {
      db.exec(`ALTER TABLE drips ADD COLUMN published_at TEXT;`);
    },
  },
  {
    id: "007_drips_native_video",
    // Drips move from YouTube embeds to directly-hosted video files: drop
    // `youtube_video_id`/`timestamp`/`description`, add `video_url`,
    // `thumbnail_url`, `duration_seconds`, `comments`, and `tags`. SQLite
    // can't drop/retype columns in place, so rebuild the table.
    // `published_at` becomes an admin-entered "drip date" instead of a
    // value fetched live from the YouTube API.
    up: (db) => {
      db.exec(`
        CREATE TABLE drips_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          video_url TEXT NOT NULL DEFAULT '',
          thumbnail_url TEXT NOT NULL DEFAULT '',
          duration_seconds INTEGER NOT NULL DEFAULT 0,
          likes INTEGER NOT NULL DEFAULT 0,
          comments INTEGER NOT NULL DEFAULT 0,
          tags TEXT NOT NULL DEFAULT '[]',
          published_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`
        INSERT INTO drips_new
          (id, title, video_url, thumbnail_url, duration_seconds, likes, comments, tags, published_at, created_at)
        SELECT
          id, title,
          'https://www.youtube.com/watch?v=' || youtube_video_id,
          '', 0, likes, 0, '[]',
          COALESCE(published_at, created_at),
          created_at
        FROM drips;
      `);
      db.exec(`DROP TABLE drips;`);
      db.exec(`ALTER TABLE drips_new RENAME TO drips;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_likes ON drips(likes DESC);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_created_at ON drips(created_at DESC);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_published_at ON drips(published_at DESC);`);
    },
  },
  {
    id: "008_drips_back_to_youtube",
    // Reverting 007: drips are YouTube clips again, not directly-hosted video
    // files. Admins only ever paste a YouTube video ID (+ optional clip
    // start timestamp) — the thumbnail, duration, and upload date are all
    // derived automatically (see data/drips.ts), never entered by hand.
    // `thumbnail_url`/`published_at` go back to nullable: null just means
    // "not fetched from the YouTube API yet", with fallbacks computed at
    // read time instead of a NOT NULL default masking that.
    up: (db) => {
      db.exec(`
        CREATE TABLE drips_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          youtube_video_id TEXT NOT NULL DEFAULT '',
          timestamp TEXT NOT NULL DEFAULT '0m0s',
          thumbnail_url TEXT,
          duration_seconds INTEGER NOT NULL DEFAULT 0,
          likes INTEGER NOT NULL DEFAULT 0,
          comments INTEGER NOT NULL DEFAULT 0,
          tags TEXT NOT NULL DEFAULT '[]',
          published_at TEXT,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`
        INSERT INTO drips_new
          (id, title, youtube_video_id, timestamp, thumbnail_url, duration_seconds, likes, comments, tags, published_at, created_at)
        SELECT
          id, title,
          CASE WHEN instr(video_url, 'v=') > 0 THEN substr(video_url, instr(video_url, 'v=') + 2) ELSE '' END,
          '0m0s',
          NULLIF(thumbnail_url, ''),
          duration_seconds, likes, comments, tags, published_at, created_at
        FROM drips;
      `);
      db.exec(`DROP TABLE drips;`);
      db.exec(`ALTER TABLE drips_new RENAME TO drips;`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_likes ON drips(likes DESC);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_created_at ON drips(created_at DESC);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_drips_published_at ON drips(published_at DESC);`);
    },
  },
  {
    id: "009_create_users",
    // Fan accounts, authenticated via Kakao Login. Kakao is only ever used
    // to prove identity once at login time — we never store or reuse
    // Kakao's own access/refresh tokens; every session afterwards runs on
    // our own JWTs (see services/userAuth.service.ts). `role` defaults to
    // 'user' and is independent of the single-password /admin dashboard
    // login (services/auth.service.ts) — it exists so a fan account can be
    // promoted later without a schema change.
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kakao_id TEXT NOT NULL UNIQUE,
          nickname TEXT NOT NULL,
          profile_image TEXT,
          role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_users_kakao_id ON users(kakao_id);`);
    },
  },
  {
    id: "010_create_vod_categories_and_vods",
    // "다시보기" admin: chzzk VOD catalog + simple named categories to sort
    // them into. CHZZK has no official public API — title/thumbnail/
    // duration/views/publishedAt are fetched from its undocumented web API
    // (see services/chzzk.service.ts) at add/edit time and stored here as
    // the source of truth, refreshed on demand rather than on every read.
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS vod_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS vods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          chzzk_video_no INTEGER NOT NULL UNIQUE,
          category_id INTEGER REFERENCES vod_categories(id) ON DELETE SET NULL,
          title TEXT NOT NULL DEFAULT '',
          thumbnail_url TEXT NOT NULL DEFAULT '',
          duration_seconds INTEGER NOT NULL DEFAULT 0,
          views INTEGER NOT NULL DEFAULT 0,
          published_at TEXT,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_vods_category_id ON vods(category_id);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_vods_published_at ON vods(published_at DESC);`);
    },
  },
  {
    id: "011_create_schedule_categories_and_events",
    // Google-Calendar-style scheduling: admin-managed colored categories
    // (no fixed enum — replaces the old hardcoded stream/collab/event/notice
    // union) plus the events themselves. Seeds the same four categories and
    // sample events the site previously shipped as hardcoded mock data, so
    // the calendar isn't empty on first boot.
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS schedule_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          color TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`
        CREATE TABLE IF NOT EXISTS schedule_events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category_id INTEGER REFERENCES schedule_categories(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL DEFAULT '',
          start_at TEXT NOT NULL,
          end_at TEXT,
          all_day INTEGER NOT NULL DEFAULT 0,
          is_pinned INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
          updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
        );
      `);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_schedule_events_category_id ON schedule_events(category_id);`);
      db.exec(`CREATE INDEX IF NOT EXISTS idx_schedule_events_start_at ON schedule_events(start_at);`);

      const insertCategory = db.prepare(
        "INSERT INTO schedule_categories (name, color, sort_order) VALUES (?, ?, ?)",
      );
      const categoryIds: Record<string, number> = {};
      const seedCategories: [string, string][] = [
        ["방송", "#327dff"],
        ["콜라보", "#fb4d8b"],
        ["이벤트", "#ff9d1f"],
        ["공지", "#64748b"],
      ];
      seedCategories.forEach(([name, color], index) => {
        const result = insertCategory.run(name, color, index);
        categoryIds[name] = Number(result.lastInsertRowid);
      });

      const insertEvent = db.prepare(`
        INSERT INTO schedule_events (category_id, title, description, start_at, end_at, all_day, is_pinned)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const seedEvents: {
        category: string;
        title: string;
        description?: string;
        start: string;
        end?: string;
        isPinned?: boolean;
      }[] = [
        {
          category: "방송",
          title: "고스트 타입 챌린지 방송",
          description: "8체육관 고스트 타입 단일 클리어 도전",
          start: "2026-08-05T20:00:00+09:00",
        },
        {
          category: "콜라보",
          title: "댱과 함께하는 더블배틀 콜라보",
          description: "댱 채널과 동시 송출 예정",
          start: "2026-08-08T19:00:00+09:00",
          end: "2026-08-08T22:00:00+09:00",
          isPinned: true,
        },
        {
          category: "이벤트",
          title: "채널 20만 구독자 기념 이벤트",
          description: "구독자 이벤트 상세 공지는 추후 업데이트",
          start: "2026-08-15T00:00:00+09:00",
          isPinned: true,
        },
        {
          category: "공지",
          title: "다음 주 스케줄 관련 공지",
          description: "8/10~8/16 은 개인 사정으로 방송 횟수가 줄어들 수 있어요.",
          start: "2026-08-03T12:00:00+09:00",
        },
        {
          category: "방송",
          title: "전기 타입 챌린지 방송",
          start: "2026-08-12T20:00:00+09:00",
        },
        {
          category: "방송",
          title: "구독자 랜덤 듀오 방송",
          start: "2026-08-19T21:00:00+09:00",
        },
      ];
      for (const event of seedEvents) {
        insertEvent.run(
          categoryIds[event.category] ?? null,
          event.title,
          event.description ?? "",
          event.start,
          event.end ?? null,
          0,
          event.isPinned ? 1 : 0,
        );
      }
    },
  },
];
