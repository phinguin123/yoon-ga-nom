import { db } from "./client.js";
import { MIGRATIONS } from "./migrations.js";

db.exec(`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
  );
`);

/**
 * Applies any migrations from `migrations.ts` that haven't run against this
 * database file yet, in order, each in its own transaction. Called once on
 * server boot (see server.ts) — this is what makes `git pull` + redeploy
 * sufficient in production; no manual DB commands are ever needed.
 */
export function runMigrations() {
  const applied = new Set(
    (db.prepare("SELECT id FROM schema_migrations").all() as { id: string }[]).map((row) => row.id),
  );

  const pending = MIGRATIONS.filter((m) => !applied.has(m.id));
  if (pending.length === 0) return;

  for (const migration of pending) {
    db.exec("BEGIN");
    try {
      migration.up(db);
      db.prepare("INSERT INTO schema_migrations (id) VALUES (?)").run(migration.id);
      db.exec("COMMIT");
      console.log(`[db] Applied migration: ${migration.id}`);
    } catch (error) {
      db.exec("ROLLBACK");
      throw new Error(`[db] Migration "${migration.id}" failed, rolled back: ${(error as Error).message}`);
    }
  }
}
