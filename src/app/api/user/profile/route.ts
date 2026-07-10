import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security/sanitization";
import { createClient } from "@/lib/supabase/server";
import { isValidUUID } from "@/lib/uuid-utils";

const ProfileUpdateSchema = z.object({
    username: z.string().regex(/^[a-zA-Z0-9_-]*$/, "Invalid username format").max(30).optional().nullable(),
    name: z.string().max(100).optional().nullable(),
    full_name: z.string().max(100).optional().nullable(),
    bio: z.string().max(300).optional().nullable(),
    portfolio: z.string().url("Invalid portfolio URL").or(z.literal("")).optional().nullable(),
    linkedin: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional().nullable(),
    github: z.string().url("Invalid GitHub URL").or(z.literal("")).optional().nullable(),
    instagram: z.string().url("Invalid Instagram URL").or(z.literal("")).optional().nullable(),
    image: z.string().max(1000).optional().nullable(),
    avatar_url: z.string().max(1000).optional().nullable(),
    coverImage: z.string().max(1000).optional().nullable(),
    skills: z.union([z.string(), z.array(z.string())]).optional(),
    college: z.string().max(200).optional().nullable(),
    branch: z.string().max(100).optional().nullable(),
    year: z.string().max(20).optional().nullable(),
    careerGoal: z.string().max(200).optional().nullable(),
    company_name: z.string().max(100).optional().nullable(),
});

export const dynamic = "force-dynamic";

