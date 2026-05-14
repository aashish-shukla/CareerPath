import { Router } from "express";
import Joi from "joi";
import { validate } from "../middleware/validate.js";
import { login, me, register, logout } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

export const authRoutes = Router();

// Password must have: 8+ chars, 1 uppercase, 1 number, 1 special character
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/[A-Z]/, "uppercase letter")
  .pattern(/[0-9]/, "number")
  .pattern(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, "special character")
  .required()
  .messages({
    "string.pattern.name": "Password must contain at least one {#name}",
  });

authRoutes.post(
  "/register",
  authLimiter,
  validate(
    Joi.object({
      name: Joi.string().min(2).max(80).required(),
      email: Joi.string().email().required(),
      password: passwordSchema,
    })
  ),
  register
);

authRoutes.post(
  "/login",
  authLimiter,
  validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(128).required(),
    })
  ),
  login
);

authRoutes.get("/me", requireAuth, me);
authRoutes.post("/logout", logout);
