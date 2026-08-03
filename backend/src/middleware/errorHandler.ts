import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/response.js";
import type { ApiError } from "../types/index.js";
import { isProduction } from "../config/env.js";

export function notFoundHandler(req: Request, res: Response) {
  const body: ApiError = {
    success: false,
    error: { message: `요청한 경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}` },
  };
  res.status(404).json(body);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof HttpError ? err.status : 500;
  const message = err instanceof Error ? err.message : "서버 내부 오류가 발생했습니다.";

  if (!isProduction) {
    console.error(err);
  }

  const body: ApiError = {
    success: false,
    error: {
      message,
      details: err instanceof HttpError ? err.details : undefined,
    },
  };
  res.status(status).json(body);
}
