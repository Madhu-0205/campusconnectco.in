import { GraduationCap, Users, BarChart } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/Card";

export default function CollegeDashboard() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-primary rounded-full" />
                    <span className="font-bold text-primary uppercase tracking-widest">Dashboard</span>
                </div>
                <h1 className="font-black text-3xl md:text-5xl text-slate-900 tracking-tight">
                    College Portal
                </h1>
                <p className="text-slate-500 font-medium text-lg">
                    Monitor your students&apos; engagement, placements, and overall performance.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link href="/dashboard/college/students">
                    <Card className="p-6 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                        <div className="p-4 bg-blue-100/50 text-blue-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                            <Users size={28} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 mb-2">Student Directory</h3>
                        <p className="text-slate-500 font-medium">View all students from your institution and their activity status.</p>
                    </Card>
                </Link>

                <Card className="p-6 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                    <div className="p-4 bg-emerald-100/50 text-emerald-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                        <GraduationCap size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-2">Placement Stats</h3>
                    <p className="text-slate-500 font-medium">Track gig and internship placements for your enrolled students.</p>
                </Card>

                <Card className="p-6 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
                    <div className="p-4 bg-purple-100/50 text-purple-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                        <BarChart size={28} />
                    </div>
                    <h3 className="font-bold text-xl text-slate-800 mb-2">Detailed Reports</h3>
                    <p className="text-slate-500 font-medium">Generate comprehensive reports on skill gaps and trending fields.</p>
                </Card>
            </div>
        </div>
    );
}
