import prisma from"@/lib/prisma";

import { isFeatureEnabled } from"./featureFlags";

interface TrackEventParams {
 event: string;
 data?: any;
 userId?: string | null;
 sessionId?: string | null;
}

/**
 * Persists an analytics event to the database.
 * Respects the 'enable_analytics_tracking' feature flag.
 */
export async function trackEvent({ event, data, userId, sessionId }: TrackEventParams) {
 try {
 const isEnabled = await isFeatureEnabled("enable_analytics_tracking");
 if (!isEnabled) return;

 await prisma.analytics.create({
 data: {
 event,
 userId: userId || null,
 sessionId: sessionId || null,
 data: data || {},
 },
 });
 } catch (error) {
 console.error(`[Analytics] Failed to track event ${event}:`, error);
 }
}

/**
 * Calculates funnel drop-offs.
 * Steps: signup -> profile_completion -> application_start -> application_complete
 */
export async function getFunnelMetrics(days = 30) {
 const since = new Date();
 since.setDate(since.getDate() - days);

 const [signups, profileCompletions, applicationStarts, applicationCompletes] = await Promise.all([
 prisma.analytics.count({ where: { event:"signup", createdAt: { gte: since } } }),
 prisma.analytics.count({ where: { event:"profile_completion", createdAt: { gte: since } } }),
 prisma.analytics.count({ where: { event:"application_start", createdAt: { gte: since } } }),
 prisma.analytics.count({ where: { event:"application_complete", createdAt: { gte: since } } }),
 ]);

 return [
 { step:"Signup", count: signups, dropoff: 0 },
 { step:"Profile Completion", count: profileCompletions, dropoff: signups ? ((signups - profileCompletions) / signups) * 100 : 0 },
 { step:"Application Started", count: applicationStarts, dropoff: profileCompletions ? ((profileCompletions - applicationStarts) / profileCompletions) * 100 : 0 },
 { step:"Application Completed", count: applicationCompletes, dropoff: applicationStarts ? ((applicationStarts - applicationCompletes) / applicationStarts) * 100 : 0 },
 ];
}

/**
 * Retrieves metrics about the AI recommendation engine.
 */
export async function getRecommendationIntelligence(days = 30) {
 const since = new Date();
 since.setDate(since.getDate() - days);

 const clicks = await prisma.analytics.findMany({
 where: { event:"recommendation_click", createdAt: { gte: since } },
 select: { data: true }
 });

 const totalClicks = clicks.length;
 let applicationsFromRecommendations = 0;

 const topSkillsMap: Record<string, number> = {};
 const topCompaniesMap: Record<string, number> = {};
 const explanationClicks: Record<string, number> = {};

 clicks.forEach(click => {
 const data = click.data as any;
 if (!data) return;

 if (data.applied) applicationsFromRecommendations++;

 // Track which skills drive clicks
 if (data.matchedSkills && Array.isArray(data.matchedSkills)) {
 data.matchedSkills.forEach((skill: string) => {
 topSkillsMap[skill] = (topSkillsMap[skill] || 0) + 1;
 });
 }

 // Track which companies receive engagement
 if (data.company) {
 topCompaniesMap[data.company] = (topCompaniesMap[data.company] || 0) + 1;
 }

 // Track which AI explanation drove the click
 if (data.explanation) {
 explanationClicks[data.explanation] = (explanationClicks[data.explanation] || 0) + 1;
 }
 });

 // Sort maps to get top N
 const sortMap = (map: Record<string, number>) => Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);

 return {
 totalClicks,
 acceptanceRate: totalClicks > 0 ? (applicationsFromRecommendations / totalClicks) * 100 : 0,
 topSkills: sortMap(topSkillsMap),
 topCompanies: sortMap(topCompaniesMap),
 topExplanations: sortMap(explanationClicks)
 };
}

/**
 * Calculates retention based on returning sessions.
 */
export async function getRetentionMetrics(days = 7) {
 const since = new Date();
 since.setDate(since.getDate() - days);

 // Users who had a session_start in the timeframe
 const activeSessions = await prisma.analytics.findMany({
 where: { event:"session_start", createdAt: { gte: since } },
 select: { userId: true, sessionId: true, createdAt: true }
 });

 const uniqueUsers = new Set(activeSessions.map(s => s.userId).filter(Boolean));
 const uniqueSessions = new Set(activeSessions.map(s => s.sessionId).filter(Boolean));

 return {
 activeUsers: uniqueUsers.size,
 totalSessions: uniqueSessions.size,
 averageSessionsPerUser: uniqueUsers.size > 0 ? uniqueSessions.size / uniqueUsers.size : 0
 };
}
