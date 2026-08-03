import type { Request, Response } from "express";
import { z } from "zod";
import { POKEMON_TYPES } from "../constants/pokemonTypes.js";
import {
  createVideo,
  deleteVideo,
  listAdminVideos,
  updateVideo,
} from "../data/typeChallengeVideos.js";
import { HttpError, NotFoundError, ok } from "../lib/response.js";

const episodeSchema = z.object({
  seriesTitle: z.string().trim().min(1, "시리즈 제목을 입력해주세요."),
  seriesStatus: z.enum(["ongoing", "completed"]),
  episodeNumber: z.coerce.number().int().positive(),
  title: z.string().trim().min(1, "영상 제목을 입력해주세요."),
  youtubeId: z.string().trim().min(1, "유튜브 영상 ID를 입력해주세요."),
  thumbnailUrl: z.string().trim().min(1, "썸네일 URL을 입력해주세요."),
  type: z.enum(POKEMON_TYPES as [string, ...string[]]),
  result: z.enum(["clear", "in-progress"]),
  durationSeconds: z.coerce.number().int().min(0).default(0),
  publishedAt: z.string().trim().min(1, "업로드 날짜를 입력해주세요."),
  views: z.coerce.number().int().min(0).default(0),
  tags: z.array(z.string().trim().min(1)).default([]),
});

export function listVideos(_req: Request, res: Response) {
  ok(res, listAdminVideos());
}

export function createVideoHandler(req: Request, res: Response) {
  const parsed = episodeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());
  }

  const created = createVideo(parsed.data as Parameters<typeof createVideo>[0]);
  ok(res, created, 201);
}

export function updateVideoHandler(req: Request, res: Response) {
  const parsed = episodeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());
  }

  const updated = updateVideo(req.params.id, parsed.data as Parameters<typeof updateVideo>[1]);
  if (!updated) throw new NotFoundError(`영상을 찾을 수 없습니다: ${req.params.id}`);
  ok(res, updated);
}

export function deleteVideoHandler(req: Request, res: Response) {
  const deleted = deleteVideo(req.params.id);
  if (!deleted) throw new NotFoundError(`영상을 찾을 수 없습니다: ${req.params.id}`);
  ok(res, { deleted: true });
}
