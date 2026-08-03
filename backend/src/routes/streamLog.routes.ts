import { Router } from "express";
import { getLog, listLogs } from "../controllers/streamLog.controller.js";

export const streamLogRouter = Router();

streamLogRouter.get("/", listLogs);
streamLogRouter.get("/:id", getLog);
