// ML service is disabled; Gemini handles AI logic for now.
import axios from "axios";
import { env } from "../config/env.js";

const client = axios.create({
  baseURL: env.ML_BASE_URL,
  timeout: 10_000,
});

export async function mlParseResume({ text }) {
  const { data } = await client.post("/parse-resume", { text });
  return data;
}

export async function mlRecommendCareer(payload) {
  const { data } = await client.post("/recommend-career", payload);
  return data;
}

export async function mlSkillGap(payload) {
  const { data } = await client.post("/skill-gap", payload);
  return data;
}

export async function mlMarketInsights() {
  const { data } = await client.get("/market-insights");
  return data;
}

