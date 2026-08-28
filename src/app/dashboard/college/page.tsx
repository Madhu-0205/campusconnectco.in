import { GraduationCap, Users, BarChart } from"lucide-react";
import Link from"next/link";
import { redirect } from"next/navigation";

import { Card } from"@/components/ui/Card";
import { protectPage } from"@/lib/auth-checks";
import prisma from"@/lib/prisma";

export default async function CollegeDashboard() {
 const { authorized, user } = await protectPage(["COLLEGE"]);
 if (!authorized) redirect("/auth/sign-in");

 // @ts-ignore
 const collegeId = user?.collegeId;

 let hiredCount = 0;
 if (collegeId) {
 hiredCount = await prisma.application.count({
 where: {
 status:"HIRED",
 applicant: { collegeId: collegeId }
 }
 });
 }

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

 <Card className="p-6 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 transition-all duration-300 group h-full relative overflow-hidden">
 <div className="p-4 bg-emerald-100/50 text-emerald-600 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform relative z-10">
 <GraduationCap size={28} />
 </div>
 <h3 className="font-bold text-xl text-slate-800 mb-2 relative z-10">Placement Stats</h3>
 <p className="text-slate-500 font-medium relative z-10">Track gig and internship placements for your enrolled students.</p>
 
 <div className="mt-6 pt-6 border-t border-slate-100 relative z-10">
 <div className="flex items-center justify-between">
 <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Hired</span>
 <span className="text-2xl font-black text-emerald-600">{hiredCount}</span>
 </div>
 </div>
 </Card>

 <Card className="p-6 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
 <div className="p-4 bg-primary/50 text-primary rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
 <BarChart size={28} />
 </div>
 <h3 className="font-bold text-xl text-slate-800 mb-2">Detailed Reports</h3>
 <p className="text-slate-500 font-medium">Generate comprehensive reports on skill gaps and trending fields.</p>
 </Card>
 </div>
 </div>
 );
}
