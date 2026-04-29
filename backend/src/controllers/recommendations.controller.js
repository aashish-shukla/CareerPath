import multer from "multer";
import pdfParse from "pdf-parse";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";
import { Profile } from "../models/Profile.js";
import { careers } from "../data/mock/careers.js";
import {
  geminiAtsScore,
  geminiParseResume,
  geminiProfileSummary,
  geminiRecommendCareers,
  geminiSkillGap,
} from "../services/geminiClient.js";
import {
  isGeminiAvailable,
  geminiApiAtsScore,
  geminiApiRecommendCareers,
  geminiApiSkillGap,
  geminiApiParseResume,
  geminiApiProfileSummary,
} from "../services/geminiApiClient.js";

export const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = ['application/pdf', 'text/plain', 'text/markdown'];
    const allowedExts = ['.pdf', '.txt', '.md'];
    const ext = file.originalname?.toLowerCase().match(/\.[^.]+$/)?.[0];
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(new HttpError(400, "Only PDF, TXT, and Markdown files are accepted"), false);
    }
  },
});

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function emptyParsedResume() {
  return {
    summary: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    links: [],
    skills: [],
    experience: [],
    education: [],
    certifications: [],
    projects: [],
    keywords: [],
  };
}

function buildFallbackRecommendations(profile) {
  const skills = new Set(profile?.skills ?? []);
  const skillsCount = skills.size;
  const expYears = profile?.experience?.years ?? 0;
  
  const scored = careers.map((c) => {
    const overlap = c.topSkills.filter((s) => skills.has(s)).length;
    let confidence = c.topSkills.length ? overlap / c.topSkills.length : 0.05;
    
    // Penalize lack of experience for senior roles
    if (c.title.toLowerCase().includes('senior') && expYears < 3) {
      confidence *= 0.6;
    }
    if (c.title.toLowerCase().includes('lead') && expYears < 5) {
      confidence *= 0.5;
    }
    
    // Boost for good skill coverage
    if (skillsCount >= 8 && overlap >= 5) {
      confidence *= 1.15;
    }
    
    // Cap between realistic bounds
    confidence = Math.max(0.15, Math.min(0.85, confidence));
    
    return {
      career_id: c.id,
      career_title: c.title,
      confidence: Math.round(confidence * 100) / 100, // Round to 2 decimals
      reason: overlap > 0
        ? `Matches ${overlap} of ${c.topSkills.length} key skills (${Math.round(confidence * 100)}% fit).`
        : "Emerging opportunity - consider upskilling.",
    };
  });
  scored.sort((a, b) => b.confidence - a.confidence);
  const top = scored[0] ?? null;
  return {
    career_match_score: Math.round((top?.confidence ?? 0.35) * 100),
    top,
    recommendations: scored.slice(0, 4),
  };
}

function buildFallbackSkillGap(profile, targetCareer) {
  const skills = new Set(profile?.skills ?? []);
  const missing = (targetCareer?.topSkills ?? []).filter((s) => !skills.has(s));
  const hasExperience = !!(profile?.experience?.summary);
  const expYears = profile?.experience?.years ?? 0;
  
  // Categorize missing skills by priority
  const missingItems = missing.map((skill, idx) => {
    // First 2 are high priority, next 3 medium, rest low
    let priority = idx < 2 ? "High" : idx < 5 ? "Medium" : "Low";
    let difficulty = "Medium";
    let weeks = 4;
    
    // Adjust based on common patterns
    if (skill.toLowerCase().includes('advanced') || skill.toLowerCase().includes('architect')) {
      difficulty = "High";
      weeks = 8;
      priority = "High";
    } else if (skill.toLowerCase().includes('basic') || skill.toLowerCase().includes('intro')) {
      difficulty = "Low";
      weeks = 2;
    }
    
    return { skill, priority, difficulty, estimated_weeks: weeks };
  });
  
  // Calculate readiness with experience factor
  let readiness = 0;
  if (targetCareer?.topSkills?.length) {
    const baseReadiness = ((targetCareer.topSkills.length - missing.length) / targetCareer.topSkills.length) * 100;
    
    // Adjust for experience
    let expBonus = 0;
    if (hasExperience) {
      if (expYears >= 5) expBonus = 15;
      else if (expYears >= 3) expBonus = 10;
      else if (expYears >= 1) expBonus = 5;
    }
    
    readiness = Math.min(95, Math.round(baseReadiness + expBonus));
  } else {
    readiness = hasExperience ? (expYears > 2 ? 45 : 30) : 20;
  }
  
  return {
    readiness_score: Math.max(15, Math.min(95, readiness)),
    missing: missingItems,
    strengths: profile?.skills ?? [],
    notes: missing.length === 0 
      ? "Strong skill match! Focus on project experience." 
      : `${missing.length} skill${missing.length > 1 ? 's' : ''} to develop for optimal readiness.`,
  };
}

