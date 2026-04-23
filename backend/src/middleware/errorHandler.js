import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

export function errorHandler(err, _req, res, _next) {
  const isHttp = err instanceof HttpError;
  const status = isHttp ? err.statusCode : 500;

  if (status >= 500) logger.error(err.message, { stack: err.stack });

  res.status(status).json({
    error: {
      message: isHttp ? err.message : "Internal Server Error",
      details: isHttp ? err.details : undefined,
      requestId: undefined,
      ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    },
  });
}

