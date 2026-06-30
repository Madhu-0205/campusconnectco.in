'use client';

import { TrendingUp, Zap, Hash, ArrowUpRight, Flame } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

interface TrendingGig {
  id: string;
  title: string;
  budget: number;
  applicationCount: number;
  velocity: number;
}

interface TrendingSkill {
  name: string;
  color: string;
  icon: string;
  gigCount: number;
  velocity: number;
}

interface TrendingTopic {
  tag: string;
  count: number;
  change: number;
}

export function TrendingSidebar() {
  const [gigs, setGigs] = useState<TrendingGig[]>([]);
  const [skills, setSkills] = useState<TrendingSkill[]>([]);
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/ai/trending')
      .then(r => r.json())
      .then(d => {
        setGigs(d.gigs || []);
        setSkills(d.skills || []);
        setTopics(d.topics || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-(--surface-2) border border-white/10 rounded-2xl p-4 animate-pulse h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Trending Gigs */}
      {gigs.length > 0 && (
        <div className="bg-[#0e0e12] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-orange-400" />
            <p className="font-black uppercase tracking-widest text-slate-400">Hot Gigs</p>
          </div>
          <div className="space-y-2">
            {gigs.map((gig, i) => (
              <Link key={gig.id} href={`/dashboard/student/gigs`}>
                <div className="flex items-center gap-3 py-2 hover:bg-(--surface-2) rounded-lg px-2 -mx-2 transition-colors cursor-pointer group">
                  <span className="font-black text-slate-600 w-4 shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-300 line-clamp-1 group-hover:text-white transition-colors">{gig.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-400 font-bold">₹{gig.budget.toLocaleString()}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{gig.applicationCount} applied</span>
                      {gig.velocity > 0 && (
                        <span className="text-orange-400 flex items-center gap-0.5">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {gig.velocity.toFixed(1)}/hr
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Trending Skills */}
      {skills.length > 0 && (
        <div className="bg-[#0e0e12] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
            <p className="font-black uppercase tracking-widest text-slate-400">Rising Skills</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all hover:scale-105 cursor-default"
                style={{
                  borderColor: skill.color + '40',
                  color: skill.color,
                  backgroundColor: skill.color + '15',
                }}
              >
                <span>{skill.icon}</span>
                <span>{skill.name}</span>
                {skill.velocity > 0 && (
                  <span className="text-emerald-400">+{skill.velocity}%</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Topics */}
      {topics.length > 0 && (
        <div className="bg-[#0e0e12] border border-white/10 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="w-4 h-4 text-blue-400" />
            <p className="font-black uppercase tracking-widest text-slate-400">Trending Topics</p>
          </div>
          <div className="space-y-1.5">
            {topics.map((topic) => (
              <div key={topic.tag} className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-300">#{topic.tag}</p>
                  <p className="text-slate-600">{topic.count} gigs</p>
                </div>
                <span className={`font-black px-1.5 py-0.5 rounded-md ${ topic.change > 0 ? 'bg-emerald-500/15' : 'bg-red-500/15 text-red-400' }`}>
                  {topic.change > 0 ? '+' : ''}{topic.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Badge */}
      <div className="bg-linear-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-(--accent)/20 flex items-center justify-center">
            <TrendingUp className="w-3 h-3 text-amber-400" />
          </div>
          <p className="font-black text-amber-400">AI Feed Active</p>
        </div>
        <p className="text-slate-500 leading-relaxed">
          Your feed is ranked by skills, social connections, and real-time platform activity.
        </p>
      </div>
    </div>
  );
}
