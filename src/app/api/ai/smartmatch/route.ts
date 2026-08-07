import { randomUUID } from 'crypto';

import { NextResponse } from 'next/server';

import { AIService, AIConfigurationError, AIRateLimitError } from '@/lib/ai';
import { protectApi } from '@/lib/auth-checks';
import { logger, normalizeError } from '@/lib/logger';
import prisma from '@/lib/prisma';
import { aiLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ---------------------------------------------------------------------------
// Response helpers — consistent shape across all status codes
// ---------------------------------------------------------------------------

type ErrorResponseBody = {
    success: false;
    error: string;
    requestId: string;
    /** Only present in development — never exposed in production */
    detail?: string;
    stack?: string;
};

function errorResponse(
    status: number,
    message: string,
    requestId: string,
    devDetail?: { message: string; stack?: string },
): NextResponse<ErrorResponseBody> {
    const body: ErrorResponseBody = {
        success: false,
        error: message,
        requestId,
        ...(process.env.NODE_ENV === 'development' && devDetail
            ? { detail: devDetail.message, stack: devDetail.stack }
            : {}),
    };
    return NextResponse.json(body, { status });
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
    const requestId = randomUUID();
    const totalStart = performance.now();

    // 1. Rate Limiting — checked BEFORE auth to protect against DoS
    const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
    try {
        if (!(await aiLimiter.check(ip))) {
            logger.warn('SmartMatch: rate limit exceeded', { requestId, ip });
            return errorResponse(429, 'Rate limited. Please try again later.', requestId);
        }
    } catch (rlError: unknown) {
        // Rate limiter failure is non-fatal — allow the request through
        logger.warn('SmartMatch: rate limiter threw, allowing request', { requestId, ip });
        logger.error('SmartMatch: rate limiter error', rlError, { requestId });
    }

    try {
        // 2. Auth Check
        const auth = await protectApi(['FOUNDER', 'STUDENT']);
        if (auth.errorResponse) return auth.errorResponse;

        const userId = auth.user!.id;

        // 3. Fetch user profile from DB with timing
        const dbStart = performance.now();

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { skills: true, bio: true, careerGoal: true, branch: true, year: true },
        });

        if (!user) {
            logger.warn('SmartMatch: user not found', { requestId, userId });
            return errorResponse(404, 'User profile not found.', requestId);
        }

        // Validate that the profile has at minimum a skill or goal so the LLM
        // has something meaningful to work with.
        const hasProfile = user.skills || user.bio || user.careerGoal;
        if (!hasProfile) {
            logger.warn('SmartMatch: profile is empty', { requestId, userId });
            return errorResponse(
                422,
                'Your profile is incomplete. Please add skills, a bio, or a career goal before running SmartMatch.',
                requestId,
            );
        }

        const userProfile = {
            skills:     user.skills    ? user.skills.split(',').map((s: string) => s.trim()) : [],
            bio:        user.bio        || '',
            careerGoal: user.careerGoal || '',
            branch:     user.branch     || '',
            year:       user.year       || '',
        };

        // 4. Fetch active opportunities with timing
        const [activeInternships, activeGigs] = await Promise.all([
            prisma.internship.findMany({
                where: { status: 'OPEN' },
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, description: true, skills: true, stipend: true },
            }),
            prisma.gig.findMany({
                where: { status: 'active' },   // Gig.status defaults to "active" (lowercase)
                take: 10,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, description: true, required_skills: true, budget: true },
            }),
        ]);

        const dbMs = Math.round(performance.now() - dbStart);

        // 5. Early return — do NOT call LLM if there are no opportunities
        if (activeInternships.length === 0 && activeGigs.length === 0) {
            logger.warn('SmartMatch: no active opportunities in DB', { requestId, userId, dbMs });
            return errorResponse(
                404,
                'No active opportunities found. Check back soon!',
                requestId,
            );
        }

        logger.info('SmartMatch: DB fetch complete', {
            requestId,
            userId,
            dbMs,
            internshipCount: activeInternships.length,
            gigCount: activeGigs.length,
        });

        // 6. Call LLM with timing
        const aiStart = performance.now();
        logger.info('SmartMatch: AI generation started', { requestId, userId });

        const opportunitiesContext = { internships: activeInternships, gigs: activeGigs };
        const result = await AIService.getSmartMatch(userProfile, opportunitiesContext);

        const aiMs = Math.round(performance.now() - aiStart);
        const totalMs = Math.round(performance.now() - totalStart);

        logger.info('SmartMatch: AI generation complete', {
            requestId,
            userId,
            aiMs,
            totalMs,
        });

        // 7. Annotate results with type for frontend routing
        if (result?.internships) {
            result.internships = result.internships.map(
                (i: Record<string, unknown>) => ({ ...i, type: 'Internship' }),
            );
        }
        if (result?.gigs) {
            result.gigs = result.gigs.map(
                (g: Record<string, unknown>) => ({ ...g, type: 'Gig' }),
            );
        }

        return NextResponse.json({
            success: true,
            requestId,
            data: result,
            meta: { dbMs, aiMs, totalMs },
        });

    } catch (error: unknown) {
        const totalMs = Math.round(performance.now() - totalStart);
        const normalized = normalizeError(error);

        // Map typed AI errors to correct HTTP status codes
        if (error instanceof AIConfigurationError) {
            logger.error('SmartMatch: AI service misconfigured', error, { requestId, totalMs });
            return errorResponse(
                503,
                'AI service unavailable. Please contact support.',
                requestId,
                process.env.NODE_ENV === 'development' ? normalized : undefined,
            );
        }

        if (error instanceof AIRateLimitError) {
            logger.error('SmartMatch: upstream AI rate limit', error, { requestId, totalMs });
            return errorResponse(
                429,
                'Rate limited. The AI service is temporarily unavailable. Please try again in a few minutes.',
                requestId,
            );
        }

        if (error instanceof SyntaxError) {
            // JSON.parse failure — LLM returned malformed JSON despite being instructed not to
            logger.error('SmartMatch: LLM returned unparseable JSON', error, { requestId, totalMs });
            return errorResponse(
                422,
                'AI returned an invalid response. Please try again.',
                requestId,
                process.env.NODE_ENV === 'development' ? normalized : undefined,
            );
        }

        // Unexpected failure — log with full details, return safe 500
        logger.error('SmartMatch: unexpected error', error, { requestId, totalMs, normalized });
        return errorResponse(
            500,
            'Internal server error. Please try again later.',
            requestId,
            process.env.NODE_ENV === 'development' ? normalized : undefined,
        );
    }
}