function buildFallbackAtsScore(profile, targetRole) {
  const hasResume = !!(profile?.resume?.extractedText);
  const resumeText = profile?.resume?.extractedText ?? "";
  const resumeLength = resumeText.length;
  
  // Merge skills from profile AND resume parsed data
  const profileSkills = profile?.skills ?? [];
  const resumeSkills = profile?.resume?.parsed?.skills ?? profile?.resume?.details?.skills ?? [];
  const allSkills = [...new Set([...profileSkills, ...resumeSkills])];
  const skillsCount = allSkills.length;
  
  const hasEducation = !!(profile?.education?.institution);
  
  // Use whichever experience source has more data
  const profileExpYears = profile?.experience?.years ?? 0;
  const hasProfileExperience = !!(profile?.experience?.summary);
  
  // Try to detect experience from resume text if profile has 0 years
  let expYears = profileExpYears;
  let hasExperience = hasProfileExperience;
  if (expYears === 0 && resumeText) {
    // Look for experience indicators in resume text
    const yearMatch = resumeText.match(/(\d+)\+?\s*years?\s*(of)?\s*(experience|expertise)/i);
    if (yearMatch) {
      expYears = parseInt(yearMatch[1], 10);
    }
    // Check for job titles with dates as experience evidence
    const jobDates = resumeText.match(/\d{4}\s*[-–]\s*(Present|\d{4})/gi);
    if (jobDates && jobDates.length > 0) {
      hasExperience = true;
      if (expYears === 0) {
        // Estimate from date ranges
        expYears = Math.min(jobDates.length * 1.5, 10);
      }
    }
  }
  
  // Also count resume-specific quality indicators
  const hasQuantifiedAchievements = /\d+%|\d+\+|increased|reduced|improved|built|led|managed/i.test(resumeText);
  const hasCertifications = /certif/i.test(resumeText);
  const hasProjects = /project/i.test(resumeText);
  
  // More realistic, granular scoring
  let score = 0;
  
  // Resume Quality (0-35 points)
  if (hasResume) {
    if (resumeLength < 300) score += 10; // Too short
    else if (resumeLength < 800) score += 18; // Minimal
    else if (resumeLength < 1500) score += 25; // Good
    else if (resumeLength < 3000) score += 32; // Excellent
    else score += 15; // Too long
  }
  
  // Skills Match (0-30 points)
  if (skillsCount === 0) score += 0;
  else if (skillsCount < 3) score += 12;
  else if (skillsCount < 6) score += 20;
  else if (skillsCount < 10) score += 28;
  else score += 30;
  
  // Experience Quality (0-25 points)
  if (hasExperience) {
    const summaryLength = profile?.experience?.summary?.length ?? 0;
    if (expYears === 0 && summaryLength < 100) score += 8;
    else if (expYears < 2) score += 15;
    else if (expYears < 5) score += 20;
    else score += 25;
  }
  
  // Education (0-10 points)
  if (hasEducation) score += 10;
  
  // Bonus points for quality indicators (0-5 points)
  if (hasQuantifiedAchievements) score += 2;
  if (hasCertifications) score += 2;
  if (hasProjects) score += 1;
  
  // Calculate breakdown percentages
  const keywordMatch = Math.min(100, (skillsCount / 12) * 100);
  const impactScore = hasExperience 
    ? Math.min(100, Math.max((expYears / 8) * 100, hasQuantifiedAchievements ? 40 : 10))
    : 0;
  const formattingScore = hasResume ? (resumeLength > 800 && resumeLength < 2500 ? 85 : 55) : 15;
  const brevityScore = resumeLength > 1000 && resumeLength < 2200 ? 95 : (resumeLength > 300 ? 60 : 35);
  const completenessScore = (hasResume ? 25 : 0) + (skillsCount > 0 ? 25 : 0) + (hasExperience ? 25 : 0) + (hasEducation ? 25 : 0);
  
  // Generate realistic feedback
  const strengths = [];
  const improvements = [];
  const keywordGaps = [];
  
  if (resumeLength > 800) strengths.push("Strong resume content");
  if (skillsCount >= 6) strengths.push("Diverse skill set");
  if (expYears >= 3) strengths.push("Solid experience level");
  if (hasEducation) strengths.push("Education background documented");
  if (hasQuantifiedAchievements) strengths.push("Quantified impact metrics");
  if (hasCertifications) strengths.push("Professional certifications included");
  
  if (resumeLength < 800) improvements.push("Expand resume details");
  if (skillsCount < 6) improvements.push("Add more technical skills");
  if (!hasExperience || expYears < 2) improvements.push("Highlight more achievements");
  if (!hasEducation) improvements.push("Include education history");
  if (!hasQuantifiedAchievements) improvements.push("Add quantified achievements (e.g., 'increased X by 30%')");
  
  keywordGaps.push(`Target role: ${targetRole}`);
  if (skillsCount < 8) keywordGaps.push("Consider adding domain-specific keywords");
  
  return {
    score: Math.max(15, Math.min(100, Math.round(score))),
    breakdown: {
      keywordMatch: Math.round(keywordMatch),
      impact: Math.round(impactScore),
      formatting: Math.round(formattingScore),
      brevity: Math.round(brevityScore),
      sectionCompleteness: Math.round(completenessScore),
    },
    strengths: strengths.length > 0 ? strengths : ["Profile created"],
    improvements: improvements.length > 0 ? improvements : ["Continue building your profile"],
    keywordGaps,
  };
}

