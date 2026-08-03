import type { Request, Response } from "express";
import { getAllLogs, getLogById } from "../data/streamLogs.js";
import { ok, NotFoundError } from "../lib/response.js";

export function listLogs(_req: Request, res: Response) {
  ok(res, getAllLogs());
}

export function getLog(req: Request, res: Response) {
  const log = getLogById(req.params.id);
  if (!log) throw new NotFoundError(`스트림 로그를 찾을 수 없습니다: ${req.params.id}`);
  ok(res, log);
}
