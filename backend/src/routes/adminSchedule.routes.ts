import { Router } from "express";
import {
  createCategoryHandler,
  createEventHandler,
  deleteCategoryHandler,
  deleteEventHandler,
  listCategoriesHandler,
  listEventsHandler,
  updateCategoryHandler,
  updateEventHandler,
} from "../controllers/adminSchedule.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

export const adminScheduleCategoriesRouter = Router();
adminScheduleCategoriesRouter.use(requireAdmin);

adminScheduleCategoriesRouter.get("/", listCategoriesHandler);
adminScheduleCategoriesRouter.post("/", createCategoryHandler);
adminScheduleCategoriesRouter.put("/:id", updateCategoryHandler);
adminScheduleCategoriesRouter.delete("/:id", deleteCategoryHandler);

export const adminScheduleEventsRouter = Router();
adminScheduleEventsRouter.use(requireAdmin);

adminScheduleEventsRouter.get("/", listEventsHandler);
adminScheduleEventsRouter.post("/", createEventHandler);
adminScheduleEventsRouter.put("/:id", updateEventHandler);
adminScheduleEventsRouter.delete("/:id", deleteEventHandler);
