import "dotenv/config";

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
  // Optional: without this, live view counts/durations/thumbnails fall back
  // to the static placeholder values in src/data/typeChallengeVideos.ts.
  youtubeApiKey: process.env.YOUTUBE_API_KEY,
};

export const isProduction = env.nodeEnv === "production";
