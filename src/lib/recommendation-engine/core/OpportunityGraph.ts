import { Gig, Internship } from"@prisma/client";

export interface OpportunityNode {
 id: string;
 type:"gig" |"internship";
 title: string;
 company: string;
 requiredSkills: string[];
 difficulty:"beginner" |"intermediate" |"advanced";
 location: string | null;
 domain: string;
 salary: number | null;
 experienceLevel: string;
 tags: string[];
 isRemote: boolean;
 isHybrid: boolean;
 category: string;
 createdAt: Date;
 popularityScore: number;
}

/**
 * Transforms a Prisma Gig into a normalized OpportunityNode.
 */
export function buildOpportunityNodeFromGig(gig: Gig): OpportunityNode {
 const rawSkills = gig.required_skills ? (gig.required_skills as any) : [];
 const requiredSkills = Array.isArray(rawSkills) 
 ? rawSkills.map(s => String(s).toLowerCase()) 
 : [];

 const tags = gig.tags ? gig.tags.split(',').map(t => t.trim().toLowerCase()) : [];
 
 const isRemote = gig.work_mode?.toLowerCase() ==="remote";
 const isHybrid = gig.work_mode?.toLowerCase() ==="hybrid";

 return {
 id: gig.id,
 type:"gig",
 title: gig.title,
 company:"CampusConnect Client", // Default for gigs without org linking
 requiredSkills,
 difficulty:"intermediate", // Default mapping, could be derived from budget/tags
 location: null, // Gigs are typically remote or location-agnostic unless specified
 domain: tags[0] ||"General",
 salary: gig.budget,
 experienceLevel:"student",
 tags,
 isRemote,
 isHybrid,
 category:"freelance",
 createdAt: gig.createdAt,
 popularityScore: gig.views || 0,
 };
}

/**
 * Transforms a Prisma Internship into a normalized OpportunityNode.
 */
export function buildOpportunityNodeFromInternship(internship: Internship): OpportunityNode {
 const requiredSkills = internship.skills 
 ? internship.skills.split(',').map(s => s.trim().toLowerCase()) 
 : [];
 
 const tags = internship.tags ? internship.tags.split(',').map(t => t.trim().toLowerCase()) : [];

 const location = internship.location?.toLowerCase() || null;
 const isRemote = location?.includes('remote') || false;
 const isHybrid = location?.includes('hybrid') || false;

 return {
 id: internship.id,
 type:"internship",
 title: internship.title,
 company: internship.company,
 requiredSkills,
 difficulty:"beginner", // Internships default to beginner
 location: internship.location || null,
 domain: tags[0] ||"General",
 salary: internship.stipend || null,
 experienceLevel:"entry-level",
 tags,
 isRemote,
 isHybrid,
 category:"internship",
 createdAt: internship.createdAt,
 popularityScore: (internship.views || 0) + (internship.applyCount * 5),
 };
}
