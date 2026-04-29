# ML Service Module Pseudocode (Detailed)

## File: ml-service/app/services/resume_parser.py

### Module Setup

1. Import regex library for token extraction and cleanup.
2. Import `SKILL_ALIASES` mapping from mock data.
3. Define canonical `_SKILL_CANDIDATES` list used for skill detection.

### Function: _normalize_skill(token)

1. Receive raw token extracted from resume text.
2. Create lookup key:
   - Trim leading/trailing spaces.
   - Convert to lowercase.
   - Remove unsupported characters with regex (keep letters, digits, dot, plus, hash).
3. Check if normalized key exists in `SKILL_ALIASES`.
4. If alias exists, return mapped canonical skill name.
5. If alias does not exist, return original trimmed token unchanged.

### Function: parse_resume_text(text)

1. Receive full resume text input.
2. Build lowercase copy (`lower`) for case-insensitive substring detection.
3. Initialize empty `found` set to store unique detected skills.
4. Candidate phrase scan:
   - Iterate through each value in `_SKILL_CANDIDATES`.
   - Convert candidate to lowercase and check if present in `lower`.
   - If present, add canonical candidate skill to `found`.
5. Token-level alias scan:
   - Use regex to extract short word-like tokens (length constraint applied).
   - For each token:
     - Normalize with `_normalize_skill`.
     - If normalized output is part of `_SKILL_CANDIDATES`, add to `found`.
6. Build response payload:
   - `extracted_text`: keep at most first 50,000 characters (prevents oversized payload).
   - `skills`: convert set to sorted list for deterministic output order.
7. Return dictionary with extracted text and structured skills.

## File: ml-service/app/services/skill_gap.py

### Module Setup

1. Import typing helpers (`Any`, `Literal`) for type clarity.
2. Import career catalog (`CAREERS`) and alias map (`SKILL_ALIASES`).

### Function: _norm(skill)

1. Receive raw skill text.
2. Trim whitespace and lowercase for lookup key.
3. If alias exists in `SKILL_ALIASES`, return canonical skill.
4. Otherwise return original trimmed skill.

### Function: _difficulty_for(skill)

1. Define hard-skill set (`MLOps`, `Model Serving`, `Data Pipelines`).
2. Define medium-skill set (`Statistics`, `TypeScript`, `ML Fundamentals`).
3. If skill is in hard set, return `Hard`.
4. Else if skill is in medium set, return `Medium`.
5. Else return default `Easy`.

### Function: _priority_for(skill)

1. Define high-priority skills (`SQL`, `React`, `Python`, `JavaScript`).
2. Define medium-priority skills (`Statistics`, `TypeScript`, `Data Visualization`, `Node.js`).
3. If skill belongs to high set, return `High`.
4. Else if skill belongs to medium set, return `Medium`.
5. Else return `Low`.

### Function: _weeks_for(difficulty, priority)

1. Convert difficulty label into base effort weeks:
   - `Easy` -> 2
   - `Medium` -> 4
   - `Hard` -> 6
2. Convert priority label into urgency bump:
   - `High` -> +2
   - `Medium` -> +1
   - `Low` -> +0
3. Return `base + bump` as estimated learning duration.

### Function: compute_skill_gap(payload)

1. Read user skills from payload:
   - Ignore null/empty strings.
   - Normalize each valid value via `_norm`.
   - Store in a set for uniqueness and fast membership lookup.
2. Read `target_career_id` from payload.
3. Resolve target career object:
   - If `target_career_id` exists, search `CAREERS` for matching `id`.
   - If match not found, fallback to first career in list.
4. Extract required skills from selected career (`top_skills`) as a set.
5. Compute missing skills:
   - `missing = required - user_skills`.
   - Convert to sorted list for deterministic processing order.
6. Compute readiness score:
   - `matched = required intersection user_skills`.
   - `score = (len(matched) / max(1, len(required))) * 100`.
   - Round to 2 decimal places.
7. Build enriched missing-skill items:
   - For each missing skill:
     - Calculate `difficulty` via `_difficulty_for`.
     - Calculate `priority` via `_priority_for`.
     - Calculate `estimated_weeks` via `_weeks_for`.
     - Create structured object with all above fields.
8. Sort enriched list for better UX order:
   - Primary sort: priority (`High`, then `Medium`, then `Low`).
   - Secondary sort: difficulty (`Hard`, then `Medium`, then `Easy`).
   - Tertiary sort: alphabetical by skill name.
9. Return final result object:
   - `readiness_score`: numeric percentage.
   - `missing`: sorted enriched missing-skill array.
