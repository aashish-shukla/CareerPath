import { Router } from "express";
import { listSkills } from "../controllers/skills.controller.js";

export const skillsRoutes = Router();

skillsRoutes.get("/", listSkills);

