import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { listJobs } from "../controllers/jobs.controller.js";

export const jobsRoutes = Router();

// GET /api/jobs?q=react+developer&page=1&remote_only=1
jobsRoutes.get("/", optionalAuth, listJobs);
