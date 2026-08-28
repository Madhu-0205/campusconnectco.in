import prisma from '@/lib/prisma';

export interface TrendingGig {
 id: string;
 title: string;
 budget: number;
 tags: string | null;
 applicationCount: number;
 viewCount: number;
 velocity: number; // applications per hour in last 24h
 createdAt: Date;
}

export interface TrendingSkill {
 name: string;
 color: string;
 icon: string;
 gigCount: number;
 velocity: number;
}

export interface TrendingTopic {
 tag: string;
 count: number;
 change: number; // % change vs previous 24h
}

// ─── Calculate gig velocity (applications per hour in last 24h) ───────────────
async function getGigVelocities(): Promise<Map<string, number>> {
 const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

 const recentApps = await prisma.application.groupBy({
 by: ['gigId'],
 _count: { id: true },
 where: { createdAt: { gte: since } }
 });

 const velocityMap = new Map<string, number>();
 recentApps.forEach((row: any) => {
 velocityMap.set(row.gigId, row._count.id / 24); // apps per hour
 });

 return velocityMap;
}

// ─── Get trending gigs ────────────────────────────────────────────────────────
export async function getTrendingGigs(limit = 5): Promise<TrendingGig[]> {
 const [gigs, velocityMap] = await Promise.all([
 prisma.gig.findMany({
 where: { status: 'OPEN' },
 include: { _count: { select: { applications: true } } },
 orderBy: { views: 'desc' },
 take: 50
 }),
 getGigVelocities()
 ]);

 const scored = gigs.map((gig: any) => ({
 id: gig.id,
 title: gig.title,
 budget: gig.budget,
 tags: gig.tags,
 applicationCount: gig._count.applications,
 viewCount: gig.views,
 velocity: velocityMap.get(gig.id) || 0,
 createdAt: gig.createdAt,
 trendScore:
 (velocityMap.get(gig.id) || 0) * 0.5 +
 (gig._count.applications / 10) * 0.3 +
 (gig.views / 100) * 0.2
 }));

 return scored
 .sort((a: any, b: any) => b.trendScore - a.trendScore)
 .slice(0, limit);
}

// ─── Get trending skills (by gig demand) ─────────────────────────────────────
export async function getTrendingSkills(limit = 8): Promise<TrendingSkill[]> {
 const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
 const prevSince = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

 const [currentSkills, prevSkills] = await Promise.all([
 prisma.gigSkill.groupBy({
 by: ['skillId'],
 _count: { skillId: true },
 where: { gig: { createdAt: { gte: since } } },
 orderBy: { _count: { skillId: 'desc' } },
 take: limit
 }),
 prisma.gigSkill.groupBy({
 by: ['skillId'],
 _count: { skillId: true },
 where: { gig: { createdAt: { gte: prevSince, lt: since } } }
 })
 ]);

 const prevMap = new Map<string, number>();
 prevSkills.forEach((row: any) => prevMap.set(row.skillId, row._count.skillId));

 const skillIds = currentSkills.map((row: any) => row.skillId);
 const skills = await prisma.skill.findMany({
 where: { id: { in: skillIds } },
 select: { id: true, name: true, color: true, icon: true }
 });
 const skillMap = new Map(skills.map((s: any) => [s.id, s]));

 return currentSkills
 .map((row: any) => {
 const skill = skillMap.get(row.skillId);
 if (!skill) return null;
 const prev = prevMap.get(row.skillId) || 0;
 const velocity = prev > 0
 ? ((row._count.skillId - prev) / prev) * 100
 : 100; // new skill = 100% growth

 return {
 name: (skill as any).name,
 color: (skill as any).color,
 icon: (skill as any).icon,
 gigCount: row._count.skillId,
 velocity: Math.round(velocity)
 } as TrendingSkill;
 })
 .filter(Boolean) as TrendingSkill[];
}

// ─── Get trending topics/tags ─────────────────────────────────────────────────
export async function getTrendingTopics(limit = 6): Promise<TrendingTopic[]> {
 const gigs = await prisma.gig.findMany({
 where: {
 status: 'OPEN',
 tags: { not: null }
 },
 select: { tags: true, createdAt: true },
 take: 200
 });

 const since = Date.now() - 24 * 60 * 60 * 1000;
 const prev = Date.now() - 48 * 60 * 60 * 1000;

 const currentCounts = new Map<string, number>();
 const prevCounts = new Map<string, number>();

 gigs.forEach((gig: any) => {
 const age = new Date(gig.createdAt).getTime();
 if (!gig.tags) return;
 const tags = gig.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
 tags.forEach((tag: string) => {
 if (age >= since) {
 currentCounts.set(tag, (currentCounts.get(tag) || 0) + 1);
 } else if (age >= prev) {
 prevCounts.set(tag, (prevCounts.get(tag) || 0) + 1);
 }
 });
 });

 const topics: TrendingTopic[] = Array.from(currentCounts.entries())
 .map(([tag, count]) => {
 const prevCount = prevCounts.get(tag) || 0;
 const change = prevCount > 0
 ? Math.round(((count - prevCount) / prevCount) * 100)
 : 100;
 return { tag, count, change };
 })
 .sort((a, b) => b.count - a.count)
 .slice(0, limit);

 return topics;
}
