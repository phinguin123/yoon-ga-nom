import { Router } from "express";
import {
  getSeries,
  getVideo,
  listSeries,
  listVideos,
} from "../controllers/typeChallenge.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const typeChallengeRouter = Router();

// NOTE: /series routes must be declared before the generic /:id route below,
// otherwise Express would match "series" itself as an :id param.
typeChallengeRouter.get("/series", asyncHandler(listSeries));
typeChallengeRouter.get("/series/:key", asyncHandler(getSeries));

typeChallengeRouter.get("/", asyncHandler(listVideos));
typeChallengeRouter.get("/:id", asyncHandler(getVideo));
