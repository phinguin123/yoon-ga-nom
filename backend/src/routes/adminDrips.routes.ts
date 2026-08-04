import { Router } from "express";
import {
  createDripAdmin,
  deleteDripAdmin,
  listDripsAdmin,
  updateDripAdmin,
} from "../controllers/adminDrips.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminDripsRouter = Router();

adminDripsRouter.use(requireAdmin);

adminDripsRouter.get("/", asyncHandler(listDripsAdmin));
adminDripsRouter.post("/", asyncHandler(createDripAdmin));
adminDripsRouter.put("/:id", asyncHandler(updateDripAdmin));
adminDripsRouter.delete("/:id", deleteDripAdmin);
