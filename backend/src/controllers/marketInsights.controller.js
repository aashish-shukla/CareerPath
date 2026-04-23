import { marketInsights } from "../data/mock/marketInsights.js";

export async function getMarketInsights(_req, res, next) {
  try {
    // ML service is disabled for now; using local mock.
    res.json({ marketInsights });
  } catch (err) {
    next(err);
  }
}

