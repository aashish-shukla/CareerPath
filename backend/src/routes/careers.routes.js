import { Router } from "express";
import { getCareer, listCareers } from "../controllers/careers.controller.js";

export const careerRoutes = Router();

careerRoutes.get("/", listCareers);
careerRoutes.get("/:careerId", getCareer);

