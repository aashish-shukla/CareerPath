import { Router } from "express";
import Joi from "joi";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { 
  chatWithCareerCopilot, 
  getChatHistory, 
  clearChatHistory 
} from "../controllers/chat.controller.js";

export const chatRoutes = Router();

chatRoutes.get("/", requireAuth, getChatHistory);
chatRoutes.delete("/", requireAuth, clearChatHistory);

chatRoutes.post(
  "/",
  requireAuth,
  validate(
    Joi.object({
      message: Joi.string().min(1).max(2000).required(),
      context: Joi.object().optional(),
    })
  ),
  chatWithCareerCopilot
);

