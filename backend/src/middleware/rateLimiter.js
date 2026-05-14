import rateLimit from "express-rate-limit";

/**
 * Auth endpoints: 10 req/min per IP (brute force protection)
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Too many auth attempts. Please try again in a minute." } },
});

/**
 * AI-heavy endpoints: 15 req/min per IP (resume upload, recommendations, chat)
 */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Too many AI requests. Please slow down." } },
});

/**
 * Strict limiter for sensitive operations: 5 req/min per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: { message: "Rate limit exceeded. Please wait." } },
});
