import { Router } from "express";
import {
  createVideoHandler,
  deleteVideoHandler,
  listVideos,
  updateVideoHandler,
} from "../controllers/adminVideos.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminVideosRouter = Router();

adminVideosRouter.use(requireAdmin);

adminVideosRouter.get("/", listVideos);
adminVideosRouter.post("/", createVideoHandler);
adminVideosRouter.put("/:id", updateVideoHandler);
adminVideosRouter.delete("/:id", deleteVideoHandler);
