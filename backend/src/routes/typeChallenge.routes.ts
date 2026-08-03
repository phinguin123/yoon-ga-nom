import { Router } from "express";
import { getVideo, listVideos } from "../controllers/typeChallenge.controller.js";

export const typeChallengeRouter = Router();

typeChallengeRouter.get("/", listVideos);
typeChallengeRouter.get("/:id", getVideo);
