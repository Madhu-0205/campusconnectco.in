 
import { Prisma } from "@prisma/client"
import { MapPin, Sparkles, Clock, Users, IndianRupee, ArrowUpRight } from "lucide-react"



import { calculateDistance, calculateMatchScore } from "@/lib/matching"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

import { AICoverLetterButton } from "./AICoverLetterButton"
import { ApplyButton } from "./ApplyButton"

 

type GigWithPoster = Prisma.GigGetPayload<{
    include: {
        poster: {
            select: { name: true; image: true }
        }
        applications: {
            select: { id: true }
        }
        gigSkills: {
            include: { skill: { select: { name: true; color: true } } }
        }
    }
}>

export async function GigList({ searchParams }: { searchParams?: { q?: string; lat?: string; lng?: string; category?: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let dbUser: { skills: string | null; latitude: number | null; longitude: number | null } | null = null;
    if (user) {
        dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { skills: true, latitude: true, longitude: true }
        });
    }

    let gigs: GigWithPoster[] = [];
    try {
        gigs = await prisma.gig.findMany({
            where: {
                status: "OPEN",
                ...(searchParams?.q ? {
                    OR: [
                        { title: { contains: searchParams.q, mode: "insensitive" } },
                        { description: { contains: searchParams.q, mode: "insensitive" } },
                    ]
                } : {})
            },
            include: {
                poster: { select: { name: true, image: true } },
                applications: { select: { id: true } },
                gigSkills: { include: { skill: { select: { name: true, color: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: 30,
        });
    } catch (error) {
        console.error("Failed to fetch gigs:", error);
        return (
            <div className="p-8 text-center rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <p className="font-black text-red-700 dark:text-red-400 mb-1">Failed to load gigs</p>
                <p className="text-red-500">Please check your database connection and try again.</p>
            </div>
        )
    }

    if (gigs.length === 0) {
        return (
            <div className="p-16 text-center rounded-2xl border border-border">
                <div className="w-16 h-16 mx-auto bg-accent dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="text-slate-400" size={24} />
                </div>
                <h3 className="font-black text-muted-foreground dark:text-slate-300 mb-1">No gigs found</h3>
                <p className="text-slate-500">Be the first to post one — or adjust your search.</p>
            </div>
        )
    }

    const parseCoord = (val: string | undefined | null) => {
        if (!val) return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
    };

    const searchLat = parseCoord(searchParams?.lat) ?? dbUser?.latitude;
    const searchLng = parseCoord(searchParams?.lng) ?? dbUser?.longitude;

    const ratedGigs = gigs.map(gig => {
        const distance = (searchLat != null && searchLng != null && gig.latitude != null && gig.longitude != null)
            ? calculateDistance(searchLat as number, searchLng as number, gig.latitude as number, gig.longitude as number)
            : null;
        const matchScore = dbUser ? calculateMatchScore(dbUser.skills, gig.tags) : 0;
        return { ...gig, distance, matchScore };
    });

    if (dbUser) {
        ratedGigs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    const daysAgo = (date: Date) => {
        const diff = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
        return diff === 0 ? "Today" : diff === 1 ? "1d ago" : `${diff}d ago`;
    };

    return (
        <div className="space-y-4">
            <p className="font-bold text-slate-500 dark:text-slate-400">
                <span className="text-foreground dark:text-white font-black">{gigs.length}</span> opportunities found
            </p>

            {ratedGigs.map((gig) => (
                <div key={gig.id}
                    className="group relative bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 hover:border-electric/40 hover:shadow-lg transition-all overflow-hidden cursor-pointer">

                    {/* Best Match Banner */}
                    {gig.matchScore > 80 && (
                        <div className="absolute top-0 right-0 bg-foreground text-background text-[10px] font-black px-3 py-1.5 rounded-bl-2xl flex items-center gap-1">
                            <Sparkles size={9} /> BEST MATCH
                        </div>
                    )}

                    <div className="flex gap-5">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-accent dark:bg-slate-800 shrink-0 flex items-center justify-center font-black text-slate-400 dark:text-slate-500 group-hover:bg-accent text-foreground group-hover:text-foreground transition-colors border border-border">
                            {gig.poster.name?.[0]?.toUpperCase() || "C"}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h3 className="font-black text-foreground dark:text-white group-hover:text-foreground transition-colors truncate">
                                            {gig.title}
                                        </h3>
                                        {gig.matchScore > 0 && (
                                            <span className={`font-black px-2 py-0.5 rounded-full shrink-0 ${gig.matchScore > 60 ? "bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-accent text-muted-foreground dark:bg-slate-800 dark:text-slate-400"}`}>
                                                {gig.matchScore}% Match
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <span className="font-semibold">{gig.poster.name || "Student Poster"}</span>
                                        <span>·</span>
                                        <span>{daysAgo(gig.createdAt)}</span>
                                        {gig.distance && (
                                            <>
                                                <span>·</span>
                                                <span className="flex items-center gap-1"><MapPin size={11} />{gig.distance.toFixed(1)}km away</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                    <AICoverLetterButton gigId={gig.id} gigTitle={gig.title} />
                                    <ApplyButton gigId={gig.id} />
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-muted-foreground dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                                {gig.description}
                            </p>

                            {/* Skills Tags */}
                            {gig.gigSkills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {gig.gigSkills.slice(0, 4).map(gs => (
                                        <span key={gs.skillId} className="px-2.5 py-1 rounded-lg font-bold bg-accent dark:bg-slate-800 text-muted-foreground dark:text-slate-300 border border-border">
                                            {gs.skill.name}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Meta row */}
                            <div className="flex items-center flex-wrap gap-4 text-xs">
                                <div className="flex items-center gap-1.5 font-black dark:text-emerald-400 text-sm">
                                    <IndianRupee size={13} />
                                    {gig.budget.toLocaleString()}
                                </div>
                                {gig.deadline && (
                                    <div className="flex items-center gap-1 text-slate-500">
                                        <Clock size={11} />
                                        Due {new Date(gig.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-slate-500">
                                    <Users size={11} />
                                    {gig.applications.length} applicant{gig.applications.length !== 1 ? "s" : ""}
                                </div>
                                <div className="ml-auto">
                                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-foreground transition-colors" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
