import http from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectToDatabase } from "./config/db.js";
import { ensureDevDemoUser } from "./seed/devSeed.js";
import { logger } from "./utils/logger.js";

async function main() {
  await connectToDatabase();
  if (env.NODE_ENV !== "production") {
    await ensureDevDemoUser();
  }
  const app = createApp();
  const server = http.createServer(app);
  
  // Set server timeout to 5 minutes to accommodate slow local AI inference
  server.timeout = 300000;

  server.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

