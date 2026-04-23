import { HttpError } from "../utils/httpError.js";

export function notFoundHandler(_req, _res, next) {
  next(new HttpError(404, "Route not found"));
}

