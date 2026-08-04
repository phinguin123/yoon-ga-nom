import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env, isProduction } from "./config/env.js";
import { apiRouter } from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  // `credentials: true` + an explicit origin (not "*") is required for the
  // admin session cookie to work cross-origin in dev (frontend :5173 ->
  // backend :4000). In prod, both are served from the same domain via
  // Caddy, so this is mostly relevant for local development.
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  // Kakao unlink webhooks POST form fields; JSON for other API routes.
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(morgan(isProduction ? "combined" : "dev"));

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
