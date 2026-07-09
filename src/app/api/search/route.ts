import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q");
        const type = searchParams.get("type"); // 'gigs', 'users', 'all'
        const limit = parseInt(searchParams.get("limit") || "20");

        if (!query || query.trim().length < 2) {
            return NextResponse.json({
                error: "Search query must be at least 2 characters"
            }, { status: 400 });
        }

        const searchTerm = query.trim().toLowerCase();

        const results: {
            gigs?: unknown[];
            users?: unknown[];
            skills?: string[];
        } = {};

        // Search Gigs
        if (!type || type === "all" || type === "gigs") {
            const gigs = await prisma.gig.findMany({
                where: {
                    OR: [
                        {
                            title: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            description: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            tags: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ],
                    status: "OPEN"
                },
                include: {
                    poster: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            applications: true
                        }
                    }
                },
                take: limit,
                orderBy: {
                    createdAt: "desc"
                }
            });

            results.gigs = gigs;
        }

        // Search Users
        if (!type || type === "all" || type === "users") {
            const users = await prisma.user.findMany({
                where: {
                    OR: [
                        {
                            name: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            skills: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        },
                        {
                            bio: {
                                contains: searchTerm,
                                mode: "insensitive"
                            }
                        }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    bio: true,
                    skills: true,
                    _count: {
                        select: {
                            gigsPosted: true,
                            applications: true
                        }
                    }
                },
                take: limit
            });

            results.users = users;
        }

        // Extract unique skills from search results
        if (!type || type === "all" || type === "skills") {
            const allSkills = await prisma.user.findMany({
                where: {
                    skills: {
                        contains: searchTerm,
                        mode: "insensitive"
                    }
                },
                select: {
                    skills: true
                },
                take: 50
            });

            const skillsSet = new Set<string>();
            allSkills.forEach((user: any) => {
                if (user.skills) {
                    const skills = user.skills.split(",").map((s: any) => s.trim());
                    skills.forEach((skill: any) => {
                        if (skill.toLowerCase().includes(searchTerm)) {
                            skillsSet.add(skill);
                        }
                    });
                }
            });

            results.skills = Array.from(skillsSet).slice(0, 10);
        }

        return NextResponse.json({
            query: searchTerm,
            results,
            totalResults: {
                gigs: results.gigs?.length || 0,
                users: results.users?.length || 0,
                skills: results.skills?.length || 0
            }
        });

    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({
            error: "Failed to perform search"
        }, { status: 500 });
    }
}
