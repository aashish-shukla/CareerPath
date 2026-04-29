import dotenv from "dotenv";

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const env = Object.freeze({
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 8000),
  MONGODB_URI: requireEnv("MONGODB_URI"),
  JWT_SECRET: requireEnv("JWT_SECRET"),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "7d",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
  // ML_BASE_URL is unused while AI replaces the ML service.
  ML_BASE_URL: process.env.ML_BASE_URL ?? "http://localhost:8001",
  
  // Ollama Configuration (local AI fallback)
  OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434",
  OLLAMA_MODEL: process.env.OLLAMA_MODEL ?? "qwen2.5-coder:7b",

  // Google Gemini API (primary AI provider when configured)
  GEMINI_API_KEY: process.env.GEMINI_API_KEY ?? "",
  GEMINI_MODEL: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",

  // JSearch API for live job listings (free tier: 200 req/month)
  JSEARCH_API_KEY: process.env.JSEARCH_API_KEY ?? "",
});
