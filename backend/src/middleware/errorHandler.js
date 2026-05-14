import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err, req, res, _next) {
  const isHttp = err instanceof HttpError;
  const status = isHttp ? err.statusCode : 500;

  if (status >= 500) logger.error({ err, requestId: req.id }, err.message);

  res.status(status).json({
    error: {
      message: isHttp ? err.message : "Internal Server Error",
      details: isHttp ? err.details : undefined,
      requestId: req.id,
      ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    },
  });
}
