import { Profile } from "../models/Profile.js";
import { logger } from "../utils/logger.js";

/**
 * Peer comparison using REAL aggregated data from the profiles collection.
 * Calculates percentile rankings for the current user vs all other users.
 */
export async function getPeerComparison(req, res, next) {
  try {
    const userId = req.user.sub;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(400).json({ error: "Complete your profile first." });
    }

    // Aggregate stats from ALL profiles in the database
    const [stats] = await Profile.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          // Skills
          avgSkillCount: { $avg: { $size: { $ifNull: ["$skills", []] } } },
          allSkillCounts: { $push: { $size: { $ifNull: ["$skills", []] } } },
          // Experience
          avgExperience: { $avg: { $ifNull: ["$experience.years", 0] } },
          allExperience: { $push: { $ifNull: ["$experience.years", 0] } },
          // ATS Score
          avgAtsScore: { $avg: { $ifNull: ["$resume.atsScore.score", null] } },
          allAtsScores: { $push: { $ifNull: ["$resume.atsScore.score", null] } },
          // Readiness
          avgReadiness: { $avg: { $ifNull: ["$cachedSkillGap.readiness_score", null] } },
          allReadiness: { $push: { $ifNull: ["$cachedSkillGap.readiness_score", null] } },
          // Resume uploads
          resumeUploadCount: {
            $sum: { $cond: [{ $gt: ["$resume.extractedText", null] }, 1, 0] },
          },
          // Target roles distribution
          targetRoles: { $push: "$targetRole" },
        },
      },
    ]);

    if (!stats || stats.totalUsers === 0) {
      return res.json({
        totalUsers: 0,
        percentiles: {},
        message: "Not enough data for peer comparison yet.",
      });
    }

    // Current user's stats
    const mySkillCount = (profile.skills ?? []).length;
    const myExperience = profile.experience?.years ?? 0;
    const myAtsScore = profile.resume?.atsScore?.score ?? null;
    const myReadiness = profile.cachedSkillGap?.readiness_score ?? null;

    // Calculate percentiles (what % of users you're ahead of)
    const skillPercentile = calcPercentile(stats.allSkillCounts, mySkillCount);
    const expPercentile = calcPercentile(stats.allExperience, myExperience);
    const atsPercentile = myAtsScore !== null
      ? calcPercentile(stats.allAtsScores.filter((s) => s !== null), myAtsScore)
      : null;
    const readinessPercentile = myReadiness !== null
      ? calcPercentile(stats.allReadiness.filter((r) => r !== null), myReadiness)
      : null;

    // Overall composite percentile
    const validPercentiles = [skillPercentile, expPercentile, atsPercentile, readinessPercentile].filter((p) => p !== null);
    const overallPercentile = validPercentiles.length > 0
      ? Math.round(validPercentiles.reduce((a, b) => a + b, 0) / validPercentiles.length)
      : null;

    // Target role distribution (anonymized)
    const roleDistribution = {};
    for (const role of stats.targetRoles) {
      if (role) {
        roleDistribution[role] = (roleDistribution[role] || 0) + 1;
      }
    }
    // Sort by count descending, take top 5
    const topRoles = Object.entries(roleDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([role, count]) => ({ role, count, percentage: Math.round((count / stats.totalUsers) * 100) }));

    return res.json({
      totalUsers: stats.totalUsers,
      you: {
        skillCount: mySkillCount,
        experience: myExperience,
        atsScore: myAtsScore,
        readiness: myReadiness,
      },
      averages: {
        skillCount: Math.round(stats.avgSkillCount * 10) / 10,
        experience: Math.round(stats.avgExperience * 10) / 10,
        atsScore: stats.avgAtsScore ? Math.round(stats.avgAtsScore) : null,
        readiness: stats.avgReadiness ? Math.round(stats.avgReadiness) : null,
      },
      percentiles: {
        overall: overallPercentile,
        skills: skillPercentile,
        experience: expPercentile,
        atsScore: atsPercentile,
        readiness: readinessPercentile,
      },
      resumeUploadRate: Math.round((stats.resumeUploadCount / stats.totalUsers) * 100),
      topTargetRoles: topRoles,
    });
  } catch (err) {
    logger.error("[PeerStats] Error:", err?.message ?? err);
    next(err);
  }
}

/**
 * Calculate what percentile a value is in an array.
 * Returns 0-100 (higher = you're ahead of more people).
 */
function calcPercentile(values, myValue) {
  if (!values || values.length === 0 || myValue === null || myValue === undefined) return null;
  const valid = values.filter((v) => v !== null && v !== undefined);
  if (valid.length === 0) return null;
  const below = valid.filter((v) => v < myValue).length;
  return Math.round((below / valid.length) * 100);
}
