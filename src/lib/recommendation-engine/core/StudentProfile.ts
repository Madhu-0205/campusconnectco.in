import { User, Application, SavedInternship, Gig } from"@prisma/client";

export interface StudentProfileGraph {
 id: string;
 skills: string[];
 interests: string[];
 degree: string | null;
 branch: string | null;
 graduationYear: string | null;
 preferredCities: string[];
 preferredCompanies: string[];
 careerGoals: string[];
 languages: string[];
 certifications: string[];
 previousApplications: string[]; // IDs or Titles of applied roles
 savedOpportunities: string[];
 viewedOpportunities: string[];
 searchHistory: string[];
}

/**
 * Extracts and transforms a Prisma User (with relations) into a robust StudentProfileGraph.
 */
export function buildStudentProfileGraph(
 user: User, 
 applications?: (Application & { gig?: Gig })[],
 savedInternships?: SavedInternship[],
 viewedOpportunities: string[] = [],
 searchHistory: string[] = []
): StudentProfileGraph {
 
 // Extract explicit skills
 const skills = user.skills 
 ? user.skills.split(',').map(s => s.trim().toLowerCase())
 : [];

 // Infer interests from bio or career goals
 const interests: string[] = [];
 if (user.careerGoal) interests.push(user.careerGoal.toLowerCase());
 
 // Extract applied role domains
 const previousApplications = applications 
 ? applications.map(app => app.gigId) 
 : [];
 
 const savedOpps = savedInternships
 ? savedInternships.map(saved => saved.internshipId)
 : [];

 return {
 id: user.id,
 skills,
 interests,
 degree: user.college || null,
 branch: user.branch || null,
 graduationYear: user.year || null,
 preferredCities: [], // To be populated if location tracking is added
 preferredCompanies: [], // To be populated from saved/applied metadata
 careerGoals: user.careerGoal ? [user.careerGoal.toLowerCase()] : [],
 languages: ["english"], // Defaulting
 certifications: [], // Placeholder for expanded schema
 previousApplications,
 savedOpportunities: savedOpps,
 viewedOpportunities,
 searchHistory
 };
}
