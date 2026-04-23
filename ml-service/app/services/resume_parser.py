import re

from ..data.mock_data import SKILL_ALIASES


_SKILL_CANDIDATES = [
    "Python",
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "MongoDB",
    "SQL",
    "Excel",
    "Statistics",
    "Data Visualization",
    "ML Fundamentals",
    "MLOps",
    "Data Pipelines",
    "Model Serving",
    "Accessibility",
]


def _normalize_skill(token: str) -> str:
    key = token.strip().lower()
    key = re.sub(r"[^a-z0-9\.\+#]+", "", key)
    return SKILL_ALIASES.get(key, token.strip())


def parse_resume_text(text: str) -> dict:
    # Mock NLP: detect known skills from text; normalize aliases.
    lower = text.lower()
    found: set[str] = set()

    for s in _SKILL_CANDIDATES:
        if s.lower() in lower:
            found.add(s)

    # Alias-based capture for short tokens like "js", "ts".
    for raw in re.findall(r"\b[a-zA-Z][a-zA-Z0-9\.\+#]{1,14}\b", text):
        norm = _normalize_skill(raw)
        if norm in _SKILL_CANDIDATES:
            found.add(norm)

    return {"extracted_text": text[:50_000], "skills": sorted(found)}

