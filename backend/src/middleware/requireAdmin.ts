import type { NextFunction, Request, Response } from "express";
import { ADMIN_COOKIE_NAME, verifyAdminToken } from "../services/auth.service.js";
import { HttpError } from "../lib/response.js";

/** Guards every /api/admin/* route except the login endpoint itself. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[ADMIN_COOKIE_NAME];

  if (typeof token !== "string" || !verifyAdminToken(token)) {
    throw new HttpError(401, "인증이 필요합니다. 다시 로그인해주세요.");
  }

  next();
}
