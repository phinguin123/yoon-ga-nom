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
];
