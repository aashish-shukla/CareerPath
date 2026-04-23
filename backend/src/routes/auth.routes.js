import { Router } from "express";
import Joi from "joi";
import { validate } from "../middleware/validate.js";
import { login, me, register } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post(
  "/register",
  validate(
    Joi.object({
      name: Joi.string().min(2).max(80).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(200).required(),
    })
  ),
  register
);

authRoutes.post(
  "/login",
  validate(
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(200).required(),
    })
  ),
  login
);

authRoutes.get("/me", requireAuth, me);

