import { FileText } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/Card";
import { protectPage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";



export default async function ApplicationsOverviewPage() {
    const { authorized } = await protectPage(["FOUNDER"]);

    if (!authorized) {
        redirect("/dashboard");
    }

    const applications = await prisma.application.findMany({
        orderBy: { createdAt: "desc" },
        take: 30, // Most recent applications
        include: {
            applicant: { select: { name: true, email: true } },
            gig: { select: { title: true, budget: true, poster: { select: { name: true } } } }
        }
    });

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10">
            <div>
                <h1 className="md:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                    <FileText className="text-orange-500" size={32} />
                    Platform <span className="text-orange-500">Applications</span>
                </h1>
                <p className="text-slate-500 font-medium mt-1">Recent gig and internship applications across the platform.</p>
            </div>

            <div className="bg-[#111116] rounded-3xl p-4 md:p-8 shadow-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="overflow-x-auto relative z-10">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-white/5 font-black uppercase tracking-widest text-slate-500">
                                <th className="pb-6 pr-4">Applicant</th>
                                <th className="pb-6 px-4">Opportunity</th>
                                <th className="pb-6 px-4">Poster</th>
                                <th className="pb-6 px-4">Status</th>
                                <th className="pb-6 px-4">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {applications.map((app: any) => (
                                <tr key={app.id} className="hover:bg-white/2 transition-colors group/row">
                                    <td className="py-5 pr-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center font-black text-xs">
                                                {app.applicant.name?.charAt(0) || "U"}
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm group-hover/row:text-orange-400 transition-colors">
                                                    {app.applicant.name || app.applicant.email}
                                                </p>
                                                <p className="text-slate-500 font-medium">{app.applicant.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4">
                                        <Link href={`/gigs/${app.gig?.title ? app.gigId : ""}`} className="font-bold hover:text-orange-500 transition-colors line-clamp-1 text-sm underline decoration-white/10 underline-offset-4">
                                            {app.gig?.title || "Unknown Gig"}
                                        </Link>
                                    </td>
                                    <td className="py-5 px-4">
                                        <p className="text-sm font-medium">{app.gig?.poster?.name || "Unknown"}</p>
                                    </td>
                                    <td className="py-5 px-4">
                                        <span className={`px-2.5 py-1 rounded-lg font-black uppercase tracking-widest border ${app.status === 'HIRED' || app.status === 'ACCEPTED' ? 'bg-emerald-500/10' : app.status === 'REJECTED' ? 'bg-rose-500/10' : 'bg-orange-500/10 text-orange-400 border-orange-500/20' }`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-4 text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest">
                                            {new Date(app.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {applications.length === 0 && (
                        <div className="text-center py-10">
                            <FileText size={48} className="mx-auto text-slate-700 mb-3" />
                            <p className="text-slate-500 font-medium">No applications found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
