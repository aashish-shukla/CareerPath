import crypto from "node:crypto";

/**
 * Generates a unique request ID for every incoming request.
 * Attaches it to `req.id` and sets `X-Request-Id` response header.
 * Useful for log correlation and debugging in production.
 */
export function requestId(req, res, next) {
  const id = req.headers["x-request-id"] || crypto.randomUUID();
  req.id = id;
  res.setHeader("X-Request-Id", id);
  next();
}
