import { Router } from "express";
import { getPreset, listPresets } from "../controllers/roulette.controller.js";

export const rouletteRouter = Router();

rouletteRouter.get("/presets", listPresets);
rouletteRouter.get("/presets/:id", getPreset);
