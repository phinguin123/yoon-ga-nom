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
import { dripRouter } from "./drip.routes.js";

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

// Fan Kakao login/session (separate from the single-password /admin/auth below).
apiRouter.use("/auth", userAuthRouter);

apiRouter.use("/admin/auth", authRouter);
apiRouter.use("/admin/videos", adminVideosRouter);
apiRouter.use("/admin/drips", adminDripsRouter);
