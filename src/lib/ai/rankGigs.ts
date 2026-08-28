import prisma from '@/lib/prisma';

import { computeUserEmbedding, findTopN, Candidate } from './embeddings';

export async function rankGigsForUser(userId: string) {
 const user = await prisma.user.findUnique({ where: { id: userId }, include: { applications: true } });
 if (!user) throw new Error("User not found");

 const userVector = await computeUserEmbedding(userId);

 const gigs = await prisma.gig.findMany({
 where: { status:"OPEN" }
 });

 // We also need gig embeddings
 const gigEmbeddings = await (prisma as any).gigEmbedding.findMany({
 where: { gigId: { in: gigs.map((g: any) => g.id) } }
 });

 const gigEmbMap = new Map();
 gigEmbeddings.forEach((ge: any) => gigEmbMap.set(ge.gigId, ge.vector));

 const appliedGigIds = new Set(user.applications.map((a: any) => a.gigId));

 const candidates: Candidate[] = gigs.map((g: any) => ({
 ...g,
 id: g.id,
 vector: gigEmbMap.get(g.id) as number[],
 hasApplied: appliedGigIds.has(g.id)
 })).filter((g: any) => g.vector); // only rank gigs that have vectors

 const boostFn = (gig: Candidate): number => {
 let boost = 0;
 const gigSkills = (gig.tags || '').toLowerCase();
 const userSkills = (user.skills || '').toLowerCase();
 
 // +0.25 -> gig skills overlap with target skills
 if (gigSkills && userSkills && userSkills.includes(gigSkills.split(',')[0])) boost += 0.25;
 // +0.20 -> category match
 if (gig.tags && user.careerGoal && user.careerGoal.includes(gig.tags)) boost += 0.20;
 // +0.05 -> freshness
 if (gig.createdAt && (Date.now() - new Date(gig.createdAt).getTime()) < 24 * 60 * 60 * 1000) boost += 0.05;
 // -0.30 -> user already applied
 if (gig.hasApplied) boost -= 0.30;

 return boost;
 };

 return findTopN(userVector, candidates, 20, boostFn);
}
