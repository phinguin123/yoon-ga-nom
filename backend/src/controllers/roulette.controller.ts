import type { Request, Response } from "express";
import { getAllPresets, getPresetById } from "../data/roulettePresets.js";
import { ok, NotFoundError } from "../lib/response.js";

export function listPresets(_req: Request, res: Response) {
  ok(res, getAllPresets());
}

export function getPreset(req: Request, res: Response) {
  const preset = getPresetById(req.params.id);
  if (!preset) throw new NotFoundError(`프리셋을 찾을 수 없습니다: ${req.params.id}`);
  ok(res, preset);
}
