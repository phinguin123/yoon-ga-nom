import type { Request, Response } from "express";
import { getAllEvents } from "../data/scheduleEvents.js";
import { ok } from "../lib/response.js";

export function listEvents(req: Request, res: Response) {
  const { type } = req.query;
  let events = getAllEvents();

  if (typeof type === "string" && type.length > 0) {
    events = events.filter((e) => e.type === type);
  }

  ok(res, events);
}
