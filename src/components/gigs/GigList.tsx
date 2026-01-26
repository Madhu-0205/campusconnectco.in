import { Card } from "@/components/ui/Card"
import prisma from "@/lib/prisma"
import { MapPin, Sparkles } from "lucide-react"
import { ApplyButton } from "./ApplyButton"
import { Prisma } from "@prisma/client"
import { auth } from "@/lib/auth"
import { calculateDistance, calculateMatchScore } from "@/lib/matching"

type GigWithPoster = Prisma.GigGetPayload<{
    include: {
        poster: {
            select: { name: true, image: true }
        }
    }
}>

export async function GigList({ searchParams }: { searchParams?: { q?: string, lat?: string, lng?: string } }) {
    const session = await auth();
    const userEmail = session?.user?.email;

    let user: any = null;
    if (userEmail) {
        user = await prisma.user.findUnique({
            where: { email: userEmail },
            select: { skills: true, latitude: true, longitude: true } as any
        });
    }

    let gigs: any[] = [];
    try {
        gigs = await prisma.gig.findMany({
            where: {
                status: "OPEN",
                title: {
                    contains: searchParams?.q
                }
            },
            include: {
                poster: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }) as any;
    } catch (error) {
        console.error("Failed to fetch gigs:", error);
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
                <p className="font-bold">Error loading gigs</p>
                <p className="text-sm">Please check your connection and try again.</p>
            </div>
        )
    }

    if (gigs.length === 0) {
        return <div className="text-center py-10 text-slate-500">No gigs found. Check back later!</div>
    }

    const parseCoord = (val: string | undefined | null) => {
        if (!val) return null;
        const parsed = parseFloat(val);
        return isNaN(parsed) ? null : parsed;
    };

    const searchLat = parseCoord(searchParams?.lat) ?? user?.latitude;
    const searchLng = parseCoord(searchParams?.lng) ?? user?.longitude;

    const ratedGigs = gigs.map(gig => {
        const distance = (searchLat != null && searchLng != null && gig.latitude != null && gig.longitude != null)
            ? calculateDistance(searchLat as number, searchLng as number, gig.latitude as number, gig.longitude as number)
            : null;

        const matchScore = user ? calculateMatchScore(user.skills, gig.tags) : 0;

        return { ...gig, distance, matchScore };
    });

    // Sort by match score if user is logged in
    if (user) {
        ratedGigs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
    }

    return (
        <div className="space-y-4">
            {ratedGigs.map((gig) => (
                <Card key={gig.id} className="flex flex-col md:flex-row gap-6 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group">
                    {gig.matchScore > 80 && (
                        <div className="absolute top-0 right-0 bg-electric text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 z-10">
                            <Sparkles size={10} /> BEST MATCH
                        </div>
                    )}

                    <div className="h-16 w-16 rounded-xl bg-slate-100 shrink-0 flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-electric/10 group-hover:text-electric transition-colors">
                        {gig.poster.name?.[0] || "C"}
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg group-hover:text-electric transition-colors">{gig.title}</h3>
                                    {gig.matchScore > 0 && (
                                        <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                                            {gig.matchScore}% Match
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mb-3">{gig.poster.name || "Client"} • Posted {new Date(gig.createdAt).toLocaleDateString()}</p>
                                <div className="flex items-center gap-4 text-sm text-slate-600">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={16} className="text-slate-400" />
                                        <span className="text-slate-500">{gig.distance ? `Located ${gig.distance.toFixed(1)} km from you` : 'Remote / Flexible'}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-slate-900">₹{gig.budget}</span>
                                        <span className="text-slate-400">Total Payout</span>
                                    </div>
                                </div>
                            </div>
                            <ApplyButton gigId={gig.id} />
                        </div>
                        <p className="mt-3 text-slate-600 text-sm line-clamp-2">
                            {gig.description}
                        </p>
                    </div>
                </Card>
            ))}
        </div>
    )
}

