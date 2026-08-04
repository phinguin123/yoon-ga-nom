import { createApp } from "./app.js";
import { env, isYoutubeConfigured } from "./config/env.js";
import { runMigrations } from "./db/migrate.js";
import { seedIfEmpty } from "./db/seed.js";
import { isAuthConfigured } from "./services/auth.service.js";

runMigrations();
seedIfEmpty();

const app = createApp();

app.listen(env.port, () => {
  console.log(`🚀 API server ready at http://localhost:${env.port}`);
  console.log(`   CORS allowed origin: ${env.corsOrigin}`);
  if (!isAuthConfigured()) {
    console.warn(
      "⚠️  Admin auth is not configured — /admin will be unusable until " +
        "ADMIN_PASSWORD_HASH and JWT_SECRET are set in backend/.env " +
        "(run `npm run hash-password -- <your password>` to generate the hash).",
    );
  }
  if (!isYoutubeConfigured()) {
    console.warn(
      "⚠️  YOUTUBE_API_KEY is not set — drip/episode upload dates, durations, " +
        "and thumbnails will not be fetched live from YouTube (drips still " +
        "fall back to the static thumbnail CDN). Add your key to " +
        "backend/.env (enable YouTube Data API v3 in Google Cloud Console).",
    );
  }
});
