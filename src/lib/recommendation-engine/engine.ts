import { OpportunityNode } from "./core/OpportunityGraph";
import { StudentProfileGraph } from "./core/StudentProfile";

export interface ScoredRecommendation {
  opportunity: OpportunityNode;
  totalScore: number;
  explanation: string;
  matchMetrics: {
    skillsMatchCount: number;
    skillsMatchPercentage: number;
    isLocationMatch: boolean;
    isGoalMatch: boolean;
    experienceMatch: number;
    educationMatch: number;
    preferenceMatch: number;
    rankingConfidence: number;
  };
}

export class RecommendationEngine {
  private student: StudentProfileGraph;

  constructor(student: StudentProfileGraph) {
    this.student = student;
  }

  /**
   * Main entry point to get scored and explained recommendations.
   */
  public generateRecommendations(
    opportunities: OpportunityNode[], 
    limit: number = 10
  ): ScoredRecommendation[] {
    const scored = opportunities.map(opp => this.scoreOpportunity(opp));
    
    // Sort by descending score
    scored.sort((a, b) => b.totalScore - a.totalScore);
    
    return scored.slice(0, limit);
  }

  /**
   * Evaluates an opportunity against the student profile using a weighted scoring model.
   * - Skills Match: 40%
   * - Goal Match: 30%
   * - Freshness/Popularity: 20%
   * - Location/Remote: 10%
   */
  private scoreOpportunity(opp: OpportunityNode): ScoredRecommendation {
    let score = 0;
    
    // 1. Feature Engineering: Skills Match
    const requiredSkills = opp.requiredSkills || [];
    const studentSkills = this.student.skills || [];
    let skillsMatchCount = 0;
    
    if (requiredSkills.length > 0) {
      skillsMatchCount = requiredSkills.filter(skill => studentSkills.includes(skill)).length;
      const skillsMatchPercentage = skillsMatchCount / requiredSkills.length;
      score += skillsMatchPercentage * 40; // Max 40 points
    } else {
      score += 20; // Default points if no skills strictly required
    }

    // 2. Feature Engineering: Goal Match
    const studentGoals = this.student.careerGoals || [];
    const isGoalMatch = studentGoals.some(goal => {
      const g = goal.toLowerCase();
      return (
        (opp.title && opp.title.toLowerCase().includes(g)) || 
        (opp.domain && opp.domain.toLowerCase().includes(g)) ||
        (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(g)))
      );
    });
    if (isGoalMatch) score += 30; // Max 30 points

    // 3. Feature Engineering: Location Match (Remote/Hybrid or Preferred City)
    let isLocationMatch = opp.isRemote;
    const preferredCities = this.student.preferredCities || [];
    
    if (!isLocationMatch && opp.location) {
      isLocationMatch = preferredCities.some(city => 
        opp.location!.toLowerCase().includes(city.toLowerCase())
      );
    }
    if (isLocationMatch) score += 10; // Max 10 points

    // 4. Feature Engineering: Freshness / Popularity
    const daysOld = (Date.now() - new Date(opp.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 10 - daysOld); // Up to 10 points for being recent
    const popularityScore = Math.min(10, opp.popularityScore / 100); // Up to 10 points for popularity
    score += freshnessScore + popularityScore;

    // 5. Explainable AI Layer
    const explanation = this.generateExplanation(opp, skillsMatchCount, isGoalMatch, isLocationMatch);

    // Simulated new metrics for Resume AI integration (Phase 5)
    // In a real Python V2, this would use embeddings
    const experienceMatch = Math.random() * 20 + 80; // 80-100%
    const educationMatch = Math.random() * 20 + 80; // 80-100%
    const preferenceMatch = isGoalMatch ? 95 : 60;
    const rankingConfidence = Math.min(99, score + 10);

    return {
      opportunity: opp,
      totalScore: Math.round(score),
      explanation,
      matchMetrics: {
        skillsMatchCount,
        skillsMatchPercentage: requiredSkills.length > 0 ? skillsMatchCount / requiredSkills.length : 1,
        isLocationMatch,
        isGoalMatch,
        experienceMatch: Math.round(experienceMatch),
        educationMatch: Math.round(educationMatch),
        preferenceMatch: Math.round(preferenceMatch),
        rankingConfidence: Math.round(rankingConfidence)
      }
    };
  }

  /**
   * Explainable AI (XAI) Generator.
   * Ensures every recommendation returns a "Recommended because..." string.
   */
  private generateExplanation(
    opp: OpportunityNode, 
    skillsMatchCount: number, 
    isGoalMatch: boolean, 
    isLocationMatch: boolean
  ): string {
    const reasons: string[] = [];

    if (skillsMatchCount > 0) {
      reasons.push(`matches ${skillsMatchCount} of your skills`);
    }
    
    if (isGoalMatch) {
      reasons.push(`aligns with your career goals`);
    }

    if (isLocationMatch) {
      if (opp.isRemote) reasons.push(`is a remote opportunity`);
      else reasons.push(`matches your location preferences`);
    }

    if (opp.popularityScore > 1000) {
      reasons.push(`is highly popular among students`);
    }

    if (reasons.length === 0) {
      return "Recommended based on your general profile.";
    }

    // Join reasons elegantly
    if (reasons.length === 1) {
      return `Recommended because it ${reasons[0]}.`;
    } else if (reasons.length === 2) {
      return `Recommended because it ${reasons[0]} and ${reasons[1]}.`;
    } else {
      const lastReason = reasons.pop();
      return `Recommended because it ${reasons.join(', ')}, and ${lastReason}.`;
    }
  }

  /**
   * Future ML Integration Point.
   * Designed to be swapped with a real Python microservice call later.
   */
  public async getAdvancedMLScores(_opportunities: OpportunityNode[]): Promise<null> {
    // Interface ready for V2:
    // const payload = { user: this.student, ops: opportunities };
    // const res = await fetch('https://ml-service.campusconnectco.in/rank', { ... });
    return null;
  }
}
