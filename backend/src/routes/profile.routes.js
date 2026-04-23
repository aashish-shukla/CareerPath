import { Router } from "express";
import Joi from "joi";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { getMyProfile, upsertMyProfile } from "../controllers/profile.controller.js";

export const profileRoutes = Router();

profileRoutes.get("/me", requireAuth, getMyProfile);

profileRoutes.put(
  "/me",
  requireAuth,
  validate(
    Joi.object({
      fullName: Joi.string().allow("").max(200).optional(),
      currentRole: Joi.string().allow("").max(200).optional(),
      targetRole: Joi.string().allow("").max(200).optional(),
      education: Joi.object({
        level: Joi.string().allow("").max(120),
        field: Joi.string().allow("").max(120),
        institution: Joi.string().allow("").max(160),
        graduationYear: Joi.number().integer().min(1950).max(2100),
      }).optional(),
      experience: Joi.object({
        years: Joi.number().min(0).max(60),
        summary: Joi.string().allow("").max(600),
      }).optional(),
      skills: Joi.array().items(Joi.string().min(1).max(80)).max(100).optional(),
    })
  ),
  upsertMyProfile
);