// POST - Called by SignUpForm immediately after supabase.auth.signUp() to create the DB record
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

        if (authError || !authUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, email, name, role } = body;

        if (!id || !email) {
            return NextResponse.json({ error: "id and email are required" }, { status: 400 });
        }

        // Enforce that the user can only create/update their own profile
        if (id !== authUser.id) {
            return NextResponse.json({ error: "Forbidden: Cannot modify another user's profile" }, { status: 403 });
        }

        // 🛡️ UUID Guard: prevent P2023 from SignUpForm passing a non-UUID id
        if (!isValidUUID(id)) {
            console.error(`[PROFILE_POST] Invalid UUID id received: "${id}" (length: ${String(id).length})`);
            return NextResponse.json(
                { error: "Invalid user ID format. Expected a valid UUID." },
                { status: 400 }
            );
        }

        const isFounder = authUser.email === "madhuvalurouthu52@gmail.com";
        const finalRole = isFounder ? "FOUNDER" : (authUser.user_metadata?.role || role || "STUDENT");
        const isAcademicEmail = typeof authUser.email === "string" && (
            authUser.email.endsWith(".edu") || 
            authUser.email.endsWith(".edu.in") || 
            authUser.email.endsWith(".res.in")
        );
        const autoVerify = finalRole === "STUDENT" && isAcademicEmail;

        // Upsert — safe to call even if row already exists (e.g. from auth trigger)
        const user = await prisma.user.upsert({
            where: { id },
            update: {
                name: name || authUser.user_metadata?.name || null,
                ...(isFounder && { role: "FOUNDER" }),
                ...(autoVerify && { isVerified: true })
            },
            create: {
                id,
                email: authUser.email || email,
                name: name || authUser.user_metadata?.name || null,
                role: finalRole,
                isVerified: autoVerify || isFounder,
                college: authUser.user_metadata?.college || body.college || null,
            },
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("PROFILE_POST_ERROR:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// GET - Fetch the current logged-in user's profile
export async function GET() {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { user } = auth;
        if (!user?.id) {
            return NextResponse.json({ error: "Unauthorized: No User ID" }, { status: 401 });
        }

        const results = await Promise.all([
            prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    projects: true,
                    userSkills: true,
                    memberships: {
                        include: {
                            organization: {
                                include: {
                                    subscription: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            gigsPosted: true,
                            applications: true,
                        }
                    }
                }
            }),
            prisma.transaction.aggregate({
                where: {
                    sellerId: user.id,
                    status: "RELEASED"
                },
                _sum: {
                    sellerPayout: true
                }
            }),
            prisma.application.count({
                where: { applicantId: user.id, status: "ACCEPTED" }
            }),
            prisma.conversation.count({
                where: {
                   OR: [
                       { participant_1: user.id },
                       { participant_2: user.id }
                   ]
                }
            })
        ]);

        type ProfileWithCounts = Prisma.UserGetPayload<{
            include: { 
                projects: true; 
                userSkills: true; 
                memberships: {
                    include: {
                        organization: {
                            include: {
                                subscription: true
                            }
                        }
                    }
                };
                _count: { select: { gigsPosted: true; applications: true } } 
            }
        }>;

        let profile = results[0] as ProfileWithCounts | null;
        const earningsAgg = results[1];
        const completedGigs = results[2];
        const connections = results[3];

        const isFounder = user.email === "madhuvalurouthu52@gmail.com";
        const isAcademicEmail = typeof user.email === "string" && (
            user.email.endsWith(".edu") || 
            user.email.endsWith(".edu.in") || 
            user.email.endsWith(".res.in") ||
            isFounder
        );

        if (!profile) {
            const userMetadataRole = user.user_metadata?.role || "STUDENT";
            const finalRole = isFounder ? "FOUNDER" : userMetadataRole;
            const autoVerify = isAcademicEmail || isFounder;
            profile = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email || "",
                    name: user.user_metadata?.name || null,
                    full_name: user.user_metadata?.name || null,
                    role: finalRole,
                    isVerified: autoVerify,
                    college: user.user_metadata?.college || null,
                },
                include: {
                    projects: true,
                    userSkills: true,
                    memberships: {
                        include: {
                            organization: {
                                include: {
                                    subscription: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            gigsPosted: true,
                            applications: true,
                        }
                    }
                }
            }) as ProfileWithCounts;
        } else if (!profile.isVerified && isAcademicEmail) {
            const updated = await prisma.user.update({
                where: { id: profile.id },
                data: { isVerified: true },
                include: {
                    projects: true,
                    userSkills: true,
                    memberships: {
                        include: {
                            organization: {
                                include: {
                                    subscription: true
                                }
                            }
                        }
                    },
                    _count: {
                        select: {
                            gigsPosted: true,
                            applications: true,
                        }
                    }
                }
            });
            profile = updated as ProfileWithCounts;
        }

        // B2B Fallback Organization Creation for Clients & Founders
        const isClientOrFounder = profile.role === "CLIENT" || profile.role === "STARTUP" || profile.role === "FOUNDER";
        if (isClientOrFounder && profile.memberships.length === 0) {
            const orgName = profile.company_name || profile.full_name || profile.name || "My Corporate Studio";
            const orgSlug = `org-${profile.id.substring(0, 8)}`;
            try {
                await prisma.organization.create({
                    data: {
                        name: orgName,
                        slug: orgSlug,
                        subscription: {
                            create: {
                                plan: "FREE",
                                status: "ACTIVE",
                                currentPeriodStart: new Date(),
                                currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                            }
                        },
                        members: {
                            create: {
                                userId: profile.id,
                                role: "OWNER"
                            }
                        }
                    }
                });

                const refreshedProfile = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        projects: true,
                        userSkills: true,
                        memberships: {
                            include: {
                                organization: {
                                    include: {
                                        subscription: true
                                    }
                                }
                            }
                        },
                        _count: {
                            select: {
                                gigsPosted: true,
                                applications: true,
                            }
                        }
                    }
                }) as ProfileWithCounts;
                
                if (refreshedProfile) {
                    profile = refreshedProfile;
                }
            } catch (err) {
                console.error("Failed to create fallback organization:", err);
            }
        }

        const earnings = Number(earningsAgg?._sum?.sellerPayout || 0);
        const count = profile._count || { gigsPosted: 0, applications: 0 };

        const stats = {
            earnings: earnings,
            activeGigs: count.gigsPosted || 0,
            pendingApplications: count.applications || 0,
            completedGigs: completedGigs,
            connections: connections || 0,
            reputationPoints: 100 + (profile?.userSkills?.length || 0) * 5 + completedGigs * 15,
            responseRate: Math.min(99, 80 + completedGigs * 2),
        };

        const formattedProfile = {
            ...profile,
            skills: profile.skills ? (Array.isArray(profile.skills) ? profile.skills : (profile.skills as string).split(",")) : [],
            stats
        };

        return NextResponse.json(formattedProfile);
    } catch (error: unknown) {
        console.error("Profile API error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const auth = await protectApi(["FOUNDER", "STUDENT", "STARTUP", "CLIENT"]);
        if (auth.errorResponse) return auth.errorResponse;

        const { user } = auth;
        let body;
        try {
            body = await req.json();
        } catch {
            return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
        }

        const parseResult = ProfileUpdateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json(
                { error: "Validation failed", details: parseResult.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const data = parseResult.data;

        // Sanitize string inputs
        const username = data.username !== undefined ? (data.username ? sanitizeInput(data.username) : null) : undefined;
        const name = data.name !== undefined ? (data.name ? sanitizeInput(data.name) : null) : undefined;
        const full_name = data.full_name !== undefined ? (data.full_name ? sanitizeInput(data.full_name) : null) : undefined;
        const bio = data.bio !== undefined ? (data.bio ? sanitizeInput(data.bio) : null) : undefined;
        const portfolio = data.portfolio !== undefined ? (data.portfolio ? sanitizeInput(data.portfolio) : null) : undefined;
        const linkedin = data.linkedin !== undefined ? (data.linkedin ? sanitizeInput(data.linkedin) : null) : undefined;
        const github = data.github !== undefined ? (data.github ? sanitizeInput(data.github) : null) : undefined;
        const instagram = data.instagram !== undefined ? (data.instagram ? sanitizeInput(data.instagram) : null) : undefined;
        const image = data.image !== undefined ? (data.image ? sanitizeInput(data.image) : null) : undefined;
        const avatar_url = data.avatar_url !== undefined ? (data.avatar_url ? sanitizeInput(data.avatar_url) : null) : undefined;
        const coverImage = data.coverImage !== undefined ? (data.coverImage ? sanitizeInput(data.coverImage) : null) : undefined;
        const college = data.college !== undefined ? (data.college ? sanitizeInput(data.college) : null) : undefined;
        const branch = data.branch !== undefined ? (data.branch ? sanitizeInput(data.branch) : null) : undefined;
        const year = data.year !== undefined ? (data.year ? sanitizeInput(data.year) : null) : undefined;
        const careerGoal = data.careerGoal !== undefined ? (data.careerGoal ? sanitizeInput(data.careerGoal) : null) : undefined;
        const company_name = data.company_name !== undefined ? (data.company_name ? sanitizeInput(data.company_name) : null) : undefined;

        let formattedSkills: string | null | undefined = undefined;
        if (data.skills !== undefined) {
            if (data.skills === null) {
                formattedSkills = null;
            } else {
                const skillsArr = Array.isArray(data.skills) ? data.skills : data.skills.split(",");
                formattedSkills = skillsArr.map(s => sanitizeInput(s)).join(",");
            }
        }

        const updateData: any = {
            last_seen: new Date()
        };

        if (username !== undefined) updateData.username = username;
        if (full_name !== undefined || name !== undefined) {
            const finalName = full_name || name;
            updateData.name = finalName;
            updateData.full_name = finalName;
        }
        if (bio !== undefined) updateData.bio = bio;
        if (portfolio !== undefined) updateData.portfolio = portfolio;
        if (linkedin !== undefined) updateData.linkedin = linkedin;
        if (github !== undefined) updateData.github = github;
        if (instagram !== undefined) updateData.instagram = instagram;
        if (image !== undefined || avatar_url !== undefined) {
            const finalImg = avatar_url || image;
            updateData.image = finalImg;
            updateData.avatar_url = finalImg;
        }
        if (coverImage !== undefined) updateData.coverImage = coverImage;
        if (college !== undefined) updateData.college = college;
        if (branch !== undefined) updateData.branch = branch;
        if (year !== undefined) updateData.year = year;
        if (careerGoal !== undefined) updateData.careerGoal = careerGoal;
        if (company_name !== undefined) updateData.company_name = company_name;
        if (body.resumeData !== undefined) updateData.resumeData = body.resumeData;
        if (formattedSkills !== undefined) updateData.skills = formattedSkills;

        const updatedProfile = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
        });

        // B2B SaaS: Update owner organization record if mapping parameters match
        const userWithOrg = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                memberships: {
                    where: { role: "OWNER" },
                    include: { organization: true }
                }
            }
        });

        const ownerMembership = userWithOrg?.memberships?.[0];
        if (ownerMembership) {
            const orgUpdateData: any = {};
            if (body.company_name) orgUpdateData.name = body.company_name;
            if (body.company_size) orgUpdateData.size = body.company_size;
            if (body.company_website) orgUpdateData.website = body.company_website;
            if (body.company_bio) orgUpdateData.bio = body.company_bio;
            if (body.company_logo) orgUpdateData.logo = body.company_logo;
            if (body.company_techStack) {
                orgUpdateData.techStack = Array.isArray(body.company_techStack) 
                    ? body.company_techStack 
                    : (body.company_techStack as string).split(",").map(t => t.trim()).filter(Boolean);
            }
            if (Object.keys(orgUpdateData).length > 0) {
                await prisma.organization.update({
                    where: { id: ownerMembership.organizationId },
                    data: orgUpdateData
                });
            }
        }

        // Pre-compute user vector embedding asynchronously in the background (fire-and-forget)
        if (data.skills !== undefined || bio !== undefined || careerGoal !== undefined || college !== undefined) {
            import("@/lib/ai/embeddings").then(({ computeUserEmbedding }) => {
                computeUserEmbedding(user.id).catch(err => {
                    console.error("[PROFILE_PATCH] Asynchronous embedding update failed:", err);
                });
            });
        }

        return NextResponse.json(updatedProfile);
    } catch (error: unknown) {
        console.error("Profile API Update Error:", error);
        // Prisma unique constraint violation on username
        if (error instanceof Error && 'code' in error) {
            const prismaErr = error as Error & { code?: string; meta?: { target?: string[] } };
            if (prismaErr.code === 'P2002' && prismaErr.meta?.target?.includes('username')) {
                return NextResponse.json({ error: "Username is already taken. Please choose another one." }, { status: 400 });
            }
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    return PATCH(req);
}
