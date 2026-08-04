import type { Request, Response } from "express";
import { z } from "zod";
import {
  createDrip,
  deleteDrip,
  enrichDripsWithYoutube,
  listDripsFromDb,
  updateDrip,
} from "../data/drips.js";
import { HttpError, NotFoundError, ok } from "../lib/response.js";

const dripSchema = z.object({
  title: z.string().trim().min(1, "드립 제목을 입력해주세요."),
  youtubeVideoId: z.string().trim().min(1, "유튜브 영상 ID를 입력해주세요."),
  timestamp: z
    .string()
    .trim()
    .regex(/^\d+m\d+s$/i, "타임스탬프는 분·초 형식(예: 23m45s)으로 입력해주세요.")
    .default("0m0s"),
  likes: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export async function listDripsAdmin(_req: Request, res: Response) {
  const drips = await enrichDripsWithYoutube(listDripsFromDb("recent"));
  ok(res, drips);
}

export async function createDripAdmin(req: Request, res: Response) {
  const parsed = dripSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());
  }

  const created = await createDrip(parsed.data);
  ok(res, created, 201);
}

export async function updateDripAdmin(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "유효하지 않은 드립 ID입니다.");
  }

  const parsed = dripSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());
  }

  const updated = await updateDrip(id, parsed.data);
  if (!updated) throw new NotFoundError(`드립을 찾을 수 없습니다: ${id}`);
  ok(res, updated);
}

export function deleteDripAdmin(req: Request, res: Response) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new HttpError(400, "유효하지 않은 드립 ID입니다.");
  }

  const deleted = deleteDrip(id);
  if (!deleted) throw new NotFoundError(`드립을 찾을 수 없습니다: ${id}`);
  ok(res, { deleted: true });
}
