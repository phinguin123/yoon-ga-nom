import { Router } from "express";
import {
  likeDripHandler,
  listDripYearsHandler,
  listDripsHandler,
} from "../controllers/drip.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const dripRouter = Router();

dripRouter.get("/", asyncHandler(listDripsHandler));
dripRouter.get("/years", asyncHandler(listDripYearsHandler));
dripRouter.patch("/:id/like", asyncHandler(likeDripHandler));
