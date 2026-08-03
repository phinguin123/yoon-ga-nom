import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Uses Node's built-in SQLite module (stable since Node 24.2+, no native
// compilation required) — this matters a lot for deploying on ARM64/Alpine:
// no build toolchain, no prebuilt-binary mismatches, it just works.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.resolve(__dirname, "../../data");
const DB_PATH = process.env.SQLITE_PATH ?? path.join(DATA_DIR, "app.db");

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);
db.exec("PRAGMA journal_mode = WAL;");
db.exec("PRAGMA foreign_keys = ON;");
