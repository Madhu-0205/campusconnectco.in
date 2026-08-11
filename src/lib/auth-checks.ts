import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { logSecurityEvent } from "@/lib/security/audit"
import { createClient } from "@/lib/supabase/server"

/**
 * Server-side utility to get the current session user
 */
export async function getSession() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

/**
 * Fetches the user's role directly from the database (Requirement 8)
 * @param userId User UUID
 */
export async function getUserRoleFromDb(userId: string) {
    if (!userId) return null;

    try {
        const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        if (dbUser) return dbUser.role;

        // Auto-create profile in DB if user is authenticated but DB record is missing
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.id === userId) {
            const isFounder = user.email === "madhuvalurouthu52@gmail.com";
            const isAcademicEmail = typeof user.email === "string" && (
                user.email.endsWith(".edu") || 
                user.email.endsWith(".edu.in") || 
                user.email.endsWith(".res.in")
            );
            const userMetadataRole = user.user_metadata?.role || "STUDENT";
            const finalRole = isFounder ? "ADMIN" : userMetadataRole;
            const autoVerify = isAcademicEmail || isFounder;

            console.log(`[getUserRoleFromDb] Auto-creating missing user profile in database for ${user.email}`);
            try {
                const newProfile = await prisma.user.create({
                    data: {
                        id: user.id,
                        email: user.email || "",
                        name: user.user_metadata?.name || null,
                        full_name: user.user_metadata?.name || null,
                        role: finalRole,
                        isVerified: autoVerify,
                        college: user.user_metadata?.college || null,
                        acceptedTerms: true,
                        acceptedTermsAt: new Date(),
                        acceptedTermsVersion: "1.0",
                    },
                    select: { role: true }
                });
                return newProfile.role;
            } catch (createErr: any) {
                if (createErr.code === "P2002") {
                    console.log(`[getUserRoleFromDb] Profile for ${user.email} was created concurrently. Fetching...`);
                    const dbUserRetry = await prisma.user.findUnique({
                        where: { id: userId },
                        select: { role: true }
                    });
                    return dbUserRetry?.role ?? finalRole;
                }
                throw createErr;
            }
        }
        return null;
    } catch (error) {
        console.error("[getUserRoleFromDb] Role fetch/auto-creation failed:", error);
        return null;
    }
}

/**
 * Protects an API route by validating session and role from database
 */
export async function protectApi(allowedRoles: ("ADMIN" | "FOUNDER" | "STUDENT" | "STARTUP" | "CLIENT" | "COLLEGE")[]) {
    const user = await getSession();

    if (!user) {
        return { errorResponse: new NextResponse("Unauthorized", { status: 401 }), user: null };
    }

    let role = await getUserRoleFromDb(user.id);
    if (!role && user.user_metadata?.role) {
        role = user.user_metadata.role;
    }
    const normalizedRole = role ? role.toUpperCase() : null;

    if (!normalizedRole || !allowedRoles.includes(normalizedRole as (typeof allowedRoles)[number])) {
        console.warn(`[AUTH] Unauthorized access attempt by ${user.email} (Role: ${normalizedRole || role}) to restricted API`);
        logSecurityEvent("AUTH_LOGIN_FAILED", {
            userId: user.id,
            metadata: {
                email: user.email,
                attemptedRole: normalizedRole || role || "unknown",
                allowedRoles,
                context: "api"
            }
        }).catch(() => {});
        return { errorResponse: new NextResponse("Forbidden", { status: 403 }), user, role: normalizedRole || role };
    }

    return { errorResponse: null, user, role: normalizedRole };
}

/**
 * Protects a Server Component/Action
 */
export async function protectPage(allowedRoles: ("ADMIN" | "FOUNDER" | "STUDENT" | "STARTUP" | "CLIENT" | "COLLEGE")[]) {
    const user = await getSession();

    if (!user) {
        return { authorized: false, user: null };
    }

    let role = await getUserRoleFromDb(user.id);
    if (!role && user.user_metadata?.role) {
        role = user.user_metadata.role;
    }
    const normalizedRole = role ? role.toUpperCase() : null;

    if (!normalizedRole || !allowedRoles.includes(normalizedRole as (typeof allowedRoles)[number])) {
        logSecurityEvent("AUTH_LOGIN_FAILED", {
            userId: user.id,
            metadata: {
                email: user.email,
                attemptedRole: normalizedRole || role || "unknown",
                allowedRoles,
                context: "page"
            }
        }).catch(() => {});
        return { authorized: false, user, role: normalizedRole || role };
    }


    return { authorized: true, user, role: normalizedRole };
}

/**
 * Ensures user is authenticated, returning the Supabase User or an error Response
 */
export async function requireUser() {
    const user = await getSession();
    if (!user) {
        return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
    }
    return { errorResponse: null, user };
}

/**
 * Ensures user has a specific role, returning the user and role or an error Response
 */
export async function requireRole(allowedRoles: ("ADMIN" | "FOUNDER" | "STUDENT" | "STARTUP" | "CLIENT" | "COLLEGE")[]) {
    const { errorResponse, user } = await requireUser();
    if (errorResponse) return { errorResponse, user: null, role: null };

    let role = await getUserRoleFromDb(user!.id);
    if (!role && user!.user_metadata?.role) {
        role = user!.user_metadata.role;
    }
    const normalizedRole = role ? role.toUpperCase() : null;

    if (!normalizedRole || !allowedRoles.includes(normalizedRole as any)) {
        console.warn(`[AUTH] Unauthorized access attempt by ${user!.email} (Role: ${normalizedRole || role}) to restricted API`);
        logSecurityEvent("AUTH_LOGIN_FAILED", {
            userId: user!.id,
            metadata: {
                email: user!.email,
                attemptedRole: normalizedRole || role || "unknown",
                allowedRoles,
                context: "api"
            }
        }).catch(() => {});
        return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user, role: null };
    }

    return { errorResponse: null, user, role: normalizedRole };
}

/**
 * Ensures user is a Founder
 */
export async function requireFounder() {
    return requireRole(["FOUNDER"]);
}

/**
 * Ensures user is an Administrator
 */
export async function requireAdmin() {
    return requireRole(["ADMIN"]);
}

/**
 * Ensures user is an Employer
 */
export async function requireEmployer() {
    return requireRole(["STARTUP", "CLIENT", "FOUNDER"]);
}

/**
 * Verifies user ownership of a resource
 */
export async function requireOwnership(userId: string, resourceOwnerId: string) {
    if (userId !== resourceOwnerId) {
        return { errorResponse: NextResponse.json({ error: "Forbidden: Ownership required" }, { status: 403 }) };
    }
    return { errorResponse: null };
}

/**
 * Verifies user belongs to an organization
 */
export async function requireOrganizationMember(userId: string, organizationId: string) {
    const membership = await (prisma as any).member.findFirst({
        where: { userId, organizationId },
    });
    if (!membership) {
        return { errorResponse: NextResponse.json({ error: "Forbidden: Member access required" }, { status: 403 }), membership: null };
    }
    return { errorResponse: null, membership };
}

/**
 * Verifies user is a participant of a conversation
 */
export async function requireConversationParticipant(userId: string, conversationId: string) {
    const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            OR: [
                { participant_1: userId },
                { participant_2: userId },
            ],
        },
    });
    if (!conversation) {
        return { errorResponse: NextResponse.json({ error: "Forbidden: Participant access required" }, { status: 403 }), conversation: null };
    }
    return { errorResponse: null, conversation };
}
