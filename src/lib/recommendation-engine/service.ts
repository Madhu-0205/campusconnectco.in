import prisma from"@/lib/prisma";
import { 
 buildStudentProfileGraph, 
 buildOpportunityNodeFromGig, 
 buildOpportunityNodeFromInternship,
 RecommendationEngine
} from"@/lib/recommendation-engine";

export async function getPersonalizedRecommendations(userId: string) {
 // 1. Fetch User Data
 const user = await prisma.user.findUnique({
 where: { id: userId },
 include: {
 userSkills: { include: { skill: true } }
 }
 });

 if (!user) return { profileGraph: null, recommendations: [] };

 // Map user skills correctly for the unified builder
 const skillsList = user.userSkills?.map(us => us.skill.name).join(',') || user.skills || '';
 const mergedUser = { ...user, skills: skillsList };

 // 2. Build Student Profile Graph (Mocking telemetry for V1)
 const profileGraph = buildStudentProfileGraph(mergedUser as any);

 // 3. Fetch Opportunities (Gigs + Internships)
 // Fetching a broad sample to rank (in production, we'd use vector search or pre-filtered sets)
 const [gigs, internships] = await Promise.all([
 prisma.gig.findMany({
 where: { status:"OPEN" },
 orderBy: { createdAt:"desc" },
 take: 20
 }),
 prisma.internship.findMany({
 where: { status:"OPEN" },
 orderBy: { createdAt:"desc" },
 take: 20
 })
 ]);

 // 4. Build Opportunity Graphs
 const gigNodes = gigs.map(g => buildOpportunityNodeFromGig(g as any));
 const internshipNodes = internships.map(i => buildOpportunityNodeFromInternship(i as any));
 const allOpportunities = [...gigNodes, ...internshipNodes];

 // 5. Run Recommendation Engine
 const engine = new RecommendationEngine(profileGraph);
 const recommendations = engine.generateRecommendations(allOpportunities, 6);

 return {
 profileGraph,
 recommendations
 };
}
