import { Router } from "express";
import { typeChallengeRouter } from "./typeChallenge.routes.js";
import { rouletteRouter } from "./roulette.routes.js";
import { scheduleRouter } from "./schedule.routes.js";
import { streamLogRouter } from "./streamLog.routes.js";
import { dyangRouter } from "./dyang.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

apiRouter.use("/type-challenge", typeChallengeRouter);
apiRouter.use("/roulette", rouletteRouter);
apiRouter.use("/schedule", scheduleRouter);
apiRouter.use("/stream-log", streamLogRouter);
apiRouter.use("/dyang", dyangRouter);
