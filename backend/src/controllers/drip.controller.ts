import type { Request, Response } from "express";
import { z } from "zod";
import {
  incrementDripLikes,
  listDripYears,
  listDrips,
  type DripSort,
} from "../data/drips.js";
import { HttpError, NotFoundError, ok } from "../lib/response.js";

const sortSchema = z.enum(["likes", "recent"]);
const yearSchema = z.coerce.number().int().min(2000).max(2100);

export async function listDripsHandler(req: Request, res: Response) {
  const parsedSort = sortSchema.safeParse(req.query.sort);
  if (req.query.sort !== undefined && !parsedSort.success) {
    throw new HttpError(400, "sort는 'likes' 또는 'recent'만 사용할 수 있습니다.");
  }

  let year: number | undefined;
  if (req.query.year !== undefined && req.query.year !== "all") {
    const parsedYear = yearSchema.safeParse(req.query.year);
    if (!parsedYear.success) {
      throw new HttpError(400, "year는 2000~2100 사이의 정수여야 합니다.");
    }
    year = parsedYear.data;
  }

  const sort: DripSort = parsedSort.success ? parsedSort.data : "recent";
  ok(res, await listDrips(sort, year));
}

export async function listDripYearsHandler(_req: Request, res: Response) {
  ok(res, await listDripYears());
}

export async function likeDripHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "유효하지 않은 드립 ID입니다.");
  }

  const updated = await incrementDripLikes(id);
  if (!updated) throw new NotFoundError(`드립을 찾을 수 없습니다: ${id}`);
  ok(res, updated);
}
