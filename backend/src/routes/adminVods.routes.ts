import { Router } from "express";
import {
  createCategoryHandler,
  createVodHandler,
  deleteCategoryHandler,
  deleteVodHandler,
  listCategoriesHandler,
  listChannelVideosHandler,
  listVodsHandler,
  lookupChzzkVideoHandler,
  refreshVodHandler,
  updateCategoryHandler,
  updateVodHandler,
} from "../controllers/adminVods.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminVodCategoriesRouter = Router();
adminVodCategoriesRouter.use(requireAdmin);

adminVodCategoriesRouter.get("/", listCategoriesHandler);
adminVodCategoriesRouter.post("/", createCategoryHandler);
adminVodCategoriesRouter.put("/:id", updateCategoryHandler);
adminVodCategoriesRouter.delete("/:id", deleteCategoryHandler);

export const adminVodsRouter = Router();
adminVodsRouter.use(requireAdmin);

// NOTE: these static sub-paths must be declared before the generic "/:id"
// routes below, otherwise Express would match "lookup"/"channel-videos" as
// an :id param.
adminVodsRouter.get("/lookup", asyncHandler(lookupChzzkVideoHandler));
adminVodsRouter.get("/channel-videos", asyncHandler(listChannelVideosHandler));

adminVodsRouter.get("/", listVodsHandler);
adminVodsRouter.post("/", asyncHandler(createVodHandler));
adminVodsRouter.put("/:id", asyncHandler(updateVodHandler));
adminVodsRouter.post("/:id/refresh", asyncHandler(refreshVodHandler));
adminVodsRouter.delete("/:id", deleteVodHandler);
