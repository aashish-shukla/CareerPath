from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from ..data.mock_data import CAREERS, SKILL_ALIASES


def _norm(skill: str) -> str:
    key = skill.strip().lower()
    return SKILL_ALIASES.get(key, skill.strip())


def _jaccard(a: set[str], b: set[str]) -> float:
    if not a and not b:
        return 0.0
    inter = len(a.intersection(b))
    union = len(a.union(b))
    return inter / union if union else 0.0


def recommend_careers(payload: Any) -> dict:
    raw_skills = payload.skills or []
    skills = {_norm(s) for s in raw_skills if s and s.strip()}

    scored = []
    for c in CAREERS:
        req = set(c["top_skills"])
        overlap = _jaccard(skills, req)
        # Add tiny bias for "resume_text" presence and experience years.
        exp_years = float((payload.experience or {}).get("years") or 0)
        resume_bonus = 0.02 if (payload.resume_text or "").strip() else 0.0
        exp_bonus = min(0.06, exp_years * 0.02)
        confidence = min(0.98, max(0.05, overlap + resume_bonus + exp_bonus))
        scored.append((confidence, c))

    scored.sort(key=lambda t: t[0], reverse=True)
    top_conf, top = scored[0]
    match_score = round(top_conf * 100, 2)

    return {
        "career_match_score": match_score,
        "top": {"career_id": top["id"], "career_title": top["title"]},
        "recommendations": [
            {"career_id": c["id"], "career_title": c["title"], "confidence": float(conf)}
            for conf, c in scored
        ],
    }

