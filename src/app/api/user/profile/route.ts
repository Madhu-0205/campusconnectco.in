import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { protectApi } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";
import { isValidUUID } from "@/lib/uuid-utils";

export const dynamic = "force-dynamic";

// POST - Called by SignUpForm immediately after supabase.auth.signUp() to create the DB record
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, email, name, role } = body;

        if (!id || !email) {
            return NextResponse.json({ error: "id and email are required" }, { status: 400 });
        }

        // 🛡️ UUID Guard: prevent P2023 from SignUpForm passing a non-UUID id
        if (!isValidUUID(id)) {
            console.error(`[PROFILE_POST] Invalid UUID id received: "${id}" (length: ${String(id).length})`);
            return NextResponse.json(
                { error: "Invalid user ID format. Expected a valid UUID." },
                { status: 400 }
            );
        }

        const isFounder = email === "madhuvalurouthu52@gmail.com";
        const finalRole = isFounder ? "FOUNDER" : (role || "STUDENT");
        const isAcademicEmail = typeof email === "string" && (
            email.endsWith(".edu") || 
            email.endsWith(".edu.in") || 
            email.endsWith(".res.in")
        );
        const autoVerify = finalRole === "STUDENT" && isAcademicEmail;

        // Upsert — safe to call even if row already exists (e.g. from auth trigger)
        const user = await prisma.user.upsert({
            where: { id },
            update: {
                name: name || null,
                ...(isFounder && { role: "FOUNDER" }),
                ...(autoVerify && { isVerified: true })
            },
            create: {
                id,
                email,
                name: name || null,
                role: finalRole,
                isVerified: autoVerify || isFounder,
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
            const autoVerify = isAcademicEmail || isFounder;
            profile = await prisma.user.create({
                data: {
                    id: user.id,
                    email: user.email || "",
                    name: user.user_metadata?.name || null,
                    full_name: user.user_metadata?.name || null,
                    role: isFounder ? "FOUNDER" : "STUDENT",
                    isVerified: autoVerify
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
        const body = await req.json();
        
        const {
            username, name, full_name, bio, portfolio, linkedin, github, instagram, image, avatar_url,
            coverImage, skills, college, branch, year, careerGoal, company_name, resumeData
        } = body;

        const updatedProfile = await prisma.user.update({
            where: { id: user.id },
            data: {
                username,
                name: full_name || name,
                full_name: full_name || name,
                bio, portfolio, linkedin, github, instagram, 
                image: avatar_url || image,
                avatar_url: avatar_url || image,
                coverImage,
                college, branch, year, careerGoal, company_name,
                ...(resumeData !== undefined && { resumeData }),
                ...(skills !== undefined && { 
                    skills: Array.isArray(skills) ? skills.join(',') : skills 
                }),
                last_seen: new Date()
            },
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
        if (skills !== undefined || bio !== undefined || careerGoal !== undefined || college !== undefined) {
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
