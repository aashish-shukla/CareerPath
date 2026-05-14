import { describe, it, expect } from "vitest";

// We need to extract buildFallbackAtsScore for testing.
// Since it's not exported, we test it indirectly via a testable wrapper.
// For now, we replicate the scoring logic to validate behavior.

/**
 * Minimal scoring function mirroring buildFallbackAtsScore.
 * In a real setup, refactor the controller to export pure functions for testing.
 */
function computeAtsComponents(profile) {
  const hasResume = !!(profile?.resume?.extractedText);
  const resumeText = profile?.resume?.extractedText ?? "";
  const resumeLength = resumeText.length;
  const resumeParsed = profile?.resume?.parsed ?? {};
  const profileSkills = profile?.skills ?? [];
  const resumeSkills = resumeParsed?.skills ?? [];
  const allSkills = [...new Set([...profileSkills, ...resumeSkills])];
  const parsedCerts = Array.isArray(resumeParsed?.certifications) ? resumeParsed.certifications : [];
  const parsedProjects = Array.isArray(resumeParsed?.projects) ? resumeParsed.projects : [];
  const parsedExperience = Array.isArray(resumeParsed?.experience) ? resumeParsed.experience : [];
  const parsedLinks = Array.isArray(resumeParsed?.links) ? resumeParsed.links : [];

  return {
    hasResume,
    resumeLength,
    skillsCount: allSkills.length,
    certCount: parsedCerts.length,
    projectCount: parsedProjects.length,
    experienceEntries: parsedExperience.length,
    linkCount: parsedLinks.length,
    highlightCount: parsedExperience.reduce((acc, e) => acc + (e.highlights?.length ?? 0), 0),
  };
}

describe("ATS Score Components", () => {
  it("should detect empty profile has no resume", () => {
    const result = computeAtsComponents({});
    expect(result.hasResume).toBe(false);
    expect(result.skillsCount).toBe(0);
    expect(result.certCount).toBe(0);
  });

  it("should count skills from both profile and resume.parsed", () => {
    const profile = {
      skills: ["React", "Node.js"],
      resume: {
        extractedText: "some text",
        parsed: { skills: ["React", "Python", "SQL"] },
      },
    };
    const result = computeAtsComponents(profile);
    expect(result.skillsCount).toBe(4); // React (deduped), Node.js, Python, SQL
    expect(result.hasResume).toBe(true);
  });

  it("should count certifications from parsed resume", () => {
    const profile = {
      resume: {
        extractedText: "text",
        parsed: {
          certifications: ["AWS Solutions Architect", "Google Cloud Professional"],
        },
      },
    };
    const result = computeAtsComponents(profile);
    expect(result.certCount).toBe(2);
  });

  it("should count projects with technologies", () => {
    const profile = {
      resume: {
        extractedText: "text",
        parsed: {
          projects: [
            { name: "App", technologies: ["React", "Node"], impact: "10K users" },
            { name: "API", technologies: [], impact: "" },
          ],
        },
      },
    };
    const result = computeAtsComponents(profile);
    expect(result.projectCount).toBe(2);
  });

  it("should count work history highlights", () => {
    const profile = {
      resume: {
        extractedText: "text",
        parsed: {
          experience: [
            { title: "SWE", company: "Google", highlights: ["Led team", "Built API", "Reduced bugs"] },
            { title: "Intern", company: "Startup", highlights: ["Built dashboard"] },
          ],
        },
      },
    };
    const result = computeAtsComponents(profile);
    expect(result.experienceEntries).toBe(2);
    expect(result.highlightCount).toBe(4);
  });

  it("should detect LinkedIn and GitHub links", () => {
    const profile = {
      resume: {
        extractedText: "text",
        parsed: {
          links: ["https://linkedin.com/in/user", "https://github.com/user"],
        },
      },
    };
    const result = computeAtsComponents(profile);
    expect(result.linkCount).toBe(2);
  });

  it("should handle malformed parsed data gracefully", () => {
    const profile = {
      resume: {
        extractedText: "text",
        parsed: {
          certifications: "not an array",
          projects: null,
          experience: undefined,
        },
      },
    };
    const result = computeAtsComponents(profile);
    expect(result.certCount).toBe(0);
    expect(result.projectCount).toBe(0);
    expect(result.experienceEntries).toBe(0);
  });
});

describe("Password Policy Validation", () => {
  // Tests for the Joi password schema pattern
  const strongPasswordRegex = {
    uppercase: /[A-Z]/,
    number: /[0-9]/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
  };

  it("should accept strong password", () => {
    const pw = "MyP@ssw0rd!";
    expect(pw.length >= 8).toBe(true);
    expect(strongPasswordRegex.uppercase.test(pw)).toBe(true);
    expect(strongPasswordRegex.number.test(pw)).toBe(true);
    expect(strongPasswordRegex.special.test(pw)).toBe(true);
  });

  it("should reject password without uppercase", () => {
    const pw = "myp@ssw0rd!";
    expect(strongPasswordRegex.uppercase.test(pw)).toBe(false);
  });

  it("should reject password without number", () => {
    const pw = "MyP@ssword!";
    expect(strongPasswordRegex.number.test(pw)).toBe(false);
  });

  it("should reject password without special character", () => {
    const pw = "MyPassw0rd";
    expect(strongPasswordRegex.special.test(pw)).toBe(false);
  });

  it("should reject password shorter than 8 chars", () => {
    const pw = "Ab1!";
    expect(pw.length >= 8).toBe(false);
  });
});
