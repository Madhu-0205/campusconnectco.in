import { StudentProfileGraph } from"./StudentProfile";

export interface AIInsight {
 type:"strength" |"improvement" |"market_trend" |"completion";
 title: string;
 description: string;
 priority:"high" |"medium" |"low";
}

/**
 * AI Insights Generator
 * Analyzes the student's profile to surface actionable advice.
 */
export class AIInsightsGenerator {
 
 public generateInsights(student: StudentProfileGraph): AIInsight[] {
 const insights: AIInsight[] = [];

 // Profile Completion Insight
 const missingCoreFields = [];
 if (student.skills.length === 0) missingCoreFields.push("skills");
 if (!student.degree) missingCoreFields.push("degree");
 if (student.careerGoals.length === 0) missingCoreFields.push("career goals");
 
 if (missingCoreFields.length > 0) {
 insights.push({
 type:"completion",
 title:"Profile Incomplete",
 description: `Add your ${missingCoreFields.join(', ')} to get better AI recommendations.`,
 priority:"high"
 });
 } else {
 insights.push({
 type:"completion",
 title:"All-Star Profile",
 description:"Your profile is fully optimized for our AI matching engine.",
 priority:"low"
 });
 }

 // Strengths
 if (student.skills.length > 3) {
 insights.push({
 type:"strength",
 title: `Strong foundation in ${student.skills[0]}`,
 description: `You have listed multiple skills. Employers highly value ${student.skills[0]} and ${student.skills[1] || 'related skills'}. Make sure your portfolio reflects this.`,
 priority:"medium"
 });
 }

 // Improvements / Skill Gaps (Basic inference)
 if (student.careerGoals.some(g => g.includes("engineer") || g.includes("developer")) && !student.skills.includes("git")) {
 insights.push({
 type:"improvement",
 title:"Missing Essential Skill: Git",
 description:"90% of engineering roles require version control experience. Consider learning Git.",
 priority:"high"
 });
 }

 // Market Trend
 if (student.careerGoals.some(g => g.includes("data") || g.includes("ai") || g.includes("machine learning"))) {
 insights.push({
 type:"market_trend",
 title:"AI is Booming",
 description:"Demand for AI and Data skills has increased by 40% this quarter. You're targeting a high-growth sector.",
 priority:"low"
 });
 }

 // Sorting by priority
 const priorityWeight = {"high": 3,"medium": 2,"low": 1 };
 insights.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);

 return insights;
 }
}
