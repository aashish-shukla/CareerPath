import { Router } from "express";
import { getMarketInsights } from "../controllers/marketInsights.controller.js";

export const marketInsightsRoutes = Router();

marketInsightsRoutes.get("/", getMarketInsights);

