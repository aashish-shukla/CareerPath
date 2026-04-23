import { HttpError } from "../utils/httpError.js";

export function validate(schema, source = "body") {
  return (req, _res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return next(
        new HttpError(400, "Validation error", {
          issues: error.details.map((d) => ({
            path: d.path.join("."),
            message: d.message,
          })),
        })
      );
    }
    req[source] = value;
    return next();
  };
}

