import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

let genAI = null;
let model = null;

// Circuit breaker: skip Gemini when rate-limited instead of wasting time
let _rateLimitedUntil = 0;

function getModel() {
  if (!env.GEMINI_API_KEY) return null;
  if (!genAI) {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
    logger.info(`[Gemini API] Initialized with model: ${env.GEMINI_MODEL}`);
  }
  return model;
}

/**
 * Returns true if the Gemini API is configured AND not currently rate-limited.
 */
export function isGeminiAvailable() {
  if (!env.GEMINI_API_KEY) return false;
  if (Date.now() < _rateLimitedUntil) {
    const secsLeft = Math.ceil((_rateLimitedUntil - Date.now()) / 1000);
    logger.info(`[Gemini API] Circuit breaker OPEN — rate-limited for ${secsLeft}s more, using Ollama`);
    return false;
  }
  return true;
}

/**
 * Generate a structured JSON response from Gemini API.
 */
async function generateGeminiResponse({ systemInstruction, prompt }) {
  const geminiModel = getModel();
  if (!geminiModel) {
    throw new Error("Gemini API key not configured");
  }

  // Double-check circuit breaker right before calling
  if (Date.now() < _rateLimitedUntil) {
    throw new Error("Gemini API rate-limited (circuit breaker open)");
  }

  try {
    logger.info(`[Gemini API] Generating response...`);

    const result = await geminiModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    });

    const text = result.response.text();
    if (!text) {
      throw new Error("Empty response from Gemini API");
    }

    logger.info(`[Gemini API] Received response (${text.length} chars)`);

    try {
      return JSON.parse(text);
    } catch {
      logger.warn("[Gemini API] JSON parse failed, attempting regex extraction");
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error("Failed to parse Gemini API JSON response");
    }
  } catch (err) {
    // Detect 429 rate limit and activate circuit breaker
    if (err.message?.includes("429") || err.message?.includes("Too Many Requests") || err.message?.includes("quota")) {
      // Extract retry delay from error if available, default to 60s
      const retryMatch = err.message.match(/retry in (\d+)/i);
      const cooldownSecs = retryMatch ? Math.max(parseInt(retryMatch[1], 10), 30) : 60;
      _rateLimitedUntil = Date.now() + cooldownSecs * 1000;
      logger.warn(`[Gemini API] Rate limited! Circuit breaker CLOSED for ${cooldownSecs}s — falling back to Ollama`);
    }
    logger.error("[Gemini API] Error:", err.message?.slice(0, 200));
    throw err;
  }
}

/**
 * ATS Score analysis using Gemini API.
 * Returns a detailed, accurate ATS compatibility score.
 */
