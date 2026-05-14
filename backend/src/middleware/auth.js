import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const COOKIE_NAME = "careerpath.token";

/**
 * Extract JWT token from cookie first, then fall back to Authorization header.
 * This enables both cookie-based (secure) and header-based (API/mobile) auth.
 */
function extractToken(req) {
  // 1. Try httpOnly cookie first (browser clients)
  if (req.cookies?.[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  // 2. Fall back to Authorization header (API clients, mobile)
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    return header.slice("Bearer ".length);
  }
  return null;
}

export function requireAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) return next(new HttpError(401, "Unauthorized"));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
    return next();
  } catch {
    return next(new HttpError(401, "Invalid token"));
  }
}

/**
 * Like requireAuth but does NOT reject unauthenticated requests.
 * Sets req.user if a valid token is present, otherwise req.user = null.
 */
export function optionalAuth(req, _res, next) {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    req.user = payload;
  } catch {
    req.user = null;
  }
  return next();
}
