import { StudentProfileGraph } from "./StudentProfile";

export interface RoadmapStep {
  title: string;
  type: "skill_gap" | "course" | "project" | "internship" | "interview_prep" | "apply";
  description: string;
  actionableLink?: string;
  isCompleted: boolean;
}

export interface PersonalizedRoadmap {
  targetCareer: string;
  currentSkills: string[];
  missingSkills: string[];
  steps: RoadmapStep[];
}

/**
 * AI Career Roadmap Generator
 * Analyzes a student's profile to generate a chronological career roadmap.
 */
export class CareerRoadmapGenerator {
  // A naive mapping of target careers to required skills (In a real system, this is queried from DB or AI)
  private readonly targetSkillMaps: Record<string, string[]> = {
    "software engineer": ["react", "node.js", "typescript", "git", "sql", "data structures"],
    "frontend developer": ["html", "css", "javascript", "react", "next.js", "tailwind"],
    "backend developer": ["node.js", "express", "sql", "postgresql", "docker", "aws"],
    "data scientist": ["python", "sql", "machine learning", "pandas", "statistics", "jupyter"],
    "product manager": ["agile", "jira", "user research", "wireframing", "data analysis", "sql"],
    "ui/ux designer": ["figma", "wireframing", "prototyping", "user research", "adobe xd"]
  };

  /**
   * Generates a roadmap for a given student.
   * If a specific target is not provided, it attempts to infer from careerGoals.
   */
  public generateRoadmap(student: StudentProfileGraph, targetCareer?: string): PersonalizedRoadmap {
    let career = targetCareer || (student.careerGoals[0] ? student.careerGoals[0].toLowerCase() : null);
    
    // If no explicit career goal matches, fallback to generic SE
    if (!career || !this.targetSkillMaps[career]) {
      // Try to find partial match
      const matchedKey = Object.keys(this.targetSkillMaps).find(k => career && k.includes(career));
      career = matchedKey || "software engineer";
    }

    const requiredSkills = this.targetSkillMaps[career];
    const currentSkills = student.skills;
    
    const missingSkills = requiredSkills.filter(skill => !currentSkills.includes(skill));
    
    return {
      targetCareer: career,
      currentSkills,
      missingSkills,
      steps: this.buildSteps(career, missingSkills, currentSkills.length > 0)
    };
  }

  private buildSteps(career: string, missingSkills: string[], hasCurrentSkills: boolean): RoadmapStep[] {
    const steps: RoadmapStep[] = [];

    if (missingSkills.length > 0) {
      steps.push({
        title: "Bridge the Skill Gap",
        type: "skill_gap",
        description: `You need to learn: ${missingSkills.join(', ')} to become a competitive ${career}.`,
        isCompleted: false
      });

      steps.push({
        title: "Recommended Courses",
        type: "course",
        description: `Take highly-rated courses focusing on ${missingSkills[0]} and ${missingSkills[1] || 'advanced topics'}.`,
        actionableLink: "/topics",
        isCompleted: false
      });
    }

    steps.push({
      title: "Build Projects",
      type: "project",
      description: `Create 1-2 portfolio projects demonstrating your proficiency in ${career} technologies.`,
      actionableLink: "/dashboard/student/profile",
      isCompleted: !hasCurrentSkills // If they have no skills, they definitely haven't built projects
    });

    steps.push({
      title: "Gain Experience",
      type: "internship",
      description: `Apply for entry-level internships or freelance gigs in ${career}.`,
      actionableLink: "/internships",
      isCompleted: false
    });

    steps.push({
      title: "Interview Preparation",
      type: "interview_prep",
      description: "Practice mock interviews focusing on technical and behavioral rounds.",
      actionableLink: "/dashboard/student/interview-simulator",
      isCompleted: false
    });

    steps.push({
      title: "Start Applying",
      type: "apply",
      description: `Apply for full-time ${career} roles with your polished resume and portfolio.`,
      actionableLink: "/search",
      isCompleted: false
    });

    return steps;
  }
}
