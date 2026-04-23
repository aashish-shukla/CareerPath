from __future__ import annotations

from typing import Any, Literal

from ..data.mock_data import CAREERS, SKILL_ALIASES


def _norm(skill: str) -> str:
    key = skill.strip().lower()
    return SKILL_ALIASES.get(key, skill.strip())


def _difficulty_for(skill: str) -> Literal["Easy", "Medium", "Hard"]:
    hard = {"MLOps", "Model Serving", "Data Pipelines"}
    med = {"Statistics", "TypeScript", "ML Fundamentals"}
    if skill in hard:
        return "Hard"
    if skill in med:
        return "Medium"
    return "Easy"


def _priority_for(skill: str) -> Literal["High", "Medium", "Low"]:
    high = {"SQL", "React", "Python", "JavaScript"}
    med = {"Statistics", "TypeScript", "Data Visualization", "Node.js"}
    if skill in high:
        return "High"
    if skill in med:
        return "Medium"
    return "Low"


def _weeks_for(difficulty: str, priority: str) -> int:
    base = {"Easy": 2, "Medium": 4, "Hard": 6}[difficulty]
    bump = {"High": 2, "Medium": 1, "Low": 0}[priority]
    return base + bump


def compute_skill_gap(payload: Any) -> dict:
    skills = {_norm(s) for s in (payload.skills or []) if s and s.strip()}
    target_id = payload.target_career_id

    target = None
    if target_id:
        target = next((c for c in CAREERS if c["id"] == target_id), None)
    if target is None:
        target = CAREERS[0]

    required = set(target["top_skills"])
    missing = sorted(required.difference(skills))
    readiness = round((len(required.intersection(skills)) / max(1, len(required))) * 100, 2)

    enriched = []
    for s in missing:
        difficulty = _difficulty_for(s)
        priority = _priority_for(s)
        enriched.append(
            {
                "skill": s,
                "priority": priority,
                "difficulty": difficulty,
                "estimated_weeks": _weeks_for(difficulty, priority),
            }
        )

    # Sort by priority then difficulty for clean UX.
    pr_order = {"High": 0, "Medium": 1, "Low": 2}
    diff_order = {"Hard": 0, "Medium": 1, "Easy": 2}
    enriched.sort(key=lambda x: (pr_order[x["priority"]], diff_order[x["difficulty"]], x["skill"]))

    return {"readiness_score": readiness, "missing": enriched}

