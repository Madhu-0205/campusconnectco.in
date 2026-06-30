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
        return dbUser?.role ?? null;
    } catch (error) {
        console.error("Role fetch failed:", error);
        return null;
    }
}

/**
 * Protects an API route by validating session and role from database
 */
export async function protectApi(allowedRoles: ("FOUNDER" | "STUDENT" | "STARTUP" | "CLIENT")[]) {
    const user = await getSession();

    if (!user) {
        return { errorResponse: new NextResponse("Unauthorized", { status: 401 }), user: null };
    }

    const role = await getUserRoleFromDb(user.id);

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
        console.warn(`[AUTH] Unauthorized access attempt by ${user.email} (Role: ${role}) to restricted API`);
        logSecurityEvent("AUTH_LOGIN_FAILED", {
            userId: user.id,
            metadata: {
                email: user.email,
                attemptedRole: role || "unknown",
                allowedRoles,
                context: "api"
            }
        }).catch(() => {});
        return { errorResponse: new NextResponse("Forbidden", { status: 403 }), user };
    }

    return { errorResponse: null, user, role };
}

/**
 * Protects a Server Component/Action
 */
export async function protectPage(allowedRoles: ("FOUNDER" | "STUDENT" | "STARTUP" | "CLIENT")[]) {
    const user = await getSession();

    if (!user) {
        return { authorized: false, user: null };
    }

    const role = await getUserRoleFromDb(user.id);

    if (!allowedRoles.includes(role as (typeof allowedRoles)[number])) {
        logSecurityEvent("AUTH_LOGIN_FAILED", {
            userId: user.id,
            metadata: {
                email: user.email,
                attemptedRole: role || "unknown",
                allowedRoles,
                context: "page"
            }
        }).catch(() => {});
        return { authorized: false, user, role };
    }


    return { authorized: true, user, role };
}
