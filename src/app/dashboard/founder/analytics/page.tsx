import { Users, Zap, Target, AlertCircle } from"lucide-react";
import { redirect } from"next/navigation";
import React from"react";

import { Card } from"@/components/ui/Card";
import { getFunnelMetrics, getRecommendationIntelligence, getRetentionMetrics } from"@/lib/analytics";
import { protectPage } from"@/lib/auth-checks";


export default async function AnalyticsDashboard() {
 const { authorized } = await protectPage(["FOUNDER"]);
 if (!authorized) redirect("/auth/sign-in");

 // Fetch metrics in parallel
 const [funnel, aiMetrics, retention] = await Promise.all([
 getFunnelMetrics(30),
 getRecommendationIntelligence(30),
 getRetentionMetrics(30)
 ]);

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
 <div>
 <h1 className="text-4xl font-black text-white tracking-tight mb-2">Product Analytics</h1>
 <p className="text-slate-400">Track user funnels, retention, and AI recommendation intelligence over the last 30 days.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
 <Card className="p-6 bg-surface-2 border-slate-800">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-slate-300">Active Users (30d)</h3>
 <Users className="text-cyan-400" size={20} />
 </div>
 <p className="text-3xl font-black text-white">{retention.activeUsers}</p>
 </Card>
 
 <Card className="p-6 bg-surface-2 border-slate-800">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-slate-300">Total Sessions (30d)</h3>
 <ActivityIcon className="text-emerald-400" size={20} />
 </div>
 <p className="text-3xl font-black text-white">{retention.totalSessions}</p>
 </Card>

 <Card className="p-6 bg-surface-2 border-slate-800">
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold text-slate-300">AI Rec Acceptance Rate</h3>
 <Zap className="text-primary" size={20} />
 </div>
 <p className="text-3xl font-black text-white">{aiMetrics.acceptanceRate.toFixed(1)}%</p>
 </Card>
 </div>

 {/* AI Recommendation Intelligence */}
 <section>
 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
 <Zap className="text-primary" /> AI Recommendation Engine Performance
 </h2>
 
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card className="p-6 bg-surface-2 border-slate-800">
 <h3 className="font-bold text-slate-300 mb-6">Top Driving Skills</h3>
 <div className="space-y-4">
 {aiMetrics.topSkills.length > 0 ? aiMetrics.topSkills.map(([skill, count]) => (
 <div key={skill as string} className="flex items-center justify-between">
 <span className="text-white capitalize">{skill as string}</span>
 <span className="text-slate-400 text-sm font-mono">{count as number} clicks</span>
 </div>
 )) : <p className="text-slate-500 text-sm">No data yet.</p>}
 </div>
 </Card>

 <Card className="p-6 bg-surface-2 border-slate-800">
 <h3 className="font-bold text-slate-300 mb-6">Highest Engaging Companies</h3>
 <div className="space-y-4">
 {aiMetrics.topCompanies.length > 0 ? aiMetrics.topCompanies.map(([company, count]) => (
 <div key={company as string} className="flex items-center justify-between">
 <span className="text-white">{company as string}</span>
 <span className="text-slate-400 text-sm font-mono">{count as number} clicks</span>
 </div>
 )) : <p className="text-slate-500 text-sm">No data yet.</p>}
 </div>
 </Card>
 </div>
 </section>

 {/* User Funnel */}
 <section>
 <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
 <Target className="text-rose-400" /> Conversion Funnel
 </h2>
 <Card className="p-8 bg-surface-2 border-slate-800">
 <div className="space-y-8">
 {funnel.map((step, idx) => (
 <div key={step.step as string} className="relative">
 {idx !== funnel.length - 1 && (
 <div className="absolute left-6 top-10 w-0.5 h-16 bg-surface-3"></div>
 )}
 <div className="flex items-center gap-6">
 <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center font-bold text-slate-400 border border-slate-700 z-10">
 {idx + 1}
 </div>
 <div className="flex-1 bg-surface-3/50 p-4 rounded-xl border border-slate-800/50 flex justify-between items-center">
 <div>
 <h3 className="font-bold text-white">{step.step as string}</h3>
 {(step.dropoff as number) > 0 && (
 <p className="text-rose-400 text-sm mt-1 flex items-center gap-1">
 <AlertCircle size={14} /> {(step.dropoff as number).toFixed(1)}% drop-off
 </p>
 )}
 </div>
 <div className="text-2xl font-black text-slate-300 font-mono">
 {step.count as number}
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 </Card>
 </section>
 </div>
 );
}

// Inline Activity Icon
function ActivityIcon(props: any) {
 return (
 <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
 </svg>
 );
}
