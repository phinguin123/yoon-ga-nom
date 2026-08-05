import type { Request, Response } from "express";
import { listScheduleCategories } from "../data/scheduleCategories.js";
import { listScheduleEvents } from "../data/scheduleEvents.js";
import { ok } from "../lib/response.js";

export function listEvents(req: Request, res: Response) {
  const { categoryId } = req.query;
  let events = listScheduleEvents();

  if (typeof categoryId === "string" && categoryId.length > 0) {
    const id = Number(categoryId);
    events = events.filter((e) => e.categoryId === id);
  }

  ok(res, events);
}

export function listCategories(_req: Request, res: Response) {
  ok(res, listScheduleCategories());
}
