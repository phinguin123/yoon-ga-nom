import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError, NotFoundError, ok } from "../lib/response.js";
import {
  createScheduleCategory,
  deleteScheduleCategory,
  listScheduleCategories,
  updateScheduleCategory,
} from "../data/scheduleCategories.js";
import {
  createScheduleEvent,
  deleteScheduleEvent,
  listScheduleEvents,
  updateScheduleEvent,
} from "../data/scheduleEvents.js";

/** node:sqlite surfaces UNIQUE violations as a plain Error whose message includes the SQLite constraint text. */
function isUniqueConstraintError(error: unknown, column: string): boolean {
  return error instanceof Error && /UNIQUE constraint failed/.test(error.message) && error.message.includes(column);
}

const categorySchema = z.object({
  name: z.string().trim().min(1, "카테고리 이름을 입력해주세요.").max(30, "카테고리 이름은 30자 이내로 입력해주세요."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "색상은 #RRGGBB 형식이어야 해요. (예: #327dff)"),
});

const isoDatetime = z.string().trim().min(1, "일시를 입력해주세요.");

const eventSchema = z
  .object({
    title: z.string().trim().min(1, "제목을 입력해주세요.").max(100, "제목은 100자 이내로 입력해주세요."),
    description: z.string().trim().max(2000, "설명은 2000자 이내로 입력해주세요.").optional().default(""),
    categoryId: z.coerce.number().int().positive().nullable().optional().default(null),
    start: isoDatetime,
    end: isoDatetime.nullable().optional().default(null),
    allDay: z.boolean().optional().default(false),
    isPinned: z.boolean().optional().default(false),
  })
  .refine((data) => !data.end || new Date(data.end).getTime() >= new Date(data.start).getTime(), {
    message: "종료 일시는 시작 일시보다 빠를 수 없어요.",
    path: ["end"],
  });

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function listCategoriesHandler(_req: Request, res: Response) {
  ok(res, listScheduleCategories());
}

export function createCategoryHandler(req: Request, res: Response) {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());

  try {
    ok(res, createScheduleCategory(parsed.data), 201);
  } catch (error) {
    if (isUniqueConstraintError(error, "name")) throw new HttpError(409, "이미 존재하는 카테고리예요.");
    throw error;
  }
}

export function updateCategoryHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());

  try {
    const updated = updateScheduleCategory(id, parsed.data);
    if (!updated) throw new NotFoundError(`카테고리를 찾을 수 없습니다: ${id}`);
    ok(res, updated);
  } catch (error) {
    if (isUniqueConstraintError(error, "name")) throw new HttpError(409, "이미 존재하는 카테고리예요.");
    throw error;
  }
}

export function deleteCategoryHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = deleteScheduleCategory(id);
  if (!deleted) throw new NotFoundError(`카테고리를 찾을 수 없습니다: ${id}`);
  ok(res, { deleted: true });
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export function listEventsHandler(_req: Request, res: Response) {
  ok(res, listScheduleEvents());
}

export function createEventHandler(req: Request, res: Response) {
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());
  ok(res, createScheduleEvent(parsed.data), 201);
}

export function updateEventHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const parsed = eventSchema.safeParse(req.body);
  if (!parsed.success) throw new HttpError(400, "입력값을 확인해주세요.", parsed.error.flatten());

  const updated = updateScheduleEvent(id, parsed.data);
  if (!updated) throw new NotFoundError(`이벤트를 찾을 수 없습니다: ${id}`);
  ok(res, updated);
}

export function deleteEventHandler(req: Request, res: Response) {
  const id = Number(req.params.id);
  const deleted = deleteScheduleEvent(id);
  if (!deleted) throw new NotFoundError(`이벤트를 찾을 수 없습니다: ${id}`);
  ok(res, { deleted: true });
}
