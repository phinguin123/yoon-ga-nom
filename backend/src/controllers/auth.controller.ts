import type { Request, Response } from "express";
import { z } from "zod";
import { isProduction } from "../config/env.js";
import { HttpError, ok } from "../lib/response.js";
import {
  ADMIN_COOKIE_MAX_AGE_MS,
  ADMIN_COOKIE_NAME,
  isAuthConfigured,
  signAdminToken,
  verifyAdminPassword,
} from "../services/auth.service.js";

const loginSchema = z.object({
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

function cookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: ADMIN_COOKIE_MAX_AGE_MS,
    path: "/",
  };
}

export async function login(req: Request, res: Response) {
  if (!isAuthConfigured()) {
    throw new HttpError(
      503,
      "관리자 인증이 설정되지 않았습니다. ADMIN_PASSWORD_HASH / JWT_SECRET을 backend/.env에 설정해주세요.",
    );
  }

  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "잘못된 요청입니다.", parsed.error.flatten());
  }

  const isValid = await verifyAdminPassword(parsed.data.password);
  if (!isValid) {
    throw new HttpError(401, "비밀번호가 올바르지 않습니다.");
  }

  const token = signAdminToken();
  res.cookie(ADMIN_COOKIE_NAME, token, cookieOptions());
  ok(res, { authenticated: true });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, { ...cookieOptions(), maxAge: undefined });
  ok(res, { authenticated: false });
}

/** requireAdmin already ran if this handler is reached, so the session is valid. */
export function me(_req: Request, res: Response) {
  ok(res, { authenticated: true });
}
