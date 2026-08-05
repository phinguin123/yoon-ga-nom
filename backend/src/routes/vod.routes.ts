import { Router } from "express";
import { listCategoriesHandler, listVodsHandler } from "../controllers/vod.controller.js";

export const vodRouter = Router();

vodRouter.get("/categories", listCategoriesHandler);
vodRouter.get("/", listVodsHandler);
