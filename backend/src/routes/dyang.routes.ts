import { Router } from "express";
import { listDyangEvents } from "../controllers/dyang.controller.js";

export const dyangRouter = Router();

dyangRouter.get("/", listDyangEvents);
