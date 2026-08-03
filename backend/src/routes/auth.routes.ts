import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me } from "../controllers/auth.controller.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const authRouter = Router();

// Brute-force protection: 10 attempts per 15 minutes per IP. Generous enough
// for a human mistyping a password, tight enough to make guessing infeasible.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: "시도 횟수가 너무 많습니다. 잠시 후 다시 시도해주세요." } },
});

authRouter.post("/login", loginLimiter, asyncHandler(login));
authRouter.post("/logout", logout);
authRouter.get("/me", requireAdmin, me);
