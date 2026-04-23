import { Profile } from "../models/Profile.js";
import { geminiProfileSummary } from "../services/geminiClient.js";
import { logger } from "../utils/logger.js";

export async function getMyProfile(req, res, next) {
  try {
    const profile = await Profile.findOne({ userId: req.user.sub }).populate("userId", "email name");
    res.json({ 
      profile: profile ?? null,
      email: profile?.userId?.email ?? "",
      name: profile?.userId?.name ?? ""
    });
  } catch (err) {
    next(err);
  }
}

export async function upsertMyProfile(req, res, next) {
  try {
    const userId = req.user.sub;
    // Whitelist allowed fields to prevent mass assignment
    const allowedFields = ['fullName', 'currentRole', 'targetRole', 'education', 'experience', 'skills'];
    const update = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    update.needsRegeneration = true;
    const enrich = req.query?.enrich === "1" || req.query?.enrich === "true";
    
    // If targetRole or skills changed, invalidate ALL cached AI data
    // so Dashboard, Resources, Skill Gap pages regenerate for the new role
    if (update.targetRole !== undefined || update.skills !== undefined) {
      update.cachedRecommendations = null;
      update.cachedSkillGap = null;
      update.cachedResources = null;
      if (update.targetRole !== undefined) {
        // Also reset ATS score since it's role-dependent
        update["resume.atsScore"] = null;
      }
      logger.info(`[Profile] Role/skills changed — cleared all caches for user ${userId}`);
    }
    
    // 1. Direct and Fast Save
    const profile = await Profile.findOneAndUpdate({ userId }, update, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    // 2. Immediate response to frontend
    res.json({ profile });

    // 3. Process enrichment (AI summary) in background if requested
    if (enrich) {
      // Fire and forget - don't wait for AI before sending response
      geminiProfileSummary(profile.toObject())
        .then(summary => {
          profile.profileSummary = summary;
          return profile.save();
        })
        .then(() => logger.info(`Async profile enrichment complete for ${userId}`))
        .catch(err => logger.warn("Async profile summary failed", err?.message ?? err));
    }
  } catch (err) {
    next(err);
  }
}

