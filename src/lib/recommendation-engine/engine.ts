import { haversineDistanceKm } from "@/lib/geo/distance";
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
    skillScore: number;
    proximityScore: number;
    freshnessScore: number;
    distanceKm: number | null;
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
   * Authoritative Deterministic Scoring Model (0 - 100 points):
   * 1. Skill Match (0 - 60 points)
   * 2. Proximity / College Relevance (0 - 30 points)
   * 3. Freshness (0 - 10 points)
   *
   * Completely deterministic: zero synthetic randomness.
   */
  private scoreOpportunity(opp: OpportunityNode): ScoredRecommendation {
    // 1. Skill Match (0 - 60 points)
    const requiredSkills = opp.requiredSkills || [];
    const studentSkills = this.student.skills || [];
    let skillsMatchCount = 0;
    let skillScore = 0;

    if (requiredSkills.length > 0) {
      skillsMatchCount = requiredSkills.filter(skill => 
        studentSkills.some(sk => sk === skill || sk.includes(skill) || skill.includes(sk))
      ).length;
      const skillsMatchPercentage = skillsMatchCount / requiredSkills.length;
      skillScore = Math.min(60, skillsMatchPercentage * 60);
    } else {
      // If no required skills explicitly declared, check general tags/domain
      const tagMatch = (opp.tags || []).some(tag => 
        studentSkills.some(sk => sk === tag || sk.includes(tag) || tag.includes(sk))
      );
      skillScore = tagMatch ? 35 : 20;
      skillsMatchCount = tagMatch ? 1 : 0;
    }

    // Goal alignment check (for explanation context)
    const studentGoals = this.student.careerGoals || [];
    const isGoalMatch = studentGoals.some(goal => {
      const g = (goal || "").toLowerCase();
      return (
        (opp.title && opp.title.toLowerCase().includes(g)) || 
        (opp.domain && opp.domain.toLowerCase().includes(g)) ||
        (opp.tags && opp.tags.some(tag => (tag || "").toLowerCase().includes(g)))
      );
    });

    // 2. Proximity / College Relevance (0 - 30 points)
    let proximityScore = 0;
    let distanceKm: number | null = null;
    let isNearCollege = false;

    if (opp.isRemote) {
      proximityScore = 25; // High accessibility for student remote work
    } else {
      // Check user location coordinates
      if (
        this.student.latitude != null && 
        this.student.longitude != null && 
        opp.latitude != null && 
        opp.longitude != null
      ) {
        distanceKm = haversineDistanceKm(
          this.student.latitude, 
          this.student.longitude, 
          opp.latitude, 
          opp.longitude
        );
        if (distanceKm <= 15) proximityScore = Math.max(proximityScore, 30);
        else if (distanceKm <= 50) proximityScore = Math.max(proximityScore, 20);
        else if (distanceKm <= 100) proximityScore = Math.max(proximityScore, 10);
      }

      // Check college coordinates
      if (
        this.student.collegeLatitude != null && 
        this.student.collegeLongitude != null && 
        opp.latitude != null && 
        opp.longitude != null
      ) {
        const colDist = haversineDistanceKm(
          this.student.collegeLatitude, 
          this.student.collegeLongitude, 
          opp.latitude, 
          opp.longitude
        );
        if (colDist <= 15) {
          proximityScore = Math.max(proximityScore, 30);
          isNearCollege = true;
          if (distanceKm === null) distanceKm = colDist;
        } else if (colDist <= 50) {
          proximityScore = Math.max(proximityScore, 20);
          isNearCollege = true;
          if (distanceKm === null) distanceKm = colDist;
        }
      }

      // Check city text match
      if (opp.city && (this.student.preferredCities || []).includes(opp.city.toLowerCase())) {
        proximityScore = Math.max(proximityScore, 15);
      }
    }
    proximityScore = Math.min(30, proximityScore);

    // 3. Freshness (0 - 10 points)
    const now = Date.now();
    const ageInDays = (now - new Date(opp.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    let freshnessScore = 1;
    if (ageInDays <= 3) freshnessScore = 10;
    else if (ageInDays <= 7) freshnessScore = 7;
    else if (ageInDays <= 14) freshnessScore = 4;

    const totalScore = Math.min(100, Math.round(skillScore + proximityScore + freshnessScore));

    // 4. Data-Backed Truthful Explanation Generator
    const explanation = this.generateTruthfulExplanation({
      opp,
      skillsMatchCount,
      isGoalMatch,
      isRemote: opp.isRemote,
      distanceKm,
      isNearCollege,
      ageInDays
    });

    return {
      opportunity: opp,
      totalScore,
      explanation,
      matchMetrics: {
        skillsMatchCount,
        skillsMatchPercentage: requiredSkills.length > 0 ? skillsMatchCount / requiredSkills.length : 1,
        isLocationMatch: proximityScore > 0,
        isGoalMatch,
        skillScore: Math.round(skillScore),
        proximityScore: Math.round(proximityScore),
        freshnessScore: Math.round(freshnessScore),
        distanceKm: distanceKm !== null ? Math.round(distanceKm) : null,
      }
    };
  }

  /**
   * Generates truthful natural explanation grounded entirely in database facts.
   * Never claims an opportunity is 'near you' without actual coordinate proximity.
   */
  private generateTruthfulExplanation(params: {
    opp: OpportunityNode;
    skillsMatchCount: number;
    isGoalMatch: boolean;
    isRemote: boolean;
    distanceKm: number | null;
    isNearCollege: boolean;
    ageInDays: number;
  }): string {
    const { skillsMatchCount, isGoalMatch, isRemote, distanceKm, isNearCollege, ageInDays } = params;
    const reasons: string[] = [];

    if (skillsMatchCount > 0) {
      reasons.push(`matches ${skillsMatchCount} of your skills`);
    } else if (isGoalMatch) {
      reasons.push(`aligns with your stated career goal`);
    }

    if (isNearCollege) {
      reasons.push(`is located near your college campus`);
    } else if (distanceKm !== null && distanceKm <= 50) {
      reasons.push(`is ${distanceKm.toFixed(1)} km from your location`);
    } else if (isRemote) {
      reasons.push(`is remote with no commute required`);
    }

    if (ageInDays <= 3) {
      reasons.push(`was posted recently`);
    }

    if (reasons.length === 0) {
      return "Matches current verified student opportunity criteria.";
    }

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
   * Ranks related opportunities for detail pages based on deterministic similarity:
   * 1. Shared skills (up to 40 pts)
   * 2. Same category / domain (up to 25 pts)
   * 3. Same opportunity type (up to 15 pts)
   * 4. Compatible work mode (up to 10 pts)
   * 5. Geographic proximity (up to 10 pts)
   */
  public static rankRelatedOpportunities(
    currentOpp: OpportunityNode,
    candidateOpps: OpportunityNode[],
    limit: number = 4
  ): OpportunityNode[] {
    const filtered = candidateOpps.filter(c => c.id !== currentOpp.id);
    const currentSkills = new Set(currentOpp.requiredSkills || []);

    const scored = filtered.map(opp => {
      let similarity = 0;

      // 1. Shared Skills (0 - 40)
      const oppSkills = opp.requiredSkills || [];
      if (currentSkills.size > 0 && oppSkills.length > 0) {
        const shared = oppSkills.filter(s => currentSkills.has(s)).length;
        similarity += (shared / Math.max(1, currentSkills.size)) * 40;
      }

      // 2. Same domain / category (0 - 25)
      if (opp.domain && currentOpp.domain && opp.domain.toLowerCase() === currentOpp.domain.toLowerCase()) {
        similarity += 25;
      } else if (opp.category && currentOpp.category && opp.category.toLowerCase() === currentOpp.category.toLowerCase()) {
        similarity += 15;
      }

      // 3. Same opportunity type (0 - 15)
      if (opp.type === currentOpp.type) {
        similarity += 15;
      }

      // 4. Compatible work mode (0 - 10)
      if (opp.isRemote === currentOpp.isRemote) {
        similarity += 10;
      }

      // 5. Geographic proximity (0 - 10)
      if (!opp.isRemote && !currentOpp.isRemote && opp.latitude != null && opp.longitude != null && currentOpp.latitude != null && currentOpp.longitude != null) {
        const d = haversineDistanceKm(currentOpp.latitude, currentOpp.longitude, opp.latitude, opp.longitude);
        if (d <= 25) similarity += 10;
        else if (d <= 50) similarity += 5;
      }

      return { opp, similarity };
    });

    scored.sort((a, b) => b.similarity - a.similarity);
    return scored.slice(0, limit).map(s => s.opp);
  }
}
