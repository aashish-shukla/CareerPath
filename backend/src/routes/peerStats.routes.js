import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getPeerComparison } from "../controllers/peerStats.controller.js";

export const peerStatsRoutes = Router();

// GET /api/peer-stats
peerStatsRoutes.get("/", requireAuth, getPeerComparison);
