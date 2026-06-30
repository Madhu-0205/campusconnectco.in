import Link from "next/link";
import { redirect } from "next/navigation";

import { protectPage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

import ReportsClientComponent from "./ReportsClientComponent";

export default async function ReportsPage() {
    const { authorized } = await protectPage(["FOUNDER"]);
    if (!authorized) redirect("/dashboard");

    const now = new Date();

    // Generate last 6 months array
    const months: { start: Date; end: Date; label: string }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
        const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
        months.push({ start: d, end, label });
    }

    let totalUsers = 0;
    let totalGigs = 0;
    let totalApplications = 0;
    let totalInternships = 0;
    let totalRevenue: any = { _sum: { platformFee: null } };
    let recentActivity: number[] = new Array(months.length).fill(0);
    let internshipBreakdown: any[] = [];
    let monthlyGigs: number[] = new Array(months.length).fill(0);
    let monthlyApps: number[] = new Array(months.length).fill(0);
    let monthlyEscrow: any[] = new Array(months.length).fill({ _sum: { platformFee: null } });
    let dbError = false;

    try {
        const [
            tUsers,
            tGigs,
            tApps,
            tInterns,
            tRev,
            recentAct,
            internBreakdown,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.gig.count(),
            prisma.application.count(),
            prisma.internship.count(),
            prisma.escrow.aggregate({ where: { status: "RELEASED" }, _sum: { platformFee: true } }),
            // Get monthly user registrations for chart
            Promise.all(months.map((m) =>
                prisma.user.count({ where: { createdAt: { gte: m.start, lte: m.end } } })
            )),
            // Internship status breakdown
            prisma.internship.groupBy({ by: ["status"], _count: true }),
        ]);

        totalUsers = tUsers;
        totalGigs = tGigs;
        totalApplications = tApps;
        totalInternships = tInterns;
        totalRevenue = tRev;
        recentActivity = recentAct;
        internshipBreakdown = internBreakdown;

        monthlyGigs = await Promise.all(months.map((m) =>
            prisma.gig.count({ where: { createdAt: { gte: m.start, lte: m.end } } })
        ));

        monthlyApps = await Promise.all(months.map((m) =>
            prisma.application.count({ where: { createdAt: { gte: m.start, lte: m.end } } })
        ));

        monthlyEscrow = await Promise.all(months.map((m) =>
            prisma.escrow.aggregate({
                where: { createdAt: { gte: m.start, lte: m.end }, status: "RELEASED" },
                _sum: { platformFee: true }
            })
        ));
    } catch (err) {
        console.error("[REPORTS_PAGE_DB_ERROR]:", err);
        dbError = true;
    }

    const chartData = months.map((m, i) => ({
        month: m.label,
        users: recentActivity[i] || 0,
        gigs: monthlyGigs[i] || 0,
        applications: monthlyApps[i] || 0,
        revenue: Number(((monthlyEscrow[i]?._sum?.platformFee || 0) * 10).toFixed(0)),
    }));

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 pb-20 pt-6">
            {dbError && (
                <div className="p-4 rounded-2xl border border-red-500/20 bg-red-500/10 text-red-200 flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div>
                        <h4 className="font-black text-sm flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Database Connection Issue
                        </h4>
                        <p className="text-xs text-red-300/80 mt-1">Platform analytics and metrics are temporarily offline. Retrying in the background.</p>
                    </div>
                    <Link href="/dashboard/founder/reports" className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-black transition-colors shrink-0">
                        Refresh Reports
                    </Link>
                </div>
            )}
            <ReportsClientComponent
                summary={{
                    totalUsers,
                    totalGigs,
                    totalApplications,
                    totalInternships,
                    totalRevenue: Number(((totalRevenue?._sum?.platformFee || 0)).toFixed(2)),
                }}
                chartData={chartData}
                internshipBreakdown={internshipBreakdown.map((r: any) => ({ status: r.status, count: r._count }))}
            />
        </div>
    );
}

