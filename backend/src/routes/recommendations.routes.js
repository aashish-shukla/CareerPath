import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMyRecommendations, resumeUpload, uploadResume } from "../controllers/recommendations.controller.js";

export const recommendationRoutes = Router();

recommendationRoutes.get("/me", requireAuth, getMyRecommendations);
recommendationRoutes.post("/resume", requireAuth, resumeUpload.single("resume"), uploadResume);

