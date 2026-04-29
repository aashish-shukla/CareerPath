import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { authRoutes } from "./routes/auth.routes.js";
import { profileRoutes } from "./routes/profile.routes.js";
import { careerRoutes } from "./routes/careers.routes.js";
import { recommendationRoutes } from "./routes/recommendations.routes.js";
import { marketInsightsRoutes } from "./routes/marketInsights.routes.js";
import { skillsRoutes } from "./routes/skills.routes.js";
import { resourcesRoutes } from "./routes/resources.routes.js";
import { chatRoutes } from "./routes/chat.routes.js";
import { jobsRoutes } from "./routes/jobs.routes.js";
import { peerStatsRoutes } from "./routes/peerStats.routes.js";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 180,
      standardHeaders: "draft-7",
      legacyHeaders: false,
    })
  );

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/skills", skillsRoutes);
  app.use("/api/careers", careerRoutes);
  app.use("/api/recommendations", recommendationRoutes);
  app.use("/api/market-insights", marketInsightsRoutes);
  app.use("/api/resources", resourcesRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/jobs", jobsRoutes);
  app.use("/api/peer-stats", peerStatsRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

