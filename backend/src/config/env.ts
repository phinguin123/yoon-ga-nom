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

  // Kakao fan-account login (see services/kakao.service.ts). The Kakao
  // client secret is optional — it's only required if "Client Secret" is
  // turned on for the app in the Kakao Developers console.
  kakaoClientId: process.env.KAKAO_CLIENT_ID,
  kakaoClientSecret: process.env.KAKAO_CLIENT_SECRET,
  kakaoRedirectUri: process.env.KAKAO_REDIRECT_URI,
  // Primary Admin Key — Kakao includes this in the Authorization header of
  // unlink webhooks as `KakaoAK ${KAKAO_ADMIN_KEY}`.
  kakaoAdminKey: process.env.KAKAO_ADMIN_KEY,

  // Custom session JWTs issued after a successful Kakao login (see
  // services/userAuth.service.ts) — deliberately separate secrets/module
  // from the single-password admin JWT above.
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  accessTokenTtl: getEnv("ACCESS_TOKEN_TTL", "2h"),
  refreshTokenTtl: getEnv("REFRESH_TOKEN_TTL", "14d"),
};

export const isProduction = env.nodeEnv === "production";

export function isYoutubeConfigured(): boolean {
  return Boolean(env.youtubeApiKey);
}
