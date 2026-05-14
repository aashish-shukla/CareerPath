
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
  { role: "Data Analyst", skills: ["SQL", "Excel", "Statistics", "Data Visualization", "Python", "Tableau", "Power BI", "Google Analytics", "R", "Pandas"], certs: ["Google Data Analytics", "Microsoft Power BI", "Tableau Desktop Specialist", "IBM Data Analyst"], keywords: ["data-driven", "reporting", "dashboards", "KPIs", "ETL"] },
  { role: "Data Engineer", skills: ["SQL", "Python", "Apache Spark", "Data Pipelines", "Cloud Platforms", "Kafka", "Airflow", "Docker", "PostgreSQL", "Snowflake"], certs: ["AWS Data Analytics", "Google Cloud Professional Data Engineer", "Databricks Certified", "Snowflake SnowPro"], keywords: ["data warehouse", "ETL", "streaming", "batch processing", "data lake"] },
  { role: "Data Scientist", skills: ["Python", "Statistics", "ML Fundamentals", "SQL", "Data Visualization", "TensorFlow", "Scikit-learn", "NumPy", "Pandas", "R"], certs: ["IBM Data Science Professional", "Google Advanced Data Analytics", "AWS Machine Learning Specialty"], keywords: ["predictive modeling", "regression", "NLP", "deep learning", "feature engineering"] },
  { role: "Business Analyst", skills: ["SQL", "Excel", "Requirements Analysis", "Data Visualization", "Communication", "JIRA", "Power BI", "Agile", "Tableau", "Confluence"], certs: ["CBAP", "PMI-PBA", "Microsoft Power BI", "Agile Certified Practitioner"], keywords: ["stakeholder management", "process improvement", "BRD", "user stories", "gap analysis"] },
  { role: "Frontend Engineer", skills: ["JavaScript", "React", "HTML/CSS", "TypeScript", "Accessibility", "Next.js", "Tailwind CSS", "Vue.js", "Redux", "Webpack"], certs: ["Meta Front-End Developer", "Google UX Design", "AWS Cloud Practitioner"], keywords: ["responsive design", "SPA", "component architecture", "web performance", "SEO"] },
  { role: "UI/UX Designer", skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility", "Sketch", "Adobe XD", "CSS", "Typography", "Wireframing"], certs: ["Google UX Design", "Nielsen Norman UX Certification", "HFI Certified Usability Analyst"], keywords: ["user-centered design", "heuristic evaluation", "A/B testing", "information architecture", "design thinking"] },
  { role: "Backend Engineer", skills: ["Python", "Node.js", "SQL", "REST APIs", "System Design", "Docker", "PostgreSQL", "Redis", "MongoDB", "GraphQL"], certs: ["AWS Solutions Architect", "Google Cloud Associate", "MongoDB Certified Developer"], keywords: ["microservices", "API design", "scalability", "caching", "message queues"] },
  { role: "Full Stack Engineer", skills: ["JavaScript", "React", "Node.js", "SQL", "REST APIs", "TypeScript", "MongoDB", "Docker", "Git", "HTML/CSS"], certs: ["Meta Full-Stack Engineer", "AWS Cloud Practitioner", "MongoDB Certified Developer"], keywords: ["end-to-end development", "CI/CD", "full lifecycle", "agile", "DevOps"] },
  { role: "Machine Learning Engineer", skills: ["Python", "ML Fundamentals", "Model Serving", "Data Pipelines", "MLOps", "TensorFlow", "PyTorch", "Docker", "Kubernetes", "SQL"], certs: ["AWS Machine Learning Specialty", "Google ML Engineer", "TensorFlow Developer"], keywords: ["model deployment", "feature store", "experiment tracking", "A/B testing", "distributed training"] },
  { role: "AI Engineer", skills: ["Python", "LLMs", "Prompt Engineering", "Vector Databases", "ML Fundamentals", "LangChain", "RAG", "FastAPI", "Docker", "Cloud Platforms"], certs: ["Google Cloud ML Engineer", "DeepLearning.AI Specialization", "OpenAI API Certified"], keywords: ["generative AI", "embeddings", "fine-tuning", "retrieval augmented generation", "agents"] },
  { role: "DevOps Engineer", skills: ["Docker", "Kubernetes", "CI/CD", "Cloud Platforms", "Linux", "Terraform", "Ansible", "Jenkins", "Git", "Shell Scripting"], certs: ["AWS DevOps Engineer", "CKA", "HashiCorp Terraform Associate", "Docker Certified Associate"], keywords: ["infrastructure as code", "monitoring", "GitOps", "SRE", "observability"] },
  { role: "Cloud Engineer", skills: ["Cloud Platforms", "Terraform", "Networking", "Linux", "Security", "AWS", "Docker", "Kubernetes", "Python", "IAM"], certs: ["AWS Solutions Architect", "Google Cloud Professional", "Azure Administrator", "HashiCorp Terraform Associate"], keywords: ["cloud migration", "multi-cloud", "serverless", "auto-scaling", "cost optimization"] },
  { role: "Mobile Developer", skills: ["React Native", "Flutter", "JavaScript", "Swift", "Kotlin", "TypeScript", "REST APIs", "Firebase", "Git", "UI Design"], certs: ["Google Associate Android Developer", "Meta React Native", "Apple Developer Certification"], keywords: ["cross-platform", "native performance", "app store", "push notifications", "mobile UX"] },
  { role: "Cybersecurity Analyst", skills: ["Network Security", "Linux", "SIEM Tools", "Vulnerability Assessment", "Python", "Firewalls", "Penetration Testing", "OWASP", "Wireshark", "Cryptography"], certs: ["CompTIA Security+", "CEH", "OSCP", "CISSP", "Google Cybersecurity"], keywords: ["threat detection", "incident response", "SOC", "compliance", "zero trust"] },
  { role: "Product Manager", skills: ["Product Strategy", "Data Analysis", "Communication", "Agile", "User Research", "SQL", "JIRA", "A/B Testing", "Roadmapping", "Stakeholder Management"], certs: ["AIPMM CPM", "Scrum Product Owner", "Google Project Management"], keywords: ["product-market fit", "OKRs", "go-to-market", "user personas", "feature prioritization"] },
  { role: "Project Manager", skills: ["Agile", "Scrum", "Communication", "Risk Management", "JIRA", "Confluence", "MS Project", "Budgeting", "Stakeholder Management", "Leadership"], certs: ["PMP", "Scrum Master (CSM)", "PRINCE2", "Google Project Management"], keywords: ["sprint planning", "resource allocation", "change management", "milestones", "Gantt chart"] },
  { role: "QA Engineer", skills: ["Test Automation", "Selenium", "Python", "CI/CD", "API Testing", "Jest", "Cypress", "JIRA", "Git", "Postman"], certs: ["ISTQB Foundation", "AWS Cloud Practitioner", "Certified Selenium Professional"], keywords: ["regression testing", "test coverage", "BDD", "load testing", "quality assurance"] },
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

const COMPANIES = [
  "TCS", "Infosys", "Wipro", "HCL Technologies", "Tech Mahindra",
  "Accenture", "Cognizant", "Capgemini", "IBM India", "Deloitte",
  "Google India", "Microsoft India", "Amazon India", "Flipkart", "Paytm",
  "Swiggy", "Zomato", "PhonePe", "Razorpay", "CRED",
  "Freshworks", "Zoho", "MakeMyTrip", "Ola", "Myntra",
  "Goldman Sachs", "Morgan Stanley", "JP Morgan", "Deutsche Bank", "Barclays",
  "Startup (Series A)", "Startup (Seed)", "Freelance", "Self-employed",
];

const JOB_TITLES_BY_SENIORITY = {
  junior: ["Associate", "Junior Developer", "Trainee", "Intern → Full-time", "Analyst"],
  mid: ["Software Engineer", "Developer", "Engineer", "Specialist", "Consultant"],
  senior: ["Senior Engineer", "Lead Developer", "Tech Lead", "Staff Engineer", "Principal"],
};

const PROJECT_TEMPLATES = [
  { name: "E-commerce Platform", desc: "Full-stack marketplace with payments and order tracking", impact: "10K+ users, ₹5L+ monthly transactions" },
  { name: "Real-time Chat App", desc: "WebSocket-based messaging platform with file sharing", impact: "500+ concurrent users" },
  { name: "ML Pipeline Dashboard", desc: "Automated model training and monitoring dashboard", impact: "Reduced model deployment time by 60%" },
  { name: "Task Management System", desc: "Kanban-style project management tool with team collaboration", impact: "Used by 3 internal teams" },
  { name: "API Gateway Service", desc: "Centralized API gateway with rate limiting and authentication", impact: "Handles 1M+ requests/day" },
  { name: "Data Analytics Platform", desc: "BI dashboard with interactive visualizations and reporting", impact: "Improved reporting speed by 75%" },
  { name: "Mobile Banking App", desc: "Cross-platform banking app with biometric authentication", impact: "50K+ downloads" },
  { name: "Inventory Management", desc: "Automated inventory tracking with barcode scanning", impact: "Reduced stockout by 40%" },
  { name: "CI/CD Pipeline", desc: "End-to-end continuous integration and deployment pipeline", impact: "Deploy frequency: 10x improvement" },
  { name: "Portfolio Website", desc: "Personal portfolio with blog and project showcase", impact: "500+ monthly visitors" },
];

const HIGHLIGHTS = [
  "Increased API throughput by {n}% through query optimization",
  "Led migration of {n} microservices to Kubernetes",
  "Reduced page load time by {n}% using lazy loading",
  "Built automated testing suite covering {n}% of codebase",
  "Mentored team of {n} junior developers",
  "Delivered project {n} weeks ahead of schedule",
  "Reduced infrastructure costs by {n}% through optimization",
  "Implemented CI/CD pipeline reducing deploy time by {n}%",
  "Processed {n}K+ daily transactions with 99.9% uptime",
  "Designed data pipeline handling {n}GB daily throughput",
  "Improved model accuracy from {n1}% to {n2}%",
  "Managed cross-functional team of {n} members",
  "Automated {n} manual processes saving 20+ hours/week",
  "Resolved {n}+ production incidents with <30min MTTR",
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
  const weights = [0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 6, 7, 8, 10, 12, 15];
  return pick(weights);
}

function randomAtsScore() {
  const base = 30 + Math.random() * 40 + Math.random() * 20 + Math.random() * 10;
  return Math.max(15, Math.min(95, Math.round(base)));
}

function randomReadiness(skillCount, expYears) {
  const base = (skillCount / 10) * 40 + (expYears / 10) * 30 + Math.random() * 30;
  return Math.max(10, Math.min(95, Math.round(base)));
}

function generateHighlight() {
  const template = pick(HIGHLIGHTS);
  return template
    .replace("{n}", rand(10, 80))
    .replace("{n1}", rand(65, 80))
    .replace("{n2}", rand(82, 96));
}

function seniorityFromYears(years) {
  if (years >= 6) return "Senior";
  if (years >= 3) return "Mid-Level";
  return "Junior";
}

function generateWorkHistory(career, expYears) {
  if (expYears === 0) return [];
  const jobCount = Math.min(expYears <= 2 ? 1 : expYears <= 5 ? rand(1, 2) : rand(2, 4), 4);
  const jobs = [];
  let currentYear = 2026;

  for (let i = 0; i < jobCount; i++) {
    const duration = i === 0 ? rand(1, Math.max(1, expYears - (jobCount - 1))) : rand(1, 3);
    const seniority = i === 0 ? seniorityFromYears(expYears) : (i === jobCount - 1 ? "junior" : "mid");
    const titlePool = JOB_TITLES_BY_SENIORITY[seniority] ?? JOB_TITLES_BY_SENIORITY.mid;
    const startYear = currentYear - duration;
    
    jobs.push({
      title: `${pick(titlePool)} — ${career.role}`,
      company: pick(COMPANIES),
      location: pick(["Bangalore", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Chennai", "Remote"]),
      startDate: `${startYear}-${String(rand(1, 12)).padStart(2, "0")}`,
      endDate: i === 0 ? "Present" : `${currentYear}-${String(rand(1, 12)).padStart(2, "0")}`,
      highlights: Array.from({ length: rand(1, 3) }, () => generateHighlight()),
    });
    currentYear = startYear;
  }
  return jobs;
}

function generateProjects(career, skills) {
  const count = rand(0, 3);
  if (count === 0) return [];
  return pickN(PROJECT_TEMPLATES, count).map(tmpl => ({
    name: tmpl.name,
    description: tmpl.desc,
    technologies: pickN(skills, rand(2, 4)),
    impact: tmpl.impact,
  }));
}

function generateProfile(index) {
  const career = pick(CAREERS);
  const expYears = randomExperience();
  const skillCount = rand(3, Math.min(10, career.skills.length));
  const skills = pickN(career.skills, skillCount);
  const atsScore = randomAtsScore();
  const readiness = randomReadiness(skillCount, expYears);
  const hasResume = Math.random() > 0.2; // 80% have a resume
  const gradYear = 2026 - expYears - rand(0, 4);
  const fullName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
  const institution = pick(INSTITUTIONS);
  const educationField = pick(EDUCATION_FIELDS);
  const educationLevel = pick(EDUCATION_LEVELS);

  // Deep-parsed resume data
  const workHistory = generateWorkHistory(career, expYears);
  const certCount = Math.random() > 0.4 ? rand(1, 3) : 0; // 60% have certs
  const certifications = certCount > 0 ? pickN(career.certs ?? [], certCount) : [];
  const projects = generateProjects(career, skills);
  const keywords = pickN(career.keywords ?? [], rand(2, 5));
  const seniority = seniorityFromYears(expYears);
  const hasGpa = Math.random() > 0.5;
  const gpa = hasGpa ? `${(rand(65, 95) / 10).toFixed(1)}/10` : "";
  const hasLinkedIn = Math.random() > 0.3; // 70%
  const hasGitHub = Math.random() > 0.5; // 50%
  const links = [
    ...(hasLinkedIn ? [`https://linkedin.com/in/${fullName.toLowerCase().replace(/\s+/g, "-")}`] : []),
    ...(hasGitHub ? [`https://github.com/${fullName.split(" ")[0].toLowerCase()}`] : []),
  ];

  // Build realistic extractedText
  const resumeLines = [
    fullName,
    `${fullName.split(" ")[0].toLowerCase()}@email.com | +91-${rand(70000, 99999)}${rand(10000, 99999)}`,
    links.join(" | "),
    "",
    `PROFESSIONAL SUMMARY`,
    `${seniority} ${career.role} with ${expYears} years of experience. Skilled in ${skills.slice(0, 5).join(", ")}.`,
    "",
    "WORK EXPERIENCE",
    ...workHistory.flatMap(j => [
      `${j.title} at ${j.company} (${j.startDate} – ${j.endDate})`,
      ...j.highlights.map(h => `  • ${h}`),
      "",
    ]),
    "EDUCATION",
    `${educationLevel} in ${educationField}, ${institution} (${gradYear})${gpa ? ` — CGPA: ${gpa}` : ""}`,
    "",
    ...(certifications.length > 0 ? ["CERTIFICATIONS", ...certifications.map(c => `  • ${c}`), ""] : []),
    "SKILLS",
    skills.join(", "),
    "",
    ...(projects.length > 0 ? ["PROJECTS", ...projects.map(p => `  • ${p.name}: ${p.description} [${p.technologies.join(", ")}]`), ""] : []),
  ];
  const extractedText = resumeLines.join("\n");

  // Compute highlight count for ATS detail scoring
  const highlightCount = workHistory.reduce((acc, j) => acc + j.highlights.length, 0);

  const seedHex = crypto.createHash("md5").update(`seed-profile-${index}`).digest("hex").slice(0, 24);
  const fakeUserId = new mongoose.Types.ObjectId(seedHex);

  return {
    userId: fakeUserId,
    fullName,
    currentRole: expYears > 0 ? `${expYears > 5 ? "Senior " : ""}${pick(["Software Engineer", "Developer", "Analyst", "Associate", "Consultant", career.role])}` : "Fresher",
    targetRole: career.role,
    education: {
      level: educationLevel,
      field: educationField,
      institution,
      graduationYear: gradYear,
    },
    experience: {
      years: expYears,
      summary: expYears > 0 ? `${expYears} years of experience in ${career.role.toLowerCase()} domain.` : "",
    },
    skills,
    resume: hasResume ? {
      extractedText,
      parsed: {
        name: fullName,
        email: `${fullName.split(" ")[0].toLowerCase()}@email.com`,
        phone: `+91-${rand(70000, 99999)}${rand(10000, 99999)}`,
        location: pick(["Bangalore", "Hyderabad", "Mumbai", "Pune", "Delhi NCR", "Chennai"]),
        links,
        summary: `${seniority} ${career.role} with ${expYears} years of experience in ${skills.slice(0, 3).join(", ")}.`,
        skills,
        experience: workHistory,
        education: [{
          degree: `${educationLevel} in ${educationField}`,
          institution,
          graduationYear: gradYear,
          gpa,
        }],
        certifications,
        projects,
        keywords,
        totalYearsExperience: expYears,
        seniorityLevel: seniority,
      },
      atsScore: {
        score: atsScore,
        breakdown: {
          keywordMatch: rand(20, 90),
          impact: rand(10, 80),
          formatting: rand(40, 95),
          brevity: rand(30, 95),
          sectionCompleteness: rand(25, 100),
        },
        strengths: [
          ...(skillCount >= 6 ? ["Diverse skill set"] : []),
          ...(certifications.length > 0 ? [`${certifications.length} certification(s)`] : []),
          ...(highlightCount >= 3 ? ["Quantified achievements"] : []),
          ...(links.length > 0 ? ["Professional links included"] : []),
          "Profile documented",
        ],
        improvements: [
          ...(skillCount < 6 ? ["Add more technical skills"] : []),
          ...(certifications.length === 0 ? ["Add certifications"] : []),
          ...(projects.length === 0 ? ["Showcase projects"] : []),
          "Add more detail",
        ],
        keywordGaps: [`Target role: ${career.role}`, ...(keywords.length < 3 ? ["Add industry keywords"] : [])],
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
    _isSeedData: true,
  };
}

// ── Main ────────────────────────────────────────────
async function main() {
  console.log("🔌 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;
  const collection = db.collection("profiles");

  const deleteResult = await collection.deleteMany({ _isSeedData: true });
  if (deleteResult.deletedCount > 0) {
    console.log(`🗑️  Cleaned ${deleteResult.deletedCount} previous seed profiles`);
  }

  const TOTAL = 1000;
  const profiles = [];
  console.log(`⚙️  Generating ${TOTAL} synthetic profiles with deep resume data...`);

  for (let i = 0; i < TOTAL; i++) {
    profiles.push(generateProfile(i));
  }

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

  // Stats
  const roleDistribution = {};
  const expDistribution = { "0-1": 0, "2-3": 0, "4-5": 0, "6-8": 0, "9+": 0 };
  let totalSkills = 0, totalAts = 0, atsCount = 0;
  let withCerts = 0, withProjects = 0, withWorkHistory = 0;

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
    if (p.resume?.parsed?.certifications?.length > 0) withCerts++;
    if (p.resume?.parsed?.projects?.length > 0) withProjects++;
    if (p.resume?.parsed?.experience?.length > 0) withWorkHistory++;
  }

  console.log("📈 Distribution Summary:");
  console.log("─".repeat(50));
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
  console.log(`With Certifications: ${Math.round(withCerts / TOTAL * 100)}%`);
  console.log(`With Projects: ${Math.round(withProjects / TOTAL * 100)}%`);
  console.log(`With Work History: ${Math.round(withWorkHistory / TOTAL * 100)}%`);

  console.log("\n✅ Done! Peer comparison now has deep resume data.");
  console.log("💡 To remove seed data later: db.profiles.deleteMany({ _isSeedData: true })");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
