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
];
