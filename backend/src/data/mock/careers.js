/**
 * Production career catalog — kept in sync with ml-service/app/data/mock_data.py
 */
export const careers = [
  // ── Data & Analytics ──────────────────────────────
  {
    id: "data-analyst",
    title: "Data Analyst",
    description: "Turn raw data into clear insights using SQL, spreadsheets, BI tools, and statistical thinking.",
    topSkills: ["SQL", "Excel", "Statistics", "Data Visualization", "Python"],
    salaryRange: { min: 6, max: 14, unit: "LPA" },
    demandTrend: [52, 54, 56, 59, 62, 66, 70, 73, 76, 79, 82, 86],
  },
  {
    id: "data-engineer",
    title: "Data Engineer",
    description: "Design, build, and maintain scalable data pipelines and warehouses for analytics and ML workloads.",
    topSkills: ["SQL", "Python", "Apache Spark", "Data Pipelines", "Cloud Platforms"],
    salaryRange: { min: 10, max: 24, unit: "LPA" },
    demandTrend: [48, 51, 54, 57, 60, 63, 66, 69, 72, 76, 80, 84],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    description: "Extract insights from complex datasets using statistics, ML models, and domain expertise.",
    topSkills: ["Python", "Statistics", "ML Fundamentals", "SQL", "Data Visualization"],
    salaryRange: { min: 8, max: 22, unit: "LPA" },
    demandTrend: [50, 52, 55, 58, 61, 64, 67, 70, 73, 76, 79, 83],
  },
  {
    id: "business-analyst",
    title: "Business Analyst",
    description: "Bridge business needs and technical solutions through data-driven requirements and process optimization.",
    topSkills: ["SQL", "Excel", "Requirements Analysis", "Data Visualization", "Communication"],
    salaryRange: { min: 5, max: 16, unit: "LPA" },
    demandTrend: [55, 57, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76],
  },

  // ── Frontend & UI ─────────────────────────────────
  {
    id: "frontend-engineer",
    title: "Frontend Engineer",
    description: "Build delightful, accessible user experiences using modern web frameworks and design systems.",
    topSkills: ["JavaScript", "React", "HTML/CSS", "TypeScript", "Accessibility"],
    salaryRange: { min: 7, max: 18, unit: "LPA" },
    demandTrend: [58, 60, 63, 66, 68, 71, 74, 76, 78, 81, 83, 85],
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    description: "Create intuitive, beautiful interfaces grounded in user research and interaction design principles.",
    topSkills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"],
    salaryRange: { min: 5, max: 18, unit: "LPA" },
    demandTrend: [50, 52, 55, 58, 60, 63, 66, 68, 71, 73, 76, 79],
  },

  // ── Backend & Full-Stack ──────────────────────────
  {
    id: "backend-engineer",
    title: "Backend Engineer",
    description: "Build scalable server-side applications, APIs, and microservices with robust databases and caching.",
    topSkills: ["Python", "Node.js", "SQL", "REST APIs", "System Design"],
    salaryRange: { min: 8, max: 22, unit: "LPA" },
    demandTrend: [56, 58, 61, 64, 66, 69, 72, 74, 77, 80, 82, 85],
  },
  {
    id: "fullstack-engineer",
    title: "Full Stack Engineer",
    description: "Develop end-to-end web applications spanning frontend UI, backend logic, and database layers.",
    topSkills: ["JavaScript", "React", "Node.js", "SQL", "REST APIs"],
    salaryRange: { min: 8, max: 22, unit: "LPA" },
    demandTrend: [54, 56, 59, 62, 65, 68, 71, 73, 76, 79, 82, 84],
  },

  // ── AI & Machine Learning ─────────────────────────
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    description: "Train, deploy, and monitor ML models while collaborating with product and data teams.",
    topSkills: ["Python", "ML Fundamentals", "Model Serving", "Data Pipelines", "MLOps"],
    salaryRange: { min: 10, max: 28, unit: "LPA" },
    demandTrend: [44, 46, 49, 52, 56, 60, 64, 68, 72, 75, 78, 82],
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    description: "Build production AI systems including LLM applications, RAG pipelines, and intelligent agents.",
    topSkills: ["Python", "LLMs", "Prompt Engineering", "Vector Databases", "ML Fundamentals"],
    salaryRange: { min: 12, max: 35, unit: "LPA" },
    demandTrend: [30, 35, 42, 50, 58, 64, 70, 75, 80, 84, 88, 92],
  },

  // ── Cloud & DevOps ────────────────────────────────
  {
    id: "devops-engineer",
    title: "DevOps Engineer",
    description: "Automate infrastructure, CI/CD pipelines, and monitoring for reliable, scalable deployments.",
    topSkills: ["Docker", "Kubernetes", "CI/CD", "Cloud Platforms", "Linux"],
    salaryRange: { min: 8, max: 22, unit: "LPA" },
    demandTrend: [52, 55, 58, 61, 64, 67, 70, 73, 76, 79, 82, 85],
  },
  {
    id: "cloud-engineer",
    title: "Cloud Engineer",
    description: "Architect and manage cloud infrastructure on AWS, GCP, or Azure for enterprise workloads.",
    topSkills: ["Cloud Platforms", "Terraform", "Networking", "Linux", "Security"],
    salaryRange: { min: 10, max: 26, unit: "LPA" },
    demandTrend: [50, 53, 56, 59, 62, 65, 68, 72, 75, 78, 81, 84],
  },

  // ── Mobile ────────────────────────────────────────
  {
    id: "mobile-developer",
    title: "Mobile Developer",
    description: "Build high-performance native and cross-platform mobile apps for iOS and Android.",
    topSkills: ["React Native", "Flutter", "JavaScript", "Swift", "Kotlin"],
    salaryRange: { min: 7, max: 20, unit: "LPA" },
    demandTrend: [55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75, 78],
  },

  // ── Security ──────────────────────────────────────
  {
    id: "cybersecurity-analyst",
    title: "Cybersecurity Analyst",
    description: "Protect systems and data through threat analysis, vulnerability assessment, and incident response.",
    topSkills: ["Network Security", "Linux", "SIEM Tools", "Vulnerability Assessment", "Python"],
    salaryRange: { min: 6, max: 20, unit: "LPA" },
    demandTrend: [48, 51, 54, 57, 60, 64, 68, 71, 74, 77, 80, 84],
  },

  // ── Product & Management ──────────────────────────
  {
    id: "product-manager",
    title: "Product Manager",
    description: "Define product vision, prioritize roadmaps, and drive cross-functional execution.",
    topSkills: ["Product Strategy", "Data Analysis", "Communication", "Agile", "User Research"],
    salaryRange: { min: 10, max: 30, unit: "LPA" },
    demandTrend: [56, 58, 60, 62, 64, 66, 68, 70, 73, 76, 79, 82],
  },
  {
    id: "project-manager",
    title: "Project Manager",
    description: "Plan, execute, and deliver projects on time and budget using agile or waterfall methodologies.",
    topSkills: ["Agile", "Scrum", "Communication", "Risk Management", "JIRA"],
    salaryRange: { min: 8, max: 22, unit: "LPA" },
    demandTrend: [54, 55, 57, 59, 61, 63, 65, 67, 69, 71, 73, 75],
  },

  // ── QA & Testing ──────────────────────────────────
  {
    id: "qa-engineer",
    title: "QA Engineer",
    description: "Ensure software quality through manual and automated testing strategies and CI integration.",
    topSkills: ["Test Automation", "Selenium", "Python", "CI/CD", "API Testing"],
    salaryRange: { min: 5, max: 16, unit: "LPA" },
    demandTrend: [50, 52, 53, 55, 57, 59, 61, 63, 65, 67, 69, 72],
  },
];
