import type { Request, Response } from "express";
import { getAllDyangEvents } from "../data/dyangEvents.js";
import { ok } from "../lib/response.js";

export function listDyangEvents(_req: Request, res: Response) {
  ok(res, getAllDyangEvents());
}
