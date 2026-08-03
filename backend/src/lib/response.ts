import type { Response } from "express";
import type { ApiSuccess } from "../types/index.js";

export function ok<T>(res: Response, data: T, status = 200) {
  const body: ApiSuccess<T> = { success: true, data };
  return res.status(status).json(body);
}

export class HttpError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export class NotFoundError extends HttpError {
  constructor(message = "리소스를 찾을 수 없습니다.") {
    super(404, message);
  }
}
