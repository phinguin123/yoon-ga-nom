import { Router } from "express";
import { typeChallengeRouter } from "./typeChallenge.routes.js";
import { rouletteRouter } from "./roulette.routes.js";
import { scheduleRouter } from "./schedule.routes.js";
import { streamLogRouter } from "./streamLog.routes.js";
import { dyangRouter } from "./dyang.routes.js";
import { authRouter } from "./auth.routes.js";
import { userAuthRouter } from "./userAuth.routes.js";
import { adminVideosRouter } from "./adminVideos.routes.js";
import { adminDripsRouter } from "./adminDrips.routes.js";
import { adminVodCategoriesRouter, adminVodsRouter } from "./adminVods.routes.js";
import { adminScheduleCategoriesRouter, adminScheduleEventsRouter } from "./adminSchedule.routes.js";
import { dripRouter } from "./drip.routes.js";
import { webhookRouter } from "./webhook.routes.js";
import { vodRouter } from "./vod.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

apiRouter.use("/type-challenge", typeChallengeRouter);
apiRouter.use("/roulette", rouletteRouter);
apiRouter.use("/schedule", scheduleRouter);
apiRouter.use("/stream-log", streamLogRouter);
apiRouter.use("/dyang", dyangRouter);
apiRouter.use("/drips", dripRouter);
apiRouter.use("/vods", vodRouter);

// Fan Kakao login/session (separate from the single-password /admin/auth below).
apiRouter.use("/auth", userAuthRouter);

// Kakao privacy webhooks (unlink / account-status events).
apiRouter.use("/webhook", webhookRouter);

apiRouter.use("/admin/auth", authRouter);
apiRouter.use("/admin/videos", adminVideosRouter);
apiRouter.use("/admin/drips", adminDripsRouter);
apiRouter.use("/admin/vod-categories", adminVodCategoriesRouter);
apiRouter.use("/admin/vods", adminVodsRouter);
apiRouter.use("/admin/schedule/categories", adminScheduleCategoriesRouter);
apiRouter.use("/admin/schedule/events", adminScheduleEventsRouter);
