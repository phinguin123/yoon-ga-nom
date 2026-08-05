import type { Request, Response } from "express";
import { z } from "zod";
import { env } from "../config/env.js";
import { normalizeChzzkVideoNo } from "../lib/chzzkVideoId.js";
import { HttpError, NotFoundError, ok } from "../lib/response.js";
import { fetchChzzkChannelVideos, fetchChzzkVideo } from "../services/chzzk.service.js";
import {
  createVodCategory,
  deleteVodCategory,
  listVodCategories,
  updateVodCategory,
} from "../data/vodCategories.js";
import { ChzzkFetchError, createVod, deleteVod, listVods, refreshVod, updateVod } from "../data/vods.js";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "카테고리 이름을 입력해주세요.")
    .max(40, "카테고리 이름은 40자 이내로 입력해주세요."),
});

const vodSchema = z.object({
  chzzkVideoId: z.string().trim().min(1, "치지직 영상 ID 또는 URL을 입력해주세요."),
  categoryId: z.coerce.number().int().positive().nullable().optional(),
});

/** node:sqlite surfaces UNIQUE violations as a plain Error whose message includes the SQLite constraint text. */
function isUniqueConstraintError(error: unknown, column: string): boolean {
  return error instanceof Error && /UNIQUE constraint failed/.test(error.message) && error.message.includes(column);
}

function parseVodBody(body: unknown): { chzzkVideoNo: number; categoryId: number | null } {
  const parsed = vodSchema.safeParse(body);
  if (!parsed.success) {
    throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());
  }

  const chzzkVideoNo = normalizeChzzkVideoNo(parsed.data.chzzkVideoId);
  if (chzzkVideoNo === null) {
    throw new HttpError(400, "올바른 치지직 영상 ID 또는 URL이 아니에요. (예: 14487229)");
  }

  return { chzzkVideoNo, categoryId: parsed.data.categoryId ?? null };
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function listCategoriesHandler(_req: Request, res: Response) {
  ok(res, listVodCategories());
}

export function createCategoryHandler(req: Request, res: Response) {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());

  try {
    ok(res, createVodCategory(parsed.data.name), 201);
  } catch (error) {
    if (isUniqueConstraintError(error, "name")) {
      throw new HttpError(409, "이미 존재하는 카테고리예요.");
    }
    throw error;
  }
}

export function updateCategoryHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());

  try {
    const updated = updateVodCategory(id, parsed.data.name);
    if (!updated) throw new NotFoundError(`카테고리를 찾을 수 없습니다: ${id}`);
    ok(res, updated);
  } catch (error) {
    if (isUniqueConstraintError(error, "name")) {
      throw new HttpError(409, "이미 존재하는 카테고리예요.");
    }
    throw error;
  }
}

export function deleteCategoryHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = deleteVodCategory(id);
  if (!deleted) throw new NotFoundError(`카테고리를 찾을 수 없습니다: ${id}`);
  ok(res, { deleted: true });
}

// ---------------------------------------------------------------------------
// VODs
// ---------------------------------------------------------------------------

export function listVodsHandler(_req: Request, res: Response) {
  ok(res, listVods());
}

export async function createVodHandler(req: Request, res: Response) {
  const input = parseVodBody(req.body);

  try {
    ok(res, await createVod(input), 201);
  } catch (error) {
    if (error instanceof ChzzkFetchError) {
      throw new HttpError(400, "치지직에서 영상 정보를 가져올 수 없어요. 영상 ID를 다시 확인해주세요.");
    }
    if (isUniqueConstraintError(error, "chzzk_video_no")) {
      throw new HttpError(409, "이미 등록된 영상이에요.");
    }
    throw error;
  }
}

export async function updateVodHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const input = parseVodBody(req.body);

  try {
    const updated = await updateVod(id, input);
    if (!updated) throw new NotFoundError(`영상을 찾을 수 없습니다: ${id}`);
    ok(res, updated);
  } catch (error) {
    if (error instanceof ChzzkFetchError) {
      throw new HttpError(400, "치지직에서 영상 정보를 가져올 수 없어요. 영상 ID를 다시 확인해주세요.");
    }
    if (isUniqueConstraintError(error, "chzzk_video_no")) {
      throw new HttpError(409, "이미 등록된 영상이에요.");
    }
    throw error;
  }
}

export async function refreshVodHandler(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    const updated = await refreshVod(id);
    if (!updated) throw new NotFoundError(`영상을 찾을 수 없습니다: ${id}`);
    ok(res, updated);
  } catch (error) {
    if (error instanceof ChzzkFetchError) {
      throw new HttpError(502, "치지직에서 최신 정보를 가져오지 못했어요. 잠시 후 다시 시도해주세요.");
    }
    throw error;
  }
}

export function deleteVodHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = deleteVod(id);
  if (!deleted) throw new NotFoundError(`영상을 찾을 수 없습니다: ${id}`);
  ok(res, { deleted: true });
}

// ---------------------------------------------------------------------------
// CHZZK lookups — thin proxies over the undocumented public API, used by the
// admin form's live preview and the "치지직 채널에서 찾기" browser.
// ---------------------------------------------------------------------------

export async function lookupChzzkVideoHandler(req: Request, res: Response) {
  const query = req.query.query;
  if (typeof query !== "string" || query.trim().length === 0) {
    throw new HttpError(400, "치지직 영상 ID 또는 URL을 입력해주세요.");
  }

  const videoNo = normalizeChzzkVideoNo(query);
  if (videoNo === null) {
    throw new HttpError(400, "올바른 치지직 영상 ID 또는 URL이 아니에요. (예: 14487229)");
  }

  const meta = await fetchChzzkVideo(videoNo);
  if (!meta) throw new NotFoundError("치지직에서 해당 영상을 찾을 수 없어요.");

  ok(res, { videoNo, ...meta });
}

const channelVideosQuerySchema = z.object({
  page: z.coerce.number().int().min(0).default(0),
  size: z.coerce.number().int().min(1).max(50).default(12),
});

export async function listChannelVideosHandler(req: Request, res: Response) {
  const parsed = channelVideosQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new HttpError(400, "잘못된 요청이에요.", parsed.error.flatten());

  try {
    ok(res, await fetchChzzkChannelVideos(env.chzzkChannelId, parsed.data));
  } catch (error) {
    console.error("[admin/vods] Failed to list CHZZK channel videos:", error);
    throw new HttpError(502, "치지직에서 영상 목록을 가져오지 못했어요. 잠시 후 다시 시도해주세요.");
  }
}
