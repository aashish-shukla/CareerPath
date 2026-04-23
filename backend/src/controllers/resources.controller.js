import { resources as allStaticResources, getResourcesForRole } from "../data/mock/resources.js";
import { Profile } from "../models/Profile.js";
import { logger } from "../utils/logger.js";
import {
  isGeminiAvailable,
  geminiApiRecommendResources,
} from "../services/geminiApiClient.js";
import {
  geminiRecommendResources,
} from "../services/geminiClient.js";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Smart fallback: match role-based static resources to user's skill gaps.
 * Returns resources annotated with priority based on skill gaps.
 */
function buildFallbackResources(targetRole, missingSkills, userSkills) {
  const roleResources = getResourcesForRole(targetRole);
  const missingSet = new Set((missingSkills ?? []).map((s) => s.toLowerCase()));
  const userSkillSet = new Set((userSkills ?? []).map((s) => s.toLowerCase()));

  const scored = roleResources.map((r) => {
    const skillLower = r.skill.toLowerCase();
    let priority = "Low";
    let reason = `Recommended for ${targetRole || "your career path"}`;

    if (missingSet.has(skillLower)) {
      priority = "High";
      reason = `Addresses your skill gap in ${r.skill} — critical for ${targetRole || "your target role"}`;
    } else if (!userSkillSet.has(skillLower)) {
      priority = "Medium";
      reason = `Builds ${r.skill} expertise needed for ${targetRole || "your career"}`;
    } else {
      reason = `Deepens your existing ${r.skill} knowledge`;
    }

    return { ...r, priority, reason };
  });

  // Sort: High priority first
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  scored.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return scored;
}

/**
 * Merge AI-generated resources with curated role-based resources.
 * Deduplicates by skill+level to avoid showing two resources for the same thing.
 */
function mergeResources(aiResources, curatedResources) {
  const seen = new Set();
  const merged = [];

  // AI resources take priority
  for (const r of aiResources) {
    const key = `${r.skill.toLowerCase()}::${r.level}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ ...r, source: "ai" });
    }
  }

  // Append curated resources that don't overlap
  for (const r of curatedResources) {
    const key = `${r.skill.toLowerCase()}::${r.level}`;
    if (!seen.has(key)) {
      seen.add(key);
      merged.push({ ...r, source: "curated" });
    }
  }

  return merged;
}

function getExperienceLevel(years) {
  if (!years || years < 1) return "Beginner";
  if (years < 4) return "Intermediate";
  return "Advanced";
}

function applyFilters(resources, query, levelFilter) {
  return resources.filter((r) => {
    const matchesQuery =
      !query ||
      r.skill.toLowerCase().includes(query) ||
      r.title.toLowerCase().includes(query) ||
      (r.description ?? "").toLowerCase().includes(query);
    const matchesLevel = levelFilter === "All" || r.level === levelFilter;
    return matchesQuery && matchesLevel;
  });
}

export async function listResources(req, res) {
  const { q, level, refresh } = req.query;
  const query = (q ?? "").toString().trim().toLowerCase();
  const levelFilter = (level ?? "All").toString();
  const forceRefresh = refresh === "1" || refresh === "true";

  // ─── ANONYMOUS USER: return all static resources ───
  if (!req.user) {
    const filtered = applyFilters(
      allStaticResources.map((r) => ({ ...r, priority: "Medium", reason: "" })),
      query,
      levelFilter
    );
    return res.json({ resources: filtered, personalized: false });
  }

  // ─── AUTHENTICATED USER: personalized resources ───
  try {
    const profile = await Profile.findOne({ userId: req.user.sub });

    if (!profile || !profile.skills?.length) {
      const filtered = applyFilters(
        allStaticResources.map((r) => ({ ...r, priority: "Medium", reason: "" })),
        query,
        levelFilter
      );
      return res.json({
        resources: filtered,
        personalized: false,
        hint: "Complete your profile to get personalized resource recommendations.",
      });
    }

    // Determine the target career — user's explicit targetRole takes priority
    const targetCareer =
      profile.targetRole ?? profile.cachedRecommendations?.top?.career_title ?? null;

    // Check cache (also invalidate if target role changed)
    const cached = profile.cachedResources;
    const cacheAge = cached?.generatedAt
      ? Date.now() - new Date(cached.generatedAt).getTime()
      : Infinity;
    const cachedForSameRole = (cached?.targetCareer ?? "") === (targetCareer ?? "");
    const cacheValid = cacheAge < CACHE_TTL_MS && cached?.resources?.length > 0 && cachedForSameRole;

    if (cacheValid && !forceRefresh) {
      logger.info("[Resources] Cache hit — returning cached personalized resources");
      const results = applyFilters(cached.resources, query, levelFilter);
      return res.json({ resources: results, personalized: true, targetCareer: targetCareer ?? undefined });
    }

    // ─── GENERATE PERSONALIZED RESOURCES ───
    logger.info(`[Resources] Generating resources for target: ${targetCareer || "general"}...`);

    const missingSkills = (profile.cachedSkillGap?.missing ?? []).map((m) => m.skill);
    const experienceLevel = getExperienceLevel(profile.experience?.years);

    // Get curated role-based resources (always available, instant)
    const curatedResources = buildFallbackResources(targetCareer, missingSkills, profile.skills);
    logger.info(`[Resources] ${curatedResources.length} curated resources for role "${targetCareer}"`);

    // Try AI generation for additional personalized recommendations
    let aiResources = null;
    try {
      const useGemini = isGeminiAvailable();
      const resourceFn = useGemini ? geminiApiRecommendResources : geminiRecommendResources;
      const timeoutMs = useGemini ? 20_000 : 35_000;

      const result = await withTimeout(
        resourceFn({
          skills: profile.skills,
          missingSkills,
          targetCareer,
          experienceLevel,
        }),
        timeoutMs,
        "Resource generation"
      );

      aiResources = Array.isArray(result?.resources) ? result.resources : null;
      if (aiResources) {
        logger.info(`[Resources] AI generated ${aiResources.length} additional resources`);
      }
    } catch (err) {
      logger.warn("[Resources] AI resource generation failed:", err?.message ?? err);
    }

    // Merge AI + curated (AI first, then curated to fill gaps, deduplicated)
    let finalResources;
    if (aiResources && aiResources.length > 0) {
      finalResources = mergeResources(aiResources, curatedResources);
    } else {
      finalResources = curatedResources;
    }

    // Cache the results (including which role they were generated for)
    profile.cachedResources = {
      resources: finalResources,
      targetCareer: targetCareer ?? "",
      generatedAt: new Date(),
    };

    await profile.save().catch((err) =>
      logger.warn("[Resources] Failed to cache resources:", err?.message ?? err)
    );

    const results = applyFilters(finalResources, query, levelFilter);

    return res.json({
      resources: results,
      personalized: true,
      targetCareer: targetCareer ?? undefined,
    });
  } catch (err) {
    logger.error("[Resources] Error:", err?.message ?? err);

    // Graceful fallback
    const filtered = applyFilters(
      allStaticResources.map((r) => ({ ...r, type: r.type || "Course", priority: "Medium", reason: "" })),
      query,
      levelFilter
    );
    return res.json({ resources: filtered, personalized: false });
  }
}
