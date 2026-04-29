import axios from "axios";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

async function generateOllamaResponse({ systemInstruction, prompt }) {
  try {
    logger.info(`[Ollama] Generating structured response with model: ${env.OLLAMA_MODEL}`);
    const response = await axios.post(`${env.OLLAMA_BASE_URL}/api/generate`, {
      model: env.OLLAMA_MODEL,
      system: systemInstruction,
      prompt: prompt,
      stream: false,
      format: "json",
      options: {
        temperature: 0.1, // Lower temperature for more deterministic/faster output
        num_predict: 512,  // Limit tokens for speed
      }
    });

    const text = response.data?.response;
    if (!text) {
      throw new HttpError(500, "Ollama response generation failed");
    }

    logger.info(`[Ollama] Received JSON response (${text.length} chars)`);
    try {
        return JSON.parse(text);
    } catch (_e) {
        logger.warn("[Ollama] JSON parse failed, attempting regex match");
        // Fallback if the model didn't strictly follow JSON format despite the flag
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new HttpError(500, "Failed to parse Ollama JSON response");
    }
  } catch (err) {
    logger.error("Ollama Error:", err?.response?.data || err.message);
    throw new HttpError(err.status || 500, `AI Service Error: ${err.message}`);
  }
}

export async function geminiProfileSummary(profile) {
  const systemInstruction =
    "Career expert. Summarize profile for a career app. Output strictly JSON.";
  const prompt = `
    Return JSON: { "summary": "2-3 sentences", "highlights": ["3 bullets"] }.
    Data: ${JSON.stringify({ fullName: profile.fullName, role: profile.currentRole, skills: profile.skills, exp: profile.experience })}
  `;
  return generateOllamaResponse({ systemInstruction, prompt });
}

export async function geminiParseResume({ text }) {
  const systemInstruction =
    "Resume insight extractor. Extract only top skills and professional bio. Output strictly JSON.";
  const prompt = `
    Analyze the following resume text and extract ONLY the skill list and a 1-sentence bio.
    Return JSON:
    {
      "name": "Full legal name if found",
      "summary": "1-sentence professional summary",
      "skills": ["Array of top 12 technical skills found"]
    }
    Resume Text (truncated): ${text.slice(0, 3500)}
  `;
  return generateOllamaResponse({ systemInstruction, prompt });
}

export async function geminiRecommendCareers({ profile, careers }) {
  const systemInstruction =
    "You are a strict and critical Career Guidance Expert. Do not give over-optimistic scores. Grant high scores ONLY for near-perfect matches. A 100% score is reserved for people with precisely the right skills and years of experience.";
  const prompt = `
    Analyze this professional profile and determine the 4 best matching careers from the list provided.
    Be conservative with confidence levels (0.0 - 1.0).
    
    Data: ${JSON.stringify({ skills: profile.skills, exp: profile.experience, summary: profile.profileSummary })}
    List: ${JSON.stringify(careers.map(c => ({ id: c.id, title: c.title, skills: c.topSkills })))}

    Return strictly JSON:
    {
      "career_match_score": (Integer 0-100, be strict),
      "top": { "career_id": "...", "career_title": "...", "confidence": (0.0-1.0), "reason": "Detailed expert reason" },
      "recommendations": [
         { "career_id": "...", "career_title": "...", "confidence": (0.0-1.0), "reason": "..." }
      ]
    }
  `;
  return generateOllamaResponse({ systemInstruction, prompt });
}

export async function geminiSkillGap({ profile, targetCareer }) {
  const systemInstruction =
    "Skill gap analyst. Compare profile to target career. Output strictly JSON.";
  const prompt = `
    Return JSON:
    {
      "readiness_score": 0-100,
      "missing": [{ "skill", "priority": "High"|"Med"|"Low", "difficulty": "E"|"M"|"H", "estimated_weeks": int }],
      "strengths": ["string"],
      "notes": "string"
    }
    Profile: ${JSON.stringify(profile.skills)}
    Target: ${JSON.stringify(targetCareer?.topSkills)}
  `;
  return generateOllamaResponse({ systemInstruction, prompt });
}

export async function geminiAtsScore({ resumeText, targetRole }) {
  const systemInstruction =
    "Critical and strict ATS Simulator. Evaluate resume vs role with high standards. Be realistic, few resumes score above 85. Output strictly JSON.";
  const prompt = `
    Evaluate resume for role: ${targetRole}
    Return JSON:
    {
      "score": 0-100,
      "breakdown": { "keywordMatch": 0-100, "impact": 0-100, "formatting": 0-100, "brevity": 0-100, "sectionCompleteness": 0-100 },
      "strengths": ["string"],
      "improvements": ["string"],
      "keywordGaps": ["string"]
    }
    Resume: ${resumeText.slice(0, 3000)}
  `;
  return generateOllamaResponse({ systemInstruction, prompt });
}

export async function geminiRecommendResources({ skills, missingSkills, targetCareer, experienceLevel }) {
  const systemInstruction =
    "Career learning advisor. Recommend real learning resources from well-known platforms. Output strictly JSON.";
  const prompt = `
    Generate 8-10 learning resources for someone with these skills: ${JSON.stringify(skills ?? [])}
    who needs to learn: ${JSON.stringify(missingSkills ?? [])}
    for the career: ${targetCareer ?? "General"}
    Experience: ${experienceLevel ?? "Intermediate"}

    Return JSON:
    {
      "resources": [
        { "id": "slug", "skill": "skill name", "title": "title", "description": "desc",
          "provider": "platform", "url": "real url", "level": "Beginner|Intermediate|Advanced",
          "type": "Course|Tutorial|Documentation|Practice|Guide",
          "priority": "High|Medium|Low", "reason": "why recommended" }
      ]
    }
  `;
  return generateOllamaResponse({ systemInstruction, prompt });
}
