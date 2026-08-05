import { Router } from "express";
import { listCategories, listEvents } from "../controllers/schedule.controller.js";

export const scheduleRouter = Router();

scheduleRouter.get("/", listEvents);
scheduleRouter.get("/categories", listCategories);
