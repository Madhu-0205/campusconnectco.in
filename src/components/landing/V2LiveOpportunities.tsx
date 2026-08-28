"use client"

import { ArrowRight } from"lucide-react"
import Link from"next/link"
import React from"react"

import { HoverMagnetic } from"@/components/ui/motion/HoverMagnetic"
import { Reveal } from"@/components/ui/motion/Reveal"
import { GigCard } from"@/components/v2/GigCard"
import { InternshipCard } from"@/components/v2/InternshipCard"

export function V2LiveOpportunities({
 opportunitiesCount,
 latestGigs = [],
 latestInternships = []
}: {
 opportunitiesCount: number;
 latestGigs?: any[];
 latestInternships?: any[];
}) {
 const formatNumber = (num: number) => new Intl.NumberFormat('en-US').format(num);

 return (
 <section className="py-24 relative bg-bg-subtle border-y border-border-subtle">
 <div className="container mx-auto px-6 max-w-6xl">
 
 <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
 <Reveal>
 <div className="max-w-xl">
 <h2 className="text-3xl md:text-5xl font-heading font-bold tracking-tight mb-4">
 Real opportunities.<br/>
 <span className="text-text-3">No fake postings.</span>
 </h2>
 <p className="text-text-2 text-lg">
 Every gig and internship is vetted. Direct connections to founders.
 </p>
 </div>
 </Reveal>
 <Reveal delay={0.1}>
 <Link href="/freelance-jobs" className="group flex items-center gap-2 text-primary font-medium hover:text-white transition-colors">
 <span>View all opportunities</span>
 <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
 </Link>
 </Reveal>
 </div>

 <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
 
 {latestGigs[0] && (
 <Reveal delay={0.1}>
 <GigCard
 title={latestGigs[0].title}
 company={latestGigs[0].poster?.startup?.name || latestGigs[0].poster?.company_name ||"Startup"}
 location="Remote"
 compensation={`₹${latestGigs[0].budget || 0} total`}
 duration={latestGigs[0].work_mode ||"Flexible"}
 tags={latestGigs[0].tags ? latestGigs[0].tags.split(',').slice(0,3) : []}
 href={`/freelance-jobs/${latestGigs[0].id}`}
 isFeatured
 />
 </Reveal>
 )}

 {latestInternships[0] && (
 <Reveal delay={0.2}>
 <InternshipCard
 role={latestInternships[0].title}
 company={latestInternships[0].company ||"Startup"}
 location={latestInternships[0].location ||"Remote"}
 type={latestInternships[0].type ||"Remote"}
 stipend={latestInternships[0].stipend ? `₹${latestInternships[0].stipend}/mo` :"Unpaid"}
 tags={latestInternships[0].skills ? latestInternships[0].skills.split(',').slice(0,3) : []}
 href={`/internships/${latestInternships[0].id}`}
 isUrgent
 />
 </Reveal>
 )}

 {latestGigs[1] && (
 <Reveal delay={0.3}>
 <GigCard
 title={latestGigs[1].title}
 company={latestGigs[1].poster?.startup?.name || latestGigs[1].poster?.company_name ||"Startup"}
 location="Remote"
 compensation={`₹${latestGigs[1].budget || 0} total`}
 duration={latestGigs[1].work_mode ||"Flexible"}
 tags={latestGigs[1].tags ? latestGigs[1].tags.split(',').slice(0,3) : []}
 href={`/freelance-jobs/${latestGigs[1].id}`}
 />
 </Reveal>
 )}

 {latestInternships[1] && (
 <Reveal delay={0.4}>
 <InternshipCard
 role={latestInternships[1].title}
 company={latestInternships[1].company ||"Startup"}
 location={latestInternships[1].location ||"Remote"}
 type={latestInternships[1].type ||"Remote"}
 stipend={latestInternships[1].stipend ? `₹${latestInternships[1].stipend}/mo` :"Unpaid"}
 tags={latestInternships[1].skills ? latestInternships[1].skills.split(',').slice(0,3) : []}
 href={`/internships/${latestInternships[1].id}`}
 />
 </Reveal>
 )}

 <Reveal delay={0.5} className="md:col-span-2 lg:col-span-2">
 <div className="h-full w-full rounded-2xl border border-border bg-surface p-8 flex flex-col items-center justify-center text-center gap-4 group hover:shadow-card-hover transition-all cursor-pointer shadow-card">
 <h3 className="text-xl font-bold">And {formatNumber(opportunitiesCount > 4 ? opportunitiesCount - 4 : 0)}+ more live today.</h3>
 <p className="text-text-2">Join to see the full board and apply instantly.</p>
 <HoverMagnetic>
 <Link href="/join" className="inline-flex items-center justify-center h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">
 Create your profile
 </Link>
 </HoverMagnetic>
 </div>
 </Reveal>

 </div>
 </div>
 </section>
 )
}
