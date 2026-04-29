
import mongoose from "mongoose";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI not found in .env");
  process.exit(1);
}

// ── Career & Skill Pools ────────────────────────────────
const CAREERS = [
  { role: "Data Analyst", skills: ["SQL", "Excel", "Statistics", "Data Visualization", "Python", "Tableau", "Power BI", "Google Analytics", "R", "Pandas"] },
  { role: "Data Engineer", skills: ["SQL", "Python", "Apache Spark", "Data Pipelines", "Cloud Platforms", "Kafka", "Airflow", "Docker", "PostgreSQL", "Snowflake"] },
  { role: "Data Scientist", skills: ["Python", "Statistics", "ML Fundamentals", "SQL", "Data Visualization", "TensorFlow", "Scikit-learn", "NumPy", "Pandas", "R"] },
  { role: "Business Analyst", skills: ["SQL", "Excel", "Requirements Analysis", "Data Visualization", "Communication", "JIRA", "Power BI", "Agile", "Tableau", "Confluence"] },
  { role: "Frontend Engineer", skills: ["JavaScript", "React", "HTML/CSS", "TypeScript", "Accessibility", "Next.js", "Tailwind CSS", "Vue.js", "Redux", "Webpack"] },
  { role: "UI/UX Designer", skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility", "Sketch", "Adobe XD", "CSS", "Typography", "Wireframing"] },
  { role: "Backend Engineer", skills: ["Python", "Node.js", "SQL", "REST APIs", "System Design", "Docker", "PostgreSQL", "Redis", "MongoDB", "GraphQL"] },
  { role: "Full Stack Engineer", skills: ["JavaScript", "React", "Node.js", "SQL", "REST APIs", "TypeScript", "MongoDB", "Docker", "Git", "HTML/CSS"] },
  { role: "Machine Learning Engineer", skills: ["Python", "ML Fundamentals", "Model Serving", "Data Pipelines", "MLOps", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "SQL"] },
  { role: "AI Engineer", skills: ["Python", "LLMs", "Prompt Engineering", "Vector Databases", "ML Fundamentals", "LangChain", "RAG", "FastAPI", "Docker", "Cloud Platforms"] },
  { role: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD", "Cloud Platforms", "Linux", "Terraform", "Ansible", "Jenkins", "Git", "Shell Scripting"] },
  { role: "Cloud Engineer", skills: ["Cloud Platforms", "Terraform", "Networking", "Linux", "Security", "AWS", "Docker", "Kubernetes", "Python", "IAM"] },
  { role: "Mobile Developer", skills: ["React Native", "Flutter", "JavaScript", "Swift", "Kotlin", "TypeScript", "REST APIs", "Firebase", "Git", "UI Design"] },
  { role: "Cybersecurity Analyst", skills: ["Network Security", "Linux", "SIEM Tools", "Vulnerability Assessment", "Python", "Firewalls", "Penetration Testing", "OWASP", "Wireshark", "Cryptography"] },
  { role: "Product Manager", skills: ["Product Strategy", "Data Analysis", "Communication", "Agile", "User Research", "SQL", "JIRA", "A/B Testing", "Roadmapping", "Stakeholder Management"] },
  { role: "Project Manager", skills: ["Agile", "Scrum", "Communication", "Risk Management", "JIRA", "Confluence", "MS Project", "Budgeting", "Stakeholder Management", "Leadership"] },
  { role: "QA Engineer", skills: ["Test Automation", "Selenium", "Python", "CI/CD", "API Testing", "Jest", "Cypress", "JIRA", "Git", "Postman"] },
];

const EDUCATION_LEVELS = ["High School", "Bachelor's", "Bachelor's", "Bachelor's", "Master's", "Master's", "PhD"];
const EDUCATION_FIELDS = [
  "Computer Science", "Information Technology", "Software Engineering", "Data Science",
  "Electronics", "Mathematics", "Statistics", "Business Administration",
  "Mechanical Engineering", "Physics", "Commerce", "Economics",
];
const INSTITUTIONS = [
  "IIT Delhi", "IIT Bombay", "IIT Madras", "NIT Trichy", "BITS Pilani",
  "DTU", "NSUT", "VIT Vellore", "SRM Chennai", "Manipal University",
  "Mumbai University", "Pune University", "Anna University", "Jadavpur University",
  "IIIT Hyderabad", "IIIT Bangalore", "COEP Pune", "PEC Chandigarh",
  "Amity University", "LPU Punjab", "Christ University", "Symbiosis Pune",
];

const FIRST_NAMES = [
  "Aarav", "Aditi", "Aisha", "Akash", "Ananya", "Arjun", "Avni", "Dev", "Diya", "Gaurav",
  "Ishaan", "Isha", "Kavya", "Karan", "Meera", "Neha", "Nikhil", "Pooja", "Pranav", "Priya",
  "Rahul", "Riya", "Rohan", "Sakshi", "Samar", "Shreya", "Siddharth", "Sneha", "Tanvi", "Varun",
  "Vikram", "Yash", "Zara", "Aditya", "Bhavna", "Chirag", "Deepa", "Esha", "Farhan", "Gauri",
  "Harsh", "Ira", "Jay", "Kriti", "Lakshmi", "Manish", "Nisha", "Om", "Pallavi", "Raj",
];
const LAST_NAMES = [
  "Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Joshi", "Mehta", "Verma",
  "Rao", "Iyer", "Shah", "Bhatia", "Chopra", "Desai", "Menon", "Banerjee", "Pillai", "Tiwari",
  "Agarwal", "Mishra", "Kapoor", "Malhotra", "Saxena", "Goyal", "Chauhan", "Pandey", "Srivastava", "Thakur",
];

// ── Helper Functions ────────────────────────────────
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

// Realistic bell-curve distribution for experience
function randomExperience() {
  // Weighted: more juniors than seniors
  const weights = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 10, 12, 15];
  return pick(weights);
}

// Generate realistic ATS score (bell curve around 55-65)
function randomAtsScore() {
  // Normal-ish distribution centered around 58
  const base = 30 + Math.random() * 40 + Math.random() * 20 + Math.random() * 10;
  return Math.max(15, Math.min(95, Math.round(base)));
}

// Generate realistic readiness score based on skills and experience
function randomReadiness(skillCount, expYears) {
  const base = (skillCount / 10) * 40 + (expYears / 10) * 30 + Math.random() * 30;
  return Math.max(10, Math.min(95, Math.round(base)));
}

function generateProfile(index) {
  const career = pick(CAREERS);
  const expYears = randomExperience();
  const skillCount = rand(2, Math.min(10, career.skills.length));
  const skills = pickN(career.skills, skillCount);
  const atsScore = randomAtsScore();
  const readiness = randomReadiness(skillCount, expYears);
  const hasResume = Math.random() > 0.25; // 75% have a resume
  const gradYear = 2026 - expYears - rand(0, 4);

  // Create a fake ObjectId that won't collide with real users
  // Use a deterministic seed so re-running replaces the same docs
  const seedHex = crypto.createHash("md5").update(`seed-profile-${index}`).digest("hex").slice(0, 24);
  const fakeUserId = new mongoose.Types.ObjectId(seedHex);

  return {
    userId: fakeUserId,
    fullName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
    currentRole: expYears > 0 ? `${expYears > 5 ? "Senior " : ""}${pick(["Software Engineer", "Developer", "Analyst", "Associate", "Consultant", career.role])}` : "Fresher",
    targetRole: career.role,
    education: {
      level: pick(EDUCATION_LEVELS),
      field: pick(EDUCATION_FIELDS),
      institution: pick(INSTITUTIONS),
      graduationYear: gradYear,
    },
    experience: {
      years: expYears,
      summary: expYears > 0 ? `${expYears} years of experience in ${career.role.toLowerCase()} domain.` : "",
    },
    skills,
    resume: hasResume ? {
      extractedText: `Professional with ${expYears} years of experience. Skills: ${skills.join(", ")}.`,
      atsScore: {
        score: atsScore,
        breakdown: {
          keywordMatch: rand(20, 90),
          impact: rand(10, 80),
          formatting: rand(40, 95),
          brevity: rand(30, 95),
          sectionCompleteness: rand(25, 100),
        },
        strengths: ["Profile documented"],
        improvements: ["Add more detail"],
        keywordGaps: [`Target role: ${career.role}`],
      },
    } : undefined,
    cachedSkillGap: {
      readiness_score: readiness,
      missing: career.skills.filter((s) => !skills.includes(s)).slice(0, 3).map((s) => ({ skill: s, priority: "Medium", difficulty: "Medium", estimated_weeks: 4 })),
      strengths: skills,
      generatedAt: new Date(Date.now() - rand(0, 7 * 24 * 60 * 60 * 1000)),
    },
    cachedRecommendations: {
      careerMatchScore: rand(25, 85),
      top: { career_id: career.role.toLowerCase().replace(/\s+/g, "-").replace(/\//g, "-"), career_title: career.role },
      recommendations: [],
      generatedAt: new Date(Date.now() - rand(0, 7 * 24 * 60 * 60 * 1000)),
    },
    needsRegeneration: false,
    _isSeedData: true, // Flag to identify synthetic data for easy cleanup
  };
}

// ── Main ────────────────────────────────────────────
async function main() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;
  const collection = db.collection("profiles");

  // Clean up previous seed data
  const deleteResult = await collection.deleteMany({ _isSeedData: true });
  if (deleteResult.deletedCount > 0) {
    console.log(`🗑️  Cleaned ${deleteResult.deletedCount} previous seed profiles`);
  }

  // Generate 1000 profiles
  const TOTAL = 1000;
  const profiles = [];
  console.log(`⚙️  Generating ${TOTAL} synthetic profiles...`);

  for (let i = 0; i < TOTAL; i++) {
    profiles.push(generateProfile(i));
  }

  // Insert in batches of 200
  const BATCH_SIZE = 200;
  let inserted = 0;
  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);
    await collection.insertMany(batch, { ordered: false });
    inserted += batch.length;
    const pct = Math.round((inserted / TOTAL) * 100);
    process.stdout.write(`\r📊 Inserted ${inserted}/${TOTAL} (${pct}%)`);
  }

  console.log("\n");

  // Print distribution stats
  const roleDistribution = {};
  const expDistribution = { "0-1": 0, "2-3": 0, "4-5": 0, "6-8": 0, "9+": 0 };
  let totalSkills = 0;
  let totalAts = 0;
  let atsCount = 0;

  for (const p of profiles) {
    roleDistribution[p.targetRole] = (roleDistribution[p.targetRole] || 0) + 1;
    const y = p.experience.years;
    if (y <= 1) expDistribution["0-1"]++;
    else if (y <= 3) expDistribution["2-3"]++;
    else if (y <= 5) expDistribution["4-5"]++;
    else if (y <= 8) expDistribution["6-8"]++;
    else expDistribution["9+"]++;
    totalSkills += p.skills.length;
    if (p.resume?.atsScore?.score) {
      totalAts += p.resume.atsScore.score;
      atsCount++;
    }
  }

  console.log("📈 Distribution Summary:");
  console.log("─".repeat(40));
  console.log("\nTarget Roles:");
  Object.entries(roleDistribution)
    .sort((a, b) => b[1] - a[1])
    .forEach(([role, count]) => {
      console.log(`  ${role.padEnd(25)} ${count} (${Math.round(count / 10)}%)`);
    });

  console.log("\nExperience:");
  Object.entries(expDistribution).forEach(([range, count]) => {
    console.log(`  ${range.padEnd(10)} ${"█".repeat(Math.round(count / 20))} ${count}`);
  });

  console.log(`\nAvg Skills: ${(totalSkills / TOTAL).toFixed(1)}`);
  console.log(`Avg ATS Score: ${atsCount > 0 ? Math.round(totalAts / atsCount) : "N/A"}`);
  console.log(`Resume Upload Rate: ${profiles.filter(p => p.resume).length / 10}%`);

  console.log("\n✅ Done! Peer comparison now has real-scale data.");
  console.log("💡 To remove seed data later: db.profiles.deleteMany({ _isSeedData: true })");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
