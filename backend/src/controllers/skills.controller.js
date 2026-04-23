import { careers } from "../data/mock/careers.js";

export async function listSkills(_req, res) {
  const set = new Set();
  for (const c of careers) for (const s of c.topSkills) set.add(s);
  res.json({ skills: Array.from(set).sort() });
}

