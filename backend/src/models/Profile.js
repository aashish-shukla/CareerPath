import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, ref: "User" },
    fullName: { type: String, default: "" },
    currentRole: { type: String, default: "" },
    targetRole: { type: String, default: "" },
    education: {
      level: { type: String, default: "" },
      field: { type: String, default: "" },
      institution: { type: String, default: "" },
      graduationYear: { type: Number },
    },
    experience: {
      years: { type: Number, default: 0 },
      summary: { type: String, default: "" },
    },
    skills: [{ type: String, index: true }],
    profileSummary: {
      summary: { type: String, default: "" },
      highlights: [{ type: String }],
    },
    resume: {
      filename: { type: String },
      extractedText: { type: String },
      parsed: {
        summary: { type: String },
        name: { type: String },
        email: { type: String },
        phone: { type: String },
        location: { type: String },
        links: [{ type: String }],
        skills: [{ type: String }],
        experience: [{ type: Object }],
        education: [{ type: Object }],
        certifications: [{ type: String }],
        projects: [{ type: Object }],
        keywords: [{ type: String }],
      },
      details: { type: Object },
      atsScore: {
        score: { type: Number },
        breakdown: { type: Object },
        strengths: [{ type: String }],
        improvements: [{ type: String }],
        keywordGaps: [{ type: String }],
      },
    },
    // AI Results Cache - prevents repeated Ollama calls
    cachedRecommendations: {
      careerMatchScore: { type: Number },
      top: { type: Object },
      recommendations: [{ type: Object }],
      generatedAt: { type: Date },
    },
    cachedSkillGap: {
      readiness_score: { type: Number },
      missing: [{ type: Object }],
      strengths: [{ type: String }],
      notes: { type: String },
      generatedAt: { type: Date },
    },
    // AI-generated personalized learning resources cache
    cachedResources: {
      resources: [{ type: Object }],
      targetCareer: { type: String, default: "" },
      generatedAt: { type: Date },
    },
    needsRegeneration: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Profile = mongoose.model("Profile", profileSchema);

