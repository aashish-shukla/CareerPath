import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import { listResources } from "../controllers/resources.controller.js";

export const resourcesRoutes = Router();

resourcesRoutes.get("/", optionalAuth, listResources);
