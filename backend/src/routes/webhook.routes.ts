import { Router } from "express";
import express from "express";
import { kakaoWebhookHandler } from "../controllers/webhook.controller.js";
import { asyncHandler } from "../lib/asyncHandler.js";

export const webhookRouter = Router();

// Account-status webhooks arrive as a raw SET JWT (`application/secevent+jwt`).
// Unlink webhooks use `application/x-www-form-urlencoded` (handled globally).
webhookRouter.post(
  "/kakao",
  express.text({ type: ["application/secevent+jwt"] }),
  asyncHandler(kakaoWebhookHandler),
);
