import { Router } from "express";
import { listEvents } from "../controllers/schedule.controller.js";

export const scheduleRouter = Router();

scheduleRouter.get("/", listEvents);
