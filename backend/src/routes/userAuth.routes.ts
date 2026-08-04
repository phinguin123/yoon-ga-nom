import { Router } from "express";
import rateLimit from "express-rate-limit";
import { kakaoLogin, logout, me, refresh } from "../controllers/userAuth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const userAuthRouter = Router();

// Brute-force / abuse protection on the Kakao code-exchange endpoint —
// generous enough for real users retrying a flaky network, tight enough to
// make hammering Kakao's token endpoint through us infeasible.
const kakaoLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요." } },
});

userAuthRouter.post("/kakao", kakaoLoginLimiter, asyncHandler(kakaoLogin));
userAuthRouter.post("/refresh", refresh);
userAuthRouter.post("/logout", logout);
userAuthRouter.get("/me", requireAuth, me);
