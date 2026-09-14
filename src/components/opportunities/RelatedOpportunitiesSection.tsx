import Link from "next/link";
import { ArrowRight, Briefcase, Sparkles, MapPin, Building2, Banknote } from "lucide-react";
import { OpportunityNode } from "@/lib/recommendation-engine";

interface RelatedOpportunitiesSectionProps {
  opportunities: OpportunityNode[];
  currentTitle?: string;
}

export function RelatedOpportunitiesSection({
  opportunities,
  currentTitle
}: RelatedOpportunitiesSectionProps) {
  if (!opportunities || opportunities.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 pt-8 border-t border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-1.5">
            <Sparkles className="h-3 w-3" />
            <span>Smart Recommendations</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Similar Opportunities
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Handpicked based on shared skills and format{currentTitle ? ` for students interested in ${currentTitle}` : ""}
          </p>
        </div>

        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors self-start sm:self-auto"
        >
          <span>Explore all opportunities</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp) => {
          const isGig = opp.type === "gig";
          const href = isGig ? `/gigs/${opp.id}` : `/internships/${opp.id}`;
          
          let locationDisplay = "Remote";
          if (opp.isRemote) {
            locationDisplay = "Remote";
          } else if (opp.isHybrid) {
            locationDisplay = opp.city ? `Hybrid · ${opp.city}` : "Hybrid";
          } else if (opp.city) {
            locationDisplay = opp.city;
          } else if (opp.location) {
            locationDisplay = opp.location;
          }

          return (
            <Link
              key={opp.id}
              href={href}
              className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-surface/80 hover:bg-surface border border-border hover:border-primary/40 transition-all duration-200 shadow-xs hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                      isGig
                        ? "bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20"
                        : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                    }`}
                  >
                    <Briefcase className="h-2.5 w-2.5" />
                    {isGig ? "Campus Gig" : "Internship"}
                  </span>

                  {opp.salary != null && opp.salary > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-foreground">
                      <Banknote className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>₹{opp.salary.toLocaleString("en-IN")}{!isGig ? "/mo" : ""}</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {opp.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 truncate max-w-44">
                    <Building2 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{opp.company}</span>
                  </span>

                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span>{locationDisplay}</span>
                  </span>
                </div>

                {opp.tags && opp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {opp.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-surface-2 border border-border-subtle text-[11px] text-muted-foreground font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs font-medium text-primary">
                <span>View Details</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
