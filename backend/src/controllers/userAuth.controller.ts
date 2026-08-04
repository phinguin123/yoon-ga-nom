import type { Request, Response } from "express";
import { z } from "zod";
import { isProduction } from "../config/env.js";
import { HttpError, ok } from "../lib/response.js";
import { findOrCreateUserByKakaoProfile, findUserById } from "../data/users.js";
import { authenticateWithKakao, isKakaoConfigured } from "../services/kakao.service.js";
import {
  REFRESH_COOKIE_MAX_AGE_MS,
  REFRESH_COOKIE_NAME,
  isUserAuthConfigured,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../services/userAuth.service.js";
import type { User } from "../types/index.js";

const kakaoLoginSchema = z.object({
  code: z.string().min(1, "인가 코드(authorization_code)가 필요합니다."),
  // Must match whatever the frontend passed to Kakao's /authorize step —
  // only required if it differs from KAKAO_REDIRECT_URI in .env.
  redirectUri: z.string().url().optional(),
});

function refreshCookieOptions() {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: "/",
  };
}

/** Never leak Kakao's id or other internal fields to the client beyond what the frontend needs. */
function toPublicUser(user: User) {
  return {
    id: user.id,
    nickname: user.nickname,
    profileImage: user.profileImage,
    role: user.role,
  };
}

function issueSession(res: Response, user: User) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  ok(res, { accessToken, user: toPublicUser(user) });
}

/** POST /api/auth/kakao — exchange a Kakao authorization_code for our own session. */
export async function kakaoLogin(req: Request, res: Response) {
  if (!isUserAuthConfigured() || !isKakaoConfigured()) {
    throw new HttpError(
      503,
      "카카오 로그인이 설정되지 않았습니다. KAKAO_CLIENT_ID / JWT_ACCESS_SECRET / JWT_REFRESH_SECRET을 backend/.env에 설정해주세요.",
    );
  }

  const parsed = kakaoLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new HttpError(400, "잘못된 요청입니다.", parsed.error.flatten());
  }

  const kakaoProfile = await authenticateWithKakao(parsed.data.code, parsed.data.redirectUri);
  const user = findOrCreateUserByKakaoProfile(kakaoProfile);

  issueSession(res, user);
}

/** POST /api/auth/refresh — trade a valid HttpOnly refresh cookie for a fresh access token. */
export function refresh(req: Request, res: Response) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  if (typeof token !== "string") {
    throw new HttpError(401, "로그인이 필요합니다.");
  }

  let payload: { sub: number };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new HttpError(401, "로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  const user = findUserById(payload.sub);
  if (!user) {
    throw new HttpError(401, "사용자를 찾을 수 없습니다.");
  }

  // Re-issuing the refresh cookie too (rotation) limits how long a stolen
  // cookie stays valid, since each refresh resets its own TTL.
  issueSession(res, user);
}

/** POST /api/auth/logout — clear the refresh cookie. The access token simply expires client-side. */
export function logout(_req: Request, res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { ...refreshCookieOptions(), maxAge: undefined });
  ok(res, { loggedOut: true });
}

/** GET /api/auth/me — requireAuth already ran, so req.user is a verified access-token payload. */
export function me(req: Request, res: Response) {
  const user = findUserById(req.user!.sub);
  if (!user) {
    throw new HttpError(401, "사용자를 찾을 수 없습니다.");
  }
  ok(res, { user: toPublicUser(user) });
}
