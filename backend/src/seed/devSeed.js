import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { logger } from "../utils/logger.js";

export async function ensureDevDemoUser() {
  const email = "demo@careerpath.dev";
  const password = "Password123!";
  const name = "Demo User";

  const existing = await User.findOne({ email });
  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email, name, passwordHash });
  logger.info("Seeded dev demo user", { email });
}

