import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/uuid-utils";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const roleParam = searchParams.get("role");

    // Clean up origin base URL to prevent redirect loop or protocol mismatch
    const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL || origin;
    const baseUrl = rawAppUrl.endsWith('/') ? rawAppUrl.slice(0, -1) : rawAppUrl;

    console.log("[OAuth Callback] Starting code-to-session exchange", {
        origin,
        baseUrl,
        hasCode: !!code,
        roleParam
    });

    if (!code) {
        console.warn("[OAuth Callback] Missing code param, redirecting to sign-in.");
        return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=missing_code`);
    }

    try {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("[OAuth Callback] exchangeCodeForSession failed:", {
                message: error.message,
                status: error.status,
                name: error.name,
                cause: error.cause,
                stack: error.stack
            });

            if (process.env.NODE_ENV === "development") {
                return NextResponse.json({
                    error: "OAuth Exchange Failed",
                    details: error.message,
                    status: error.status,
                    hint: "This typically occurs if the Client ID, Client Secret, or Redirect URI configured in Google Cloud Console or Supabase Dashboard are mismatched or invalid. Make sure the Google Provider status is enabled on Supabase, and redirect URL matches 'https://ybulpuxwqimxfgvzzuih.supabase.co/auth/v1/callback'."
                }, { status: 500 });
            }
            return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=oauth_failed&details=${encodeURIComponent(error.message)}`);
        }

        console.log("[OAuth Callback] Code exchange succeeded, fetching user...");
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error("[OAuth Callback] getUser failed or user is null:", userError);
            if (process.env.NODE_ENV === "development") {
                return NextResponse.json({
                    error: "User Retrieval Failed",
                    details: userError?.message || "User is null after successful session exchange."
                }, { status: 500 });
            }
            return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=no_user`);
        }

        console.log("[OAuth Callback] User retrieved successfully", { userId: user.id, email: user.email });

        // 🛡️ Critical UUID guard — Supabase can return a temporary non-UUID id during OAuth flow
        if (!isValidUUID(user.id)) {
            console.error(`[OAuth Callback] Invalid user.id from Supabase: "${user.id}" (length: ${String(user.id).length}). Blocking DB write.`);
            if (process.env.NODE_ENV === "development") {
                return NextResponse.json({
                    error: "Invalid User UUID",
                    details: `User ID returned is not a valid UUID: "${user.id}"`
                }, { status: 500 });
            }
            return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=invalid_session`);
        }

        let redirectPath = "/dashboard/student";
        let userRole = "STUDENT";

        // Validate collegeId if present
        let validatedCollegeId = user.user_metadata?.collegeId || null;
        if (validatedCollegeId) {
            const collegeExists = await prisma.college.findUnique({
                where: { id: validatedCollegeId },
                select: { id: true }
            });
            if (!collegeExists) {
                console.warn(`[OAuth Callback] Invalid collegeId ${validatedCollegeId} for user ${user.id}, ignoring.`);
                validatedCollegeId = null;
            }
        }

        // Upsert the user into our DB (handles Google signup automatically) and fetch role
        try {
            console.log("[OAuth Callback] Upserting user into database...", { userId: user.id });
            const profile = await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    // Update name/image if provided by Google and not already set
                    ...(user.user_metadata?.full_name && { name: user.user_metadata.full_name }),
                    ...(user.user_metadata?.avatar_url && { image: user.user_metadata.avatar_url }),
                },
                create: {
                    id: user.id,
                    email: user.email!,
                    name: user.user_metadata?.full_name || user.user_metadata?.name || null,
                    image: user.user_metadata?.avatar_url || null,
                    role: user.email === "madhuvalurouthu52@gmail.com" 
                        ? "FOUNDER" 
                        : (user.user_metadata?.role || roleParam || "STUDENT"),
                    college: user.user_metadata?.college || null,
                    collegeId: validatedCollegeId,
                    acceptedTerms: true,
                    acceptedTermsAt: new Date(),
                    acceptedTermsVersion: "1.0",
                },
                select: {
                    role: true,
                    city: true,
                    collegeId: true,
                    latitude: true,
                },
            });

            if (profile?.role) {
                userRole = profile.role;
                console.log("[OAuth Callback] Database upsert succeeded", { userRole });
                
                // Location onboarding check
                if (userRole === "STUDENT") {
                    if (!profile.city && !profile.collegeId) {
                        redirectPath = "/onboarding";
                    } else if (!profile.city && profile.collegeId) {
                        redirectPath = "/onboarding?step=1";
                    } else if (profile.city && !profile.collegeId) {
                        redirectPath = "/onboarding?step=2";
                    }
                }
            }
        } catch (dbError) {
            console.error("[OAuth Callback] Database operations failed:", dbError);
            // Best-effort fallback
            userRole = user.email === "madhuvalurouthu52@gmail.com" ? "FOUNDER" : (roleParam || "STUDENT");
        }

        // Sync the user role back to Supabase metadata if different
        if (user.user_metadata?.role !== userRole) {
            try {
                console.log("[OAuth Callback] Syncing role metadata to Supabase...", { targetRole: userRole });
                await supabase.auth.updateUser({
                    data: { role: userRole }
                });
            } catch (metaError) {
                console.error("[OAuth Callback] Failed to sync user metadata role:", metaError);
            }
        }

        if (userRole === "FOUNDER") {
            redirectPath = "/dashboard/founder";
        } else if (userRole === "CLIENT" || userRole === "STARTUP") {
            redirectPath = "/client-hub";
        }

        // If a next parameter was provided (e.g. for password reset), use it instead of the default role-based redirect
        const next = searchParams.get("next");
        if (next && next.startsWith("/")) {
            redirectPath = next;
        }

        console.log("[OAuth Callback] Redirecting to path:", redirectPath);
        return NextResponse.redirect(`${baseUrl}${redirectPath}`);

    } catch (globalError: any) {
        console.error("[OAuth Callback] Uncaught global error:", globalError);
        if (process.env.NODE_ENV === "development") {
            return NextResponse.json({
                error: "Internal Server Error in Callback Route",
                message: globalError instanceof Error ? globalError.message : String(globalError),
                stack: globalError instanceof Error ? globalError.stack : undefined
            }, { status: 500 });
        }
        return NextResponse.redirect(`${baseUrl}/auth/sign-in?error=server_error`);
    }
}
