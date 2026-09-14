import { INDIA_COLLEGES } from "@/lib/colleges-dataset";
import { getActiveOpportunityPrismaFilter } from "@/lib/opportunities/lifecycle";
import prisma from "@/lib/prisma";
import { 
  buildStudentProfileGraph, 
  buildOpportunityNodeFromGig, 
  buildOpportunityNodeFromInternship,
  RecommendationEngine,
  OpportunityNode
} from "@/lib/recommendation-engine";

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

  // 2. Build Student Profile Graph
  const profileGraph = buildStudentProfileGraph(mergedUser as any);

  // Check college coordinates
  if (user.collegeId) {
    const col = await prisma.college.findUnique({
      where: { id: user.collegeId },
      select: { name: true, latitude: true, longitude: true }
    });
    if (col) {
      profileGraph.collegeName = col.name;
      profileGraph.collegeLatitude = col.latitude;
      profileGraph.collegeLongitude = col.longitude;
      profileGraph.collegeLongitude = col.longitude;
    }
  } else if (user.college) {
    const matched = INDIA_COLLEGES.find(c => 
      c.name.toLowerCase().includes(user.college!.toLowerCase()) || 
      user.college!.toLowerCase().includes(c.name.toLowerCase())
    );
    if (matched) {
      profileGraph.collegeName = matched.name;
      profileGraph.collegeLatitude = matched.latitude;
      profileGraph.collegeLongitude = matched.longitude;
    }
  }

  // 3. Fetch Opportunities (Gigs + Internships) strictly active and non-expired
  const activeFilter = getActiveOpportunityPrismaFilter();
  const [gigs, internships] = await Promise.all([
    prisma.gig.findMany({
      where: {
        status: { in: ["OPEN", "active"] },
        ...activeFilter,
        posted_by: { not: userId }
      },
      orderBy: { createdAt: "desc" },
      take: 25
    }),
    prisma.internship.findMany({
      where: {
        status: "OPEN",
        ...activeFilter
      },
      orderBy: { createdAt: "desc" },
      take: 25
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

/**
 * Service to retrieve genuinely relevant related opportunities for detail pages.
 */
export async function getRelatedOpportunitiesService(
  currentId: string, 
  currentType: 'gig' | 'internship', 
  limit: number = 4
): Promise<OpportunityNode[]> {
  // Fetch candidate pool strictly active and non-expired
  const activeFilter = getActiveOpportunityPrismaFilter();
  const [gigs, internships] = await Promise.all([
    prisma.gig.findMany({
      where: {
        status: { in: ["OPEN", "active"] },
        ...activeFilter
      },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.internship.findMany({
      where: {
        status: "OPEN",
        ...activeFilter
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  const gigNodes = gigs.map(g => buildOpportunityNodeFromGig(g as any));
  const internshipNodes = internships.map(i => buildOpportunityNodeFromInternship(i as any));
  const allOpportunities = [...gigNodes, ...internshipNodes];

  const current = allOpportunities.find(o => o.id === currentId);
  if (!current) {
    return allOpportunities.filter(o => o.id !== currentId).slice(0, limit);
  }

  return RecommendationEngine.rankRelatedOpportunities(current, allOpportunities, limit);
}
