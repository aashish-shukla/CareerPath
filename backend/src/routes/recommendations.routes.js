import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { aiLimiter } from "../middleware/rateLimiter.js";
import { getMyRecommendations, resumeUpload, uploadResume } from "../controllers/recommendations.controller.js";

export const recommendationRoutes = Router();

recommendationRoutes.get("/me", requireAuth, aiLimiter, getMyRecommendations);
recommendationRoutes.post("/resume", requireAuth, aiLimiter, resumeUpload.single("resume"), uploadResume);
