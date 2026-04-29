import { env } from "../config/env.js";
import { Profile } from "../models/Profile.js";
import { logger } from "../utils/logger.js";

/**
 * Fetch live job listings from JSearch API (RapidAPI).
 * Calculates skill match % for authenticated users.
 */
export async function listJobs(req, res) {
  const { q, page, remote_only } = req.query;
  const pageNum = Math.max(1, parseInt(page, 10) || 1);

  // Get user profile for skill matching (if authenticated)
  let userSkills = [];
  let targetRole = "";
  if (req.user) {
    try {
      const profile = await Profile.findOne({ userId: req.user.sub });
      if (profile) {
        userSkills = (profile.skills ?? []).map((s) => s.toLowerCase());
        targetRole = profile.targetRole ?? profile.cachedRecommendations?.top?.career_title ?? "";
      }
    } catch (err) {
      logger.warn("[Jobs] Failed to load user profile:", err?.message);
    }
  }

  // Build search query — use explicit query or user's target role
  const searchQuery = (q ?? targetRole ?? "software engineer").toString().trim();

  if (!searchQuery) {
    return res.json({ jobs: [], query: "", totalResults: 0, page: pageNum });
  }

  // If no API key, return helpful message
  if (!env.JSEARCH_API_KEY) {
    logger.info("[Jobs] No JSEARCH_API_KEY configured — returning instructions");
    return res.json({
      jobs: [],
      query: searchQuery,
      totalResults: 0,
      page: pageNum,
      hint: "Add JSEARCH_API_KEY to your .env to enable live job listings. Get a free key at https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch",
    });
  }

  try {
    const params = new URLSearchParams({
      query: `${searchQuery} in India`,
      page: String(pageNum),
      num_pages: "1",
      date_posted: "month",
    });
    if (remote_only === "1" || remote_only === "true") {
      params.set("remote_jobs_only", "true");
    }

    const url = `https://jsearch.p.rapidapi.com/search?${params}`;
    logger.info(`[Jobs] Fetching: ${searchQuery} (page ${pageNum})`);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": env.JSEARCH_API_KEY,
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      logger.error(`[Jobs] API error ${response.status}: ${errText.slice(0, 200)}`);
      throw new Error(`JSearch API returned ${response.status}`);
    }

    const data = await response.json();
    const rawJobs = data.data ?? [];

    // Transform and calculate match scores
    const jobs = rawJobs.map((job) => {
      const requiredSkills = extractSkillsFromText(
        `${job.job_title} ${job.job_description ?? ""}`.slice(0, 2000)
      );

      // Calculate match percentage
      let matchScore = null;
      let matchedSkills = [];
      let missingSkills = [];

      if (userSkills.length > 0 && requiredSkills.length > 0) {
        matchedSkills = requiredSkills.filter((s) =>
          userSkills.some((us) => us === s.toLowerCase() || us.includes(s.toLowerCase()) || s.toLowerCase().includes(us))
        );
        missingSkills = requiredSkills.filter((s) => !matchedSkills.includes(s));
        matchScore = Math.round((matchedSkills.length / requiredSkills.length) * 100);
      }

      return {
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        companyLogo: job.employer_logo,
        location: job.job_city
          ? `${job.job_city}, ${job.job_state ?? job.job_country}`
          : job.job_country ?? "Remote",
        isRemote: job.job_is_remote ?? false,
        type: job.job_employment_type ?? "Full-time",
        postedAt: job.job_posted_at_datetime_utc,
        applyUrl: job.job_apply_link,
        description: (job.job_description ?? "").slice(0, 500),
        salary: job.job_min_salary && job.job_max_salary
          ? `${formatSalary(job.job_min_salary)} - ${formatSalary(job.job_max_salary)} ${job.job_salary_currency ?? ""} / ${job.job_salary_period ?? "year"}`
          : null,
        publisher: job.job_publisher ?? null,
        requiredSkills,
        matchScore,
        matchedSkills,
        missingSkills,
      };
    });

    // Sort by match score (best first) if user is authenticated
    if (userSkills.length > 0) {
      jobs.sort((a, b) => (b.matchScore ?? -1) - (a.matchScore ?? -1));
    }

    return res.json({
      jobs,
      query: searchQuery,
      totalResults: jobs.length,
      page: pageNum,
      personalized: userSkills.length > 0,
    });
  } catch (err) {
    logger.error("[Jobs] Error:", err?.message ?? err);
    return res.status(502).json({
      jobs: [],
      query: searchQuery,
      totalResults: 0,
      page: pageNum,
      error: "Failed to fetch job listings. Please try again later.",
    });
  }
}

/**
 * Extract skill keywords from job text using pattern matching.
 */
const KNOWN_SKILLS = [
  "JavaScript", "TypeScript", "React", "Angular", "Vue", "Node.js", "Express",
  "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C++", "C#",
  "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "Flutter",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "DynamoDB", "GraphQL",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Jenkins",
  "CI/CD", "Linux", "Git", "REST API", "Microservices",
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP",
  "Data Analysis", "Pandas", "NumPy", "Tableau", "Power BI", "Excel",
  "Figma", "HTML", "CSS", "Sass", "Tailwind", "Next.js",
  "React Native", "Selenium", "Cypress", "Jest", "Agile", "Scrum",
  "System Design", "Data Structures", "Algorithms",
];

function extractSkillsFromText(text) {
  if (!text) return [];
  const textLower = text.toLowerCase();
  return KNOWN_SKILLS.filter((skill) => textLower.includes(skill.toLowerCase()));
}

function formatSalary(amount) {
  if (!amount) return "";
  if (amount >= 100000) return `${Math.round(amount / 100000)}L`;
  if (amount >= 1000) return `${Math.round(amount / 1000)}K`;
  return String(amount);
}
