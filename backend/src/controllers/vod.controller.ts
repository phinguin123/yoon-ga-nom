import type { Request, Response } from "express";
import { listVodCategories } from "../data/vodCategories.js";
import { listVods } from "../data/vods.js";
import { ok } from "../lib/response.js";

/** Public "다시보기" list — optionally filtered to a single category via `?categoryId=`. */
export function listVodsHandler(req: Request, res: Response) {
  const { categoryId } = req.query;
  let vods = listVods();

  if (typeof categoryId === "string" && categoryId.length > 0) {
    const id = Number(categoryId);
    vods = vods.filter((vod) => vod.categoryId === id);
  }

  ok(res, vods);
}

export function listCategoriesHandler(_req: Request, res: Response) {
  ok(res, listVodCategories());
}
