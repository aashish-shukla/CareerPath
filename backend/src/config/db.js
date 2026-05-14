import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 3000;

export async function connectToDatabase() {
  mongoose.set("strictQuery", true);

  // Connection event monitoring
  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected");
  });
  mongoose.connection.on("error", (err) => {
    logger.error({ err }, "MongoDB connection error");
  });
  mongoose.connection.on("reconnected", () => {
    logger.info("MongoDB reconnected");
  });

  // Retry loop with exponential backoff
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10_000,
        heartbeatFrequencyMS: 30_000,
      });
      logger.info("MongoDB connected");
      return;
    } catch (err) {
      logger.error(
        { attempt, maxRetries: MAX_RETRIES, error: err.message },
        `MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed`
      );
      if (attempt === MAX_RETRIES) {
        throw new Error(`MongoDB connection failed after ${MAX_RETRIES} attempts: ${err.message}`);
      }
      const delay = RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      logger.info(`Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}
