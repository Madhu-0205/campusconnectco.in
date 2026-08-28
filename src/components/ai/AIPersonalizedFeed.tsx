'use client';

import { Heart, Sparkles, Briefcase, Clock, MessageCircle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';

import { FeedPost, FeedGig } from '@/lib/ai/feedAssembler';

interface FeedResponse {
 posts: FeedPost[];
 gigs: FeedGig[];
}

export function AIPersonalizedFeed() {
 const [feed, setFeed] = useState<FeedResponse | null>(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 fetch('/api/ai/feed')
 .then(res => res.json())
 .then(data => setFeed(data))
 .catch(console.error)
 .finally(() => setLoading(false));
 }, []);

 if (loading) {
 return (
 <div className="space-y-4">
 {[...Array(3)].map((_, i) => (
 <div key={i} className="bg-card border border-white/5 rounded-3xl p-5 animate-pulse h-40" />
 ))}
 </div>
 );
 }

 if (!feed || (feed.posts.length === 0 && feed.gigs.length === 0)) {
 return (
 <div className="bg-card border border-border rounded-3xl p-10 flex flex-col items-center justify-center text-center">
 <Sparkles className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
 <p className="text-foreground font-bold mb-1">Your AI Feed is empty</p>
 <p className="text-muted-foreground">Connect with users or update your skills to train the algorithm.</p>
 </div>
 );
 }

 // Interleave posts and gigs based on feed score
 const items: ({ type: 'post', data: FeedPost } | { type: 'gig', data: FeedGig })[] = [
 ...feed.posts.map(p => ({ type: 'post' as const, data: p })),
 ...feed.gigs.map(g => ({ type: 'gig' as const, data: g }))
 ].sort((a, b) => b.data.feedScore - a.data.feedScore);

 return (
 <div className="space-y-4">
 {items.map((item) => {
 if (item.type === 'post') {
 const post = item.data as FeedPost;
 return (
 <div key={`post-${post.id}`} className="bg-card border border-white/5 hover:border-border transition-colors rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden group">
 {/* Highlight for high AI score */}
 {post.feedScore > 0.8 && (
 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] rounded-full pointer-events-none" />
 )}
 
 <div className="flex items-start justify-between mb-4 relative z-10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center font-bold text-muted-foreground relative overflow-hidden">
 {post.author.image ? <Image src={post.author.image} alt="" fill className="object-cover" /> : post.author.name?.[0] || 'U'}
 </div>
 <div>
 <p className="font-bold text-foreground group-hover:text-success transition-colors">{post.author.name || 'Anonymous User'}</p>
 <p className="text-muted-foreground font-bold tracking-widest uppercase">{post.author.role}</p>
 </div>
 </div>
 <div className="flex items-center gap-2 text-muted-foreground font-bold bg-(--surface-2) px-2 py-1 rounded-md">
 <Clock className="w-3 h-3" />
 {new Date(post.createdAt).toLocaleDateString()}
 </div>
 </div>

 <div className="text-muted-foreground leading-relaxed mb-5 relative z-10">
 {post.content}
 </div>

 <div className="flex items-center justify-between pt-4 border-white/5 relative z-10">
 <div className="flex items-center gap-4">
 <button className="flex items-center gap-1.5 text-muted-foreground hover:text-success font-bold transition-colors">
 <Heart className="w-4 h-4" /> {post._count.likes}
 </button>
 <button className="flex items-center gap-1.5 text-muted-foreground hover:text-success font-bold transition-colors">
 <MessageCircle className="w-4 h-4" /> Reply
 </button>
 </div>
 <div className="flex items-center gap-1 font-black text-success/50">
 <Sparkles className="w-3 h-3" /> MATCH: {Math.round(post.feedScore * 100)}%
 </div>
 </div>
 </div>
 );
 }

 if (item.type === 'gig') {
 const gig = item.data as FeedGig;
 return (
 <Link key={`gig-${gig.id}`} href={`/dashboard/student/gigs`}>
 <div className="bg-linear-to-br from-[#111116] to-[#1a1a24] border border-(--primary)/20 hover:border-(--primary)/40 hover:shadow-[0_0_30px_-5px_rgba(249,115,22,0.15)] transition-all rounded-3xl p-5 md:p-6 relative overflow-hidden group cursor-pointer block">
 <div className="absolute top-0 right-0 w-32 h-32 bg-foreground text-background/10 blur-[50px] rounded-full pointer-events-none" />
 
 <div className="flex items-start justify-between mb-4 relative z-10">
 <div className="flex items-center gap-3">
 <div className="w-10 h-10 rounded-xl bg-foreground text-background/10 flex items-center justify-center font-bold text-orange-400">
 <Briefcase className="w-5 h-5" />
 </div>
 <div>
 <span className="font-black tracking-widest uppercase text-orange-400 flex items-center gap-1 mb-0.5">
 <Sparkles className="w-3 h-3" /> Recommended Gig
 </span>
 <h4 className="font-bold text-foreground group-hover:text-orange-400 transition-colors line-clamp-1">{gig.title}</h4>
 </div>
 </div>
 </div>

 <p className="text-muted-foreground mb-4 line-clamp-2 relative z-10">{gig.description}</p>

 <div className="flex flex-wrap gap-2 mb-5 relative z-10">
 {gig.tags && gig.tags.split(',').slice(0,3).map(tag => (
 <span key={tag} className="px-2 py-1 bg-(--surface-2) rounded-md text-[10px] font-bold">
 {tag.trim()}
 </span>
 ))}
 </div>

 <div className="flex items-center justify-between pt-4 border-white/5 relative z-10">
 <div className="flex items-center gap-4">
 <div className="font-black text-success flex items-center gap-1">
 ₹{gig.budget.toLocaleString()}
 </div>
 <div className="text-muted-foreground font-medium">
 {gig._count.applications} refs
 </div>
 </div>
 <ArrowRight className="w-4 h-4 text-orange-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
 </div>
 </div>
 </Link>
 );
 }

 return null;
 })}
 </div>
 );
}
