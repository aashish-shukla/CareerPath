import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase, disconnectDatabase } from "./config/db.js";
import { ensureDevDemoUser } from "./seed/devSeed.js";
import { logger } from "./utils/logger.js";

async function main() {
  await connectToDatabase();
  if (env.NODE_ENV !== "production") {
    await ensureDevDemoUser();
  }
  const app = createApp();
  const server = http.createServer(app);
  
  // Production: 60s timeout (prevents slowloris). Dev: 5min for Ollama inference.
  server.timeout = env.NODE_ENV === "production" ? 60_000 : 300_000;
  server.keepAliveTimeout = 65_000; // Slightly above ALB/nginx default of 60s

  server.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  // ── Graceful Shutdown ──────────────────────────────
  let isShuttingDown = false;

  async function shutdown(signal) {
    if (isShuttingDown) return;
    isShuttingDown = true;
    logger.info(`${signal} received — starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.info("HTTP server closed — draining complete");
      try {
        await disconnectDatabase();
        logger.info("MongoDB disconnected");
      } catch (err) {
        logger.error({ err }, "Error disconnecting MongoDB");
      }
      process.exit(0);
    });

    // Force exit after 10s if connections don't drain
    setTimeout(() => {
      logger.warn("Forcibly shutting down after 10s grace period");
      process.exit(1);
    }, 10_000).unref();
  }

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