export async function geminiApiAtsScore({ resumeText, targetRole, skills }) {
  const systemInstruction = `You are a professional ATS (Applicant Tracking System) simulator with 10+ years of HR technology experience. 
You evaluate resumes with the same rigor as enterprise ATS systems like Workday, Greenhouse, and Lever.
Be realistic and critical — most resumes score between 40-75%. Only exceptional resumes score above 85%.
Output strictly valid JSON.`;

  const prompt = `Analyze this resume for the target role: "${targetRole}"

Evaluate across these dimensions:
1. **Keyword Match** (0-100): How well do the resume's skills/keywords match what's expected for "${targetRole}"?
2. **Impact** (0-100): Does the resume quantify achievements with metrics, numbers, percentages?
3. **Formatting** (0-100): Is the resume well-structured with clear sections (Summary, Experience, Education, Skills)?
4. **Brevity** (0-100): Is the content concise and relevant, or bloated with filler?
5. **Section Completeness** (0-100): Are all critical sections present (Contact, Summary, Experience, Education, Skills)?

Also identify:
- Top 3-5 strengths of this resume
- Top 3-5 specific improvements needed
- Key missing keywords/skills for the "${targetRole}" role

${skills?.length ? `The candidate's profile lists these skills: ${skills.join(", ")}` : ""}

Return JSON:
{
  "score": <overall 0-100 integer>,
  "breakdown": {
    "keywordMatch": <0-100>,
    "impact": <0-100>,
    "formatting": <0-100>,
    "brevity": <0-100>,
    "sectionCompleteness": <0-100>
  },
  "strengths": ["specific strength 1", "specific strength 2", ...],
  "improvements": ["specific improvement 1", "specific improvement 2", ...],
  "keywordGaps": ["missing keyword/skill 1", "missing keyword/skill 2", ...]
}

Resume Text:
${resumeText.slice(0, 4000)}`;

  const result = await generateGeminiResponse({ systemInstruction, prompt });

  // Validate the response structure
  if (typeof result.score !== "number" || !result.breakdown) {
    throw new Error("Invalid ATS score structure from Gemini API");
  }

  // Ensure all breakdown values are numbers
  const breakdown = result.breakdown;
  for (const key of ["keywordMatch", "impact", "formatting", "brevity", "sectionCompleteness"]) {
    if (typeof breakdown[key] !== "number") {
      breakdown[key] = 0;
    }
    breakdown[key] = Math.max(0, Math.min(100, Math.round(breakdown[key])));
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    breakdown,
    strengths: Array.isArray(result.strengths) ? result.strengths : [],
    improvements: Array.isArray(result.improvements) ? result.improvements : [],
    keywordGaps: Array.isArray(result.keywordGaps) ? result.keywordGaps : [],
  };
}

/**
 * Career recommendations using Gemini API.
 */
export async function geminiApiRecommendCareers({ profile, careers }) {
  const systemInstruction = `You are a strict Career Guidance Expert. Do not give over-optimistic scores. 
Grant high confidence ONLY for near-perfect skill and experience matches. 
A 1.0 confidence is reserved for people with precisely the right skills and 5+ years of relevant experience.
Output strictly valid JSON.`;

  const prompt = `Analyze this professional profile and determine the 4 best matching careers from the list.
Be conservative with confidence levels (0.0 - 1.0).

Profile:
- Skills: ${JSON.stringify(profile.skills ?? [])}
- Experience: ${JSON.stringify(profile.experience)}
- Education: ${JSON.stringify(profile.education)}
- Summary: ${profile.profile_summary || "Not provided"}

Available Careers:
${JSON.stringify(careers.map(c => ({ id: c.id, title: c.title, skills: c.topSkills })))}

Return JSON:
{
  "career_match_score": <integer 0-100>,
  "top": { "career_id": "...", "career_title": "...", "confidence": <0.0-1.0>, "reason": "detailed reason" },
  "recommendations": [
    { "career_id": "...", "career_title": "...", "confidence": <0.0-1.0>, "reason": "..." }
  ]
}`;

  return generateGeminiResponse({ systemInstruction, prompt });
}

/**
 * Skill gap analysis using Gemini API.
 */
export async function geminiApiSkillGap({ profile, targetCareer }) {
  const systemInstruction = `You are a skill gap analyst. Compare the candidate's profile against the target career requirements.
Be realistic about readiness scores. Output strictly valid JSON.`;

  const prompt = `Analyze the skill gap between this candidate and their target career.

Candidate Skills: ${JSON.stringify(profile.skills ?? [])}
Candidate Experience: ${JSON.stringify(profile.experience)}
Target Career: ${targetCareer?.title ?? "General"}
Required Skills: ${JSON.stringify(targetCareer?.topSkills ?? [])}

Return JSON:
{
  "readiness_score": <0-100>,
  "missing": [{ "skill": "...", "priority": "High"|"Medium"|"Low", "difficulty": "Easy"|"Medium"|"Hard", "estimated_weeks": <int> }],
  "strengths": ["skill1", "skill2"],
  "notes": "brief assessment"
}`;

  return generateGeminiResponse({ systemInstruction, prompt });
}

/**
 * Resume parsing using Gemini API.
 */
export async function geminiApiParseResume({ text }) {
  const systemInstruction = `You are an expert resume parser. Extract structured data from resume text.
Output strictly valid JSON.`;

  const prompt = `Parse this resume and extract key information.

Return JSON:
{
  "name": "Full name",
  "summary": "1-2 sentence professional summary",
  "skills": ["skill1", "skill2", ...max 15 technical skills],
  "email": "email if found",
  "phone": "phone if found"
}

Resume Text:
${text.slice(0, 4000)}`;

  return generateGeminiResponse({ systemInstruction, prompt });
}

/**
 * Profile summary using Gemini API.
 */
export async function geminiApiProfileSummary(profile) {
  const systemInstruction = `You are a career expert. Create a concise professional summary.
Output strictly valid JSON.`;

  const prompt = `Create a professional summary for this candidate.

Return JSON: { "summary": "2-3 sentences", "highlights": ["3 bullet highlights"] }

Data: ${JSON.stringify({ 
  fullName: profile.fullName, 
  role: profile.currentRole, 
  skills: profile.skills, 
  exp: profile.experience 
})}`;

  return generateGeminiResponse({ systemInstruction, prompt });
}

/**
 * Generate personalized learning resources using Gemini API.
 * Returns resources tailored to the user's skill gaps and target career.
 */
export async function geminiApiRecommendResources({ skills, missingSkills, targetCareer, experienceLevel }) {
  const systemInstruction = `You are an expert career learning advisor who curates high-quality, real learning resources.
You recommend actual courses, tutorials, documentation, and practice platforms that exist on the internet.
Only recommend resources from well-known, reputable providers like Coursera, Udemy, freeCodeCamp, Khan Academy, 
Google Developers, MDN Web Docs, LeetCode, HackerRank, Codecademy, edX, Pluralsight, YouTube (specific channels), 
official documentation sites, etc.
Output strictly valid JSON.`;

  const prompt = `Generate 8-12 personalized learning resources for this professional.

Current Skills: ${JSON.stringify(skills ?? [])}
Skills They Need to Learn: ${JSON.stringify(missingSkills ?? [])}
Target Career: ${targetCareer ?? "General Professional Growth"}
Experience Level: ${experienceLevel ?? "Intermediate"}

Rules:
- Prioritize resources that teach the MISSING skills
- Include a mix of: courses, tutorials, documentation, and hands-on practice
- Each resource should target a specific skill gap
- Set priority based on how critical the skill is for the target career
- Use REAL URLs from well-known learning platforms
- Match resource difficulty to the experience level

Return JSON:
{
  "resources": [
    {
      "id": "<unique-slug>",
      "skill": "<skill this resource teaches>",
      "title": "<descriptive resource title>",
      "description": "<2-3 sentence description of what you'll learn>",
      "provider": "<platform name e.g. Coursera, freeCodeCamp>",
      "url": "<real URL to the resource>",
      "level": "Beginner" | "Intermediate" | "Advanced",
      "type": "Course" | "Tutorial" | "Documentation" | "Practice" | "Guide",
      "priority": "High" | "Medium" | "Low",
      "reason": "<why this resource was recommended for this user>"
    }
  ]
}`;

  const result = await generateGeminiResponse({ systemInstruction, prompt });

  // Validate and normalize the response
  const resources = Array.isArray(result.resources) ? result.resources : [];
  return {
    resources: resources.map((r, idx) => ({
      id: r.id || `resource-${idx}`,
      skill: r.skill || "General",
      title: r.title || "Learning Resource",
      description: r.description || "",
      provider: r.provider || "Online",
      url: r.url || "#",
      level: ["Beginner", "Intermediate", "Advanced"].includes(r.level) ? r.level : "Intermediate",
      type: ["Course", "Tutorial", "Documentation", "Practice", "Guide"].includes(r.type) ? r.type : "Course",
      priority: ["High", "Medium", "Low"].includes(r.priority) ? r.priority : "Medium",
      reason: r.reason || "",
    })),
  };
}
