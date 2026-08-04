import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Monorepo dev often runs with cwd at the repo root — always load backend/.env.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  nodeEnv: getEnv("NODE_ENV", "development"),
  port: Number(getEnv("PORT", "4000")),
  corsOrigin: getEnv("CORS_ORIGIN", "http://localhost:5173"),
  youtubeApiKey: process.env.YOUTUBE_API_KEY?.trim() || undefined,
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH,
  jwtSecret: process.env.JWT_SECRET,
};

export const isProduction = env.nodeEnv === "production";

export function isYoutubeConfigured(): boolean {
  return Boolean(env.youtubeApiKey);
}
