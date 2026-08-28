import { ArrowRight, Box } from"lucide-react";
import Link from"next/link";
import React from"react";

import { TopicCluster } from"@/lib/content-engine/types";

interface ClusterNavigatorProps {
 cluster: TopicCluster;
}

export function ClusterNavigator({ cluster }: ClusterNavigatorProps) {
 return (
 <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/10 rounded-3xl p-6 mt-12">
 <div className="flex items-start gap-4">
 <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
 <Box className="w-5 h-5" />
 </div>
 <div className="flex-1 space-y-3">
 <h4 className="text-white font-bold text-lg">
 Explore more in {cluster.name}
 </h4>
 <p className="text-sm text-slate-400">
 {cluster.description}
 </p>
 
 <div className="flex flex-wrap gap-2 pt-2">
 {cluster.associatedRoles.map(role => (
 <Link 
 key={role}
 href={`/careers/${role}`}
 className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300 hover:text-white hover:border-primary/30 transition-all"
 >
 {role.replace(/-/g,"")} Careers
 </Link>
 ))}
 {cluster.associatedSkills.map(skill => (
 <Link 
 key={skill}
 href={`/skills/${skill}`}
 className="px-3 py-1.5 rounded-lg bg-black/40 border border-white/5 text-xs text-slate-300 hover:text-white hover:border-cyan-500/30 transition-all"
 >
 {skill.replace(/-/g,"")} Internships
 </Link>
 ))}
 </div>

 <div className="pt-4 border-t border-white/5">
 <Link 
 href={`/topics/${cluster.slug}`}
 className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-cyan-400 transition-colors"
 >
 View the complete {cluster.name} Hub <ArrowRight size={14} />
 </Link>
 </div>
 </div>
 </div>
 </div>
 );
}