async function extractResumeText(file) {
  if (!file) return "";
  const isPdf = file.mimetype === "application/pdf" || file.originalname?.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    const parsed = await pdfParse(file.buffer);
    return parsed.text ?? "";
  }
  return file.buffer.toString("utf-8");
}

function basicRegexExtract(text) {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/);
  return {
    email: emailMatch ? emailMatch[0] : "",
    phone: phoneMatch ? phoneMatch[0] : "",
  };
}

export async function uploadResume(req, res, next) {
  try {
    if (!req.file) throw new HttpError(400, "No file uploaded");
    const text = await extractResumeText(req.file);
    if (!text) throw new HttpError(400, "Unable to extract resume text");
    
    const enrich = req.query?.enrich === "1" || req.query?.enrich === "true";
    const basicInfo = basicRegexExtract(text);

    let parsed = { ...emptyParsedResume(), ...basicInfo };
    let warning = "";

    if (enrich) {
      try {
        // Use Gemini API if available, otherwise Ollama
        const parseFn = isGeminiAvailable() ? geminiApiParseResume : geminiParseResume;
        const timeoutMs = isGeminiAvailable() ? 15_000 : 35_000;
        const aiData = await withTimeout(parseFn({ text }), timeoutMs, "Resume Intelligence Extract");
        parsed = { 
          ...parsed, 
          ...aiData,
          skills: Array.isArray(aiData.skills) ? aiData.skills : [],
          summary: aiData.summary || ""
        };
      } catch (err) {
        warning = "AI Intelligence failed to extract skills, using basic text fallback.";
        logger.warn("Resume intelligence extraction failed", err?.message ?? err);
      }
    }
    const existing = await Profile.findOne({ userId: req.user.sub });
    const mergedSkills = Array.from(new Set([...(parsed.skills ?? []), ...(existing?.skills ?? [])])).filter(Boolean);

    const profile = await Profile.findOneAndUpdate(
      { userId: req.user.sub },
      {
        $set: {
          "resume.filename": req.file.originalname,
          "resume.extractedText": text,
          "resume.parsed": enrich ? parsed : existing?.resume?.parsed ?? existing?.resume?.details ?? emptyParsedResume(),
          "resume.details": enrich ? parsed : existing?.resume?.details ?? emptyParsedResume(),
          "resume.atsScore": null, // Reset ATS score on new upload
          skills: mergedSkills,
          needsRegeneration: true, // Mark for AI regeneration
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    // Immediate response for resume upload
    res.json({ profile, parsed, warning: warning || undefined });

    // Background enrichment for final summary
    if (enrich) {
      const summaryFn = isGeminiAvailable() ? geminiApiProfileSummary : geminiProfileSummary;
      summaryFn(profile.toObject())
        .then(summary => {
          profile.profileSummary = summary;
          return profile.save();
        })
        .catch(err => logger.warn("Async background summary failed", err?.message ?? err));
    }
  } catch (err) {
    next(err);
  }
}

export async function getMyRecommendations(req, res, next) {
  try {
    const profile = await Profile.findOne({ userId: req.user.sub });
    if (!profile) throw new HttpError(400, "Complete profile setup first");

    // Allow force refresh via query parameter
    const forceRefresh = req.query?.refresh === "1" || req.query?.refresh === "true";
    if (forceRefresh) {
      logger.info("[Force Refresh] User requested fresh analysis");
      profile.needsRegeneration = true;
    }

    // Check cache age - invalidate if older than 24 hours
    const cacheAge = profile.cachedRecommendations?.generatedAt 
      ? Date.now() - new Date(profile.cachedRecommendations.generatedAt).getTime()
      : Infinity;
    const cacheExpired = cacheAge > 24 * 60 * 60 * 1000; // 24 hours
    
    if (cacheExpired && profile.cachedRecommendations?.recommendations) {
      logger.info("[Cache Expired] Cached data is older than 24h, marking for regeneration");
      profile.needsRegeneration = true;
    }

    // Check if we can use cached data (INSTANT response!)
    if (!profile.needsRegeneration && profile.cachedRecommendations?.recommendations?.length > 0) {
      logger.info("[Cache Hit] Returning cached recommendations - no AI calls needed");
      const enriched = (profile.cachedRecommendations.recommendations ?? []).map((r) => {
        const meta = careers.find((c) => c.id === r.career_id);
        return { ...r, meta };
      });

      // Ensure we always have an ATS score (even if just baseline)
      let cachedAtsScore = profile.resume?.atsScore ?? null;
      if (!cachedAtsScore || typeof cachedAtsScore.score !== 'number') {
        cachedAtsScore = buildFallbackAtsScore(profile.toObject(), profile.cachedRecommendations.top?.career_title ?? "target role");
        logger.info("[Cache Hit] Generated missing ATS score:", cachedAtsScore.score);
        // Save it for next time
        if (!profile.resume) profile.resume = {};
        profile.resume.atsScore = cachedAtsScore;
        profile.save().catch(err => logger.warn("Failed to save fallback ATS score", err));
      }

      logger.info(`[Cache Hit] ATS Score: ${cachedAtsScore?.score ?? 'NULL'}`);

      return res.json({
        recommendations: enriched,
        top: profile.cachedRecommendations.top,
        careerMatchScore: profile.cachedRecommendations.careerMatchScore,
        skillGap: profile.cachedSkillGap ?? null,
        profileSummary: profile.profileSummary ?? null,
        resumeDetails: profile.resume?.parsed ?? profile.resume?.details ?? null,
        extractedText: profile.resume?.extractedText ?? "",
        atsScore: cachedAtsScore,
      });
    }

    // DATA NEEDS REGENERATION
    const useGeminiApi = isGeminiAvailable();
    logger.info(`[Cache Miss] Regenerating AI recommendations... (provider: ${useGeminiApi ? 'Gemini API' : 'Ollama'})`);

    if (!profile.profileSummary?.summary) {
      try {
        const summaryFn = useGeminiApi ? geminiApiProfileSummary : geminiProfileSummary;
        const summary = await withTimeout(summaryFn(profile.toObject()), useGeminiApi ? 15_000 : 10_000, "Profile summary");
        profile.profileSummary = summary;
        await profile.save();
      } catch (err) {
        logger.warn("Profile summary generation failed", err?.message ?? err);
      }
    }

    const resumeParsed = profile.resume?.parsed ?? profile.resume?.details ?? null;
    const payload = {
      education: profile.education,
      skills: profile.skills ?? [],
      experience: profile.experience,
      resume: resumeParsed,
      profile_summary: profile.profileSummary?.summary ?? "",
    };

    let warning = "";
    let rec;
    let gap;
    // Always regenerate ATS score on refresh, otherwise use cached
    let atsScore = forceRefresh ? null : (profile.resume?.atsScore ?? null);

    try {
      if (useGeminiApi) {
        // Use Gemini API (fast, reliable cloud service)
        const [recResult, gapResult] = await Promise.all([
          withTimeout(geminiApiRecommendCareers({ profile: payload, careers }), 20_000, "Gemini Recommendations"),
          withTimeout(geminiApiSkillGap({ profile: payload, targetCareer: null }), 20_000, "Gemini Skill gap").catch(() => null)
        ]);
        rec = recResult;
        if (gapResult) {
          gap = gapResult;
        } else {
          const targetCareer = careers.find((c) => c.id === rec.top?.career_id) ?? null;
          gap = await withTimeout(geminiApiSkillGap({ profile: payload, targetCareer }), 15_000, "Gemini Skill gap final").catch(() => buildFallbackSkillGap(payload, targetCareer));
        }
      } else {
        // Use Ollama (local AI)
        const [recResult, gapResult] = await Promise.all([
          withTimeout(geminiRecommendCareers({ profile: payload, careers }), 30_000, "Recommendations"),
          withTimeout(geminiSkillGap({ profile: payload, targetCareer: null }), 30_000, "Skill gap").catch(() => null)
        ]);
        rec = recResult;
        if (gapResult) {
          gap = gapResult;
        } else {
          const targetCareer = careers.find((c) => c.id === rec.top?.career_id) ?? null;
          gap = await withTimeout(geminiSkillGap({ profile: payload, targetCareer }), 20_000, "Skill gap final").catch(() => buildFallbackSkillGap(payload, targetCareer));
        }
      }
    } catch (err) {
      warning = "Recommendations generated using fallback logic due to AI delays.";
      logger.warn("AI recommendations failed", err?.message ?? err);
      rec = buildFallbackRecommendations(payload);
      const targetCareer = careers.find((c) => c.id === rec.top?.career_id) ?? null;
      gap = buildFallbackSkillGap(payload, targetCareer);
    }

    // Generate ATS score — priority: Gemini API → Ollama → Heuristic fallback
    if (!atsScore || typeof atsScore.score !== 'number') {
      const targetRole = rec.top?.career_title ?? rec.recommendations?.[0]?.career_title ?? "target role";
      
      if (profile.resume?.extractedText) {
        // Attempt 1: Gemini API (most accurate)
        if (useGeminiApi) {
          try {
            logger.info("[ATS] Scoring via Gemini API...");
            atsScore = await withTimeout(
              geminiApiAtsScore({
                resumeText: profile.resume.extractedText,
                targetRole,
                skills: profile.skills ?? [],
              }),
              20_000,
              "Gemini ATS score"
            );
            if (!atsScore || typeof atsScore.score !== 'number') {
              throw new Error("Invalid ATS score structure from Gemini API");
            }
            logger.info(`[ATS] Gemini API score: ${atsScore.score}`);
            profile.resume.atsScore = atsScore;
          } catch (err) {
            logger.warn("Gemini API ATS scoring failed, trying Ollama...", err?.message ?? err);
            atsScore = null; // Will fall through to Ollama attempt
          }
        }

        // Attempt 2: Ollama (local AI)
        if (!atsScore) {
          try {
            logger.info("[ATS] Scoring via Ollama...");
            atsScore = await withTimeout(
              geminiAtsScore({
                resumeText: profile.resume.extractedText,
                targetRole,
              }),
              30_000,
              "Ollama ATS score"
            );
            if (!atsScore || typeof atsScore.score !== 'number') {
              throw new Error("Invalid ATS score structure from Ollama");
            }
            logger.info(`[ATS] Ollama score: ${atsScore.score}`);
            profile.resume.atsScore = atsScore;
          } catch (err) {
            logger.warn("Ollama ATS scoring failed, using heuristic fallback", err?.message ?? err);
            atsScore = null;
          }
        }

        // Attempt 3: Heuristic fallback
        if (!atsScore) {
          atsScore = buildFallbackAtsScore(profile.toObject(), targetRole);
          profile.resume.atsScore = atsScore;
          warning = warning || "ATS score calculated using heuristic analysis.";
          logger.info(`[ATS] Heuristic fallback score: ${atsScore.score}`);
        }
      } else {
        // No resume uploaded - provide baseline score
        atsScore = buildFallbackAtsScore(profile.toObject(), targetRole);
        if (!profile.resume) profile.resume = {};
        profile.resume.atsScore = atsScore;
        logger.info("Generated baseline ATS score (no resume uploaded)");
      }
    }

    // CACHE THE RESULTS for next time!
    profile.cachedRecommendations = {
      careerMatchScore: rec.career_match_score,
      top: rec.top,
      recommendations: rec.recommendations,
      generatedAt: new Date(),
    };
    profile.cachedSkillGap = {
      ...gap,
      generatedAt: new Date(),
    };
    profile.needsRegeneration = false; // Mark as fresh
    
    // Log cache update for debugging
    logger.info(`[Cache Updated] Career Match: ${rec.career_match_score}%, ATS: ${atsScore?.score ?? 'N/A'}, Readiness: ${gap?.readiness_score ?? 'N/A'}%`);
    
    await profile.save();

    const enriched = (rec.recommendations ?? []).map((r) => {
      const meta = careers.find((c) => c.id === r.career_id);
      return { ...r, meta };
    });

    // Log ATS score for debugging
    logger.info(`[ATS Score] Returning score: ${atsScore?.score ?? 'NULL'}`);

    res.json({
      recommendations: enriched,
      top: rec.top,
      careerMatchScore: rec.career_match_score,
      skillGap: gap,
      profileSummary: profile.profileSummary ?? null,
      resumeDetails: profile.resume?.parsed ?? profile.resume?.details ?? null,
      extractedText: profile.resume?.extractedText ?? "",
      atsScore,
      warning: warning || undefined,
    });
  } catch (err) {
    next(err);
  }
}

