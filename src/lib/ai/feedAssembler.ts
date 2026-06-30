import prisma from '@/lib/prisma';
import { computeUserEmbedding, cosineSimilarity } from './embeddings';

export interface FeedPost {
  id: string;
  content: string;
  authorId: string;
  author: { name: string | null; image: string | null; role: string };
  createdAt: Date;
  _count: { likes: number };
  feedScore: number;
  signals: {
    recency: number;
    engagement: number;
    social: number;
    semantic: number;
  };
}

export interface FeedGig {
  id: string;
  title: string;
  description: string;
  budget: number;
  tags: string | null;
  createdAt: Date;
  poster: { name: string | null; image: string | null };
  _count: { applications: number };
  feedScore: number;
}

// ─── Recency decay (half-life = 24 hours) ─────────────────────────────────────
function recencyScore(createdAt: Date): number {
  const ageHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  return Math.exp(-ageHours / 24); // exponential decay
}

// ─── Engagement score (log scale to prevent viral monopoly) ───────────────────
function engagementScore(likeCount: number, appCount = 0): number {
  return Math.log1p(likeCount + appCount * 2) / Math.log1p(100);
}

// ─── Assemble personalized post feed ─────────────────────────────────────────
export async function assemblePersonalizedFeed(userId: string, limit = 20): Promise<FeedPost[]> {
  // Fetch user context
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      following: { select: { followingId: true } },
      userSkills: { include: { skill: { select: { name: true } } } }
    }
  });
  if (!user) throw new Error('User not found');

  const followingIds = new Set(user.following.map((f: any) => f.followingId));

  // Fetch recent posts
  const posts = await prisma.post.findMany({
    where: { status: 'OPEN' },
    include: {
      author: { select: { name: true, image: true, role: true } },
      _count: { select: { likes: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  // Try to get user embedding for semantic scoring
  let userVector: number[] | null = null;
  try {
    userVector = await computeUserEmbedding(userId);
  } catch {
    // Fallback: no semantic signal
  }

  // Score each post
  const scored = posts.map((post: any) => {
    const recency = recencyScore(post.createdAt);
    const engagement = engagementScore(post._count.likes);
    const social = followingIds.has(post.authorId) ? 0.3 : 0;
    const isSelf = post.authorId === userId ? -0.5 : 0; // don't surface own posts heavily

    // Semantic: embed post content and compare — skip if no vector
    // (Pre-computed post vectors would be ideal; for now use fallback)
    const semantic = 0;

    const feedScore = (
      recency * 0.35 +
      engagement * 0.25 +
      social * 0.30 +
      semantic * 0.10 +
      isSelf
    );

    return {
      ...post,
      feedScore,
      signals: { recency, engagement, social, semantic }
    } as FeedPost;
  });

  return scored
    .sort((a: FeedPost, b: FeedPost) => b.feedScore - a.feedScore)
    .slice(0, limit);
}

// ─── Assemble personalized gig feed ──────────────────────────────────────────
export async function assemblePersonalizedGigFeed(userId: string, limit = 15): Promise<FeedGig[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { applications: { select: { gigId: true } } }
  });
  if (!user) throw new Error('User not found');

  const appliedIds = new Set(user.applications.map((a: any) => a.gigId));

  const gigs = await prisma.gig.findMany({
    where: { status: 'OPEN' },
    include: {
      poster: { select: { name: true, image: true } },
      gigSkills: { include: { skill: { select: { name: true } } } },
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  // User skill set for matching
  const userSkills = (user.skills || '').toLowerCase().split(',').map((s: string) => s.trim());

  // Get user vector
  let userVector: number[] | null = null;
  try {
    userVector = await computeUserEmbedding(userId);
  } catch {/* noop */}

  // Get gig embeddings in bulk
  const gigIds = gigs.map((g: any) => g.id);
  const gigEmbeddings = await (prisma as any).gigEmbedding.findMany({
    where: { gigId: { in: gigIds } }
  });
  const gigEmbMap = new Map<string, number[]>();
  gigEmbeddings.forEach((ge: any) => gigEmbMap.set(ge.gigId, ge.vector));

  const scored = gigs.map((gig: any) => {
    const recency = recencyScore(gig.createdAt);
    const engagement = engagementScore(0, gig._count.applications);

    // Skill overlap score
    const gigSkillNames = gig.gigSkills.map((gs: any) => gs.skill.name.toLowerCase());
    const overlap = gigSkillNames.filter((s: string) => userSkills.some((us: string) => us && s.includes(us))).length;
    const skillMatch = Math.min(overlap / Math.max(gigSkillNames.length, 1), 1.0);

    // Semantic vector match
    let semantic = 0;
    if (userVector && gigEmbMap.has(gig.id)) {
      semantic = Math.max(0, cosineSimilarity(userVector, gigEmbMap.get(gig.id)!));
    }

    // Penalty: already applied
    const appliedPenalty = appliedIds.has(gig.id) ? -0.4 : 0;

    const feedScore = (
      recency * 0.20 +
      engagement * 0.10 +
      skillMatch * 0.35 +
      semantic * 0.35 +
      appliedPenalty
    );

    return {
      id: gig.id,
      title: gig.title,
      description: gig.description,
      budget: gig.budget,
      tags: gig.tags,
      createdAt: gig.createdAt,
      poster: gig.poster,
      _count: gig._count,
      feedScore
    } as FeedGig;
  });

  return scored
    .sort((a: FeedGig, b: FeedGig) => b.feedScore - a.feedScore)
    .slice(0, limit);
}

// ─── Combined feed assembler ──────────────────────────────────────────────────
export async function assembleHomeFeed(userId: string) {
  const [posts, gigs] = await Promise.all([
    assemblePersonalizedFeed(userId, 10),
    assemblePersonalizedGigFeed(userId, 5)
  ]);

  return { posts, gigs };
}
