import { careers } from "../data/mock/careers.js";

export async function listCareers(_req, res) {
  res.json({ careers });
}

export async function getCareer(req, res) {
  const career = careers.find((c) => c.id === req.params.careerId);
  if (!career) return res.status(404).json({ error: { message: "Career not found" } });
  return res.json({ career });
}

