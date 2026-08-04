import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/response.js";
import { verifyAccessToken, type AccessTokenPayload } from "../services/userAuth.service.js";

declare global {
  namespace Express {
    interface Request {
      /** Set by requireAuth after verifying the `Authorization: Bearer <accessToken>` header. */
      user?: AccessTokenPayload;
    }
  }
}

/**
 * Guards routes that require a logged-in fan (e.g. liking a drip, posting a
 * comment). Reads the custom access JWT from the `Authorization: Bearer`
 * header — never the refresh cookie — and attaches its payload to `req.user`.
 */
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : undefined;

  if (!token) {
    throw new HttpError(401, "로그인이 필요합니다.");
  }

  try {
    req.user = verifyAccessToken(token);
  } catch {
    throw new HttpError(401, "로그인이 만료되었습니다. 다시 로그인해주세요.");
  }

  next();
}
