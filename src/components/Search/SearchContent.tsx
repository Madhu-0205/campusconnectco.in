"use client";

import { Search, Loader2, Briefcase, User, Code, ArrowRight, DollarSign, Clock } from"lucide-react";
import Link from"next/link";
import { useSearchParams, useRouter } from"next/navigation";
import { useState, useEffect } from"react";

import { Button } from"@/components/ui/Button";
import { Card } from"@/components/ui/Card";

interface SearchResults {
 query: string;
 results: {
 gigs?: Array<{
 id: string;
 title: string;
 description: string;
 budget: number;
 deadline: string | null;
 tags: string | null;
 createdAt: string;
 poster: {
 id: string;
 name: string | null;
 image: string | null;
 };
 _count: {
 applications: number;
 };
 }>;
 users?: Array<{
 id: string;
 name: string | null;
 email: string;
 image: string | null;
 role: string;
 bio: string | null;
 skills: string | null;
 _count: {
 gigsPosted: number;
 applications: number;
 };
 }>;
 skills?: string[];
 };
 totalResults: {
 gigs: number;
 users: number;
 skills: number;
 };
}

export default function SearchContent() {
 const searchParams = useSearchParams();
 const router = useRouter();
 const queryParam = searchParams.get("q") ||"";

 const [searchQuery, setSearchQuery] = useState(queryParam);
 const [activeTab, setActiveTab] = useState<"all" |"gigs" |"users" |"skills">("all");
 const [results, setResults] = useState<SearchResults | null>(null);
 const [isLoading, setIsLoading] = useState(false);
 const [error, setError] = useState("");

 useEffect(() => {
 if (queryParam) {
 performSearch(queryParam);
 }
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [queryParam]);

 const performSearch = async (query: string) => {
 if (!query || query.trim().length < 2) {
 setError("Please enter at least 2 characters");
 return;
 }

 setIsLoading(true);
 setError("");

 try {
 const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${activeTab}`);

 if (!response.ok) {
 throw new Error("Search failed");
 }

 const data = await response.json();
 setResults(data);
 } catch (err) {
 setError("Failed to perform search. Please try again.");
 console.error(err);
 } finally {
 setIsLoading(false);
 }
 };

 const handleSearch = (e: React.FormEvent) => {
 e.preventDefault();
 if (searchQuery.trim()) {
 router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
 }
 };

 const totalCount = results?.totalResults
 ? results.totalResults.gigs + results.totalResults.users + results.totalResults.skills
 : 0;

 return (
 <div className="min-h-screen bg-background pt-24 pb-12">
 <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
 {/* Search Header */}
 <div className="mb-8">
 <h1 className="md:text-4xl font-black text-foreground mb-4">
 Search Results
 </h1>

 {/* Search Bar */}
 <form onSubmit={handleSearch} className="relative max-w-2xl">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
 <input
 type="text"
 placeholder="Search gigs, users, skills..."
 className="w-full bg-surface border border-border rounded-2xl pl-12 pr-4 py-4 text-foreground focus:ring-2 focus:ring-ring outline-none shadow-sm"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </form>

 {/* Results Count */}
 {results && !isLoading && (
 <p className="mt-4 text-muted-foreground">
 Found <strong className="text-foreground">{totalCount}</strong> results for &quot;{results.query}&quot;
 </p>
 )}
 </div>

 {/* Tabs */}
 <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
 {[
 { key:"all", label:"All", count: totalCount },
 { key:"gigs", label:"Gigs", count: results?.totalResults.gigs || 0 },
 { key:"users", label:"Users", count: results?.totalResults.users || 0 },
 { key:"skills", label:"Skills", count: results?.totalResults.skills || 0 },
 ].map((tab) => (
 <button
 key={tab.key}
 onClick={() => setActiveTab(tab.key as typeof activeTab)}
 className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${activeTab === tab.key ?"bg-foreground text-background shadow-lg" :"bg-surface text-muted-foreground hover:bg-accent" }`}
 >
 {tab.label} {tab.count > 0 && `(${tab.count})`}
 </button>
 ))}
 </div>

 {/* Error */}
 {error && (
 <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6">
 <p className="text-destructive">{error}</p>
 </div>
 )}

 {/* Loading */}
 {isLoading && (
 <div className="flex justify-center items-center py-20">
 <Loader2 className="animate-spin text-foreground" size={40} />
 </div>
 )}

 {/* Results */}
 {!isLoading && results && (
 <div className="space-y-8">
 {/* Gigs Results */}
 {(activeTab ==="all" || activeTab ==="gigs") && results.results.gigs && results.results.gigs.length > 0 && (
 <div>
 <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
 <Briefcase size={24} className="text-foreground" />
 Gigs ({results.results.gigs.length})
 </h2>
 <div className="grid gap-4">
 {results.results.gigs.map((gig) => (
 <Card key={gig.id} className="p-6 hover:shadow-lg transition-shadow">
 <div className="flex justify-between items-start gap-4">
 <div className="flex-1">
 <Link href={`/gigs/${gig.id}`} className="group">
 <h3 className="font-bold text-foreground group-hover:text-foreground transition-colors mb-2">
 {gig.title}
 </h3>
 </Link>
 <p className="text-muted-foreground mb-3 line-clamp-2">
 {gig.description}
 </p>
 <div className="flex flex-wrap gap-3 text-muted-foreground">
 <span className="flex items-center gap-1">
 <DollarSign size={16} />
 ₹{gig.budget.toLocaleString()}
 </span>
 {gig.deadline && (
 <span className="flex items-center gap-1">
 <Clock size={16} />
 {new Date(gig.deadline).toLocaleDateString()}
 </span>
 )}
 <span>{gig._count.applications} applications</span>
 </div>
 {gig.tags && (
 <div className="flex flex-wrap gap-2 mt-3">
 {gig.tags.split(",").slice(0, 3).map((tag, idx) => (
 <span
 key={idx}
 className="px-2 py-1 bg-accent text-foreground text-xs font-semibold rounded-lg"
 >
 {tag.trim()}
 </span>
 ))}
 </div>
 )}
 </div>
 <Link href={`/gigs/${gig.id}`}>
 <Button size="sm" className="whitespace-nowrap">
 View Details <ArrowRight size={16} className="ml-1" />
 </Button>
 </Link>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Users Results */}
 {(activeTab ==="all" || activeTab ==="users") && results.results.users && results.results.users.length > 0 && (
 <div>
 <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
 <User size={24} className="text-foreground" />
 Users ({results.results.users.length})
 </h2>
 <div className="grid gap-4 sm:grid-cols-2">
 {results.results.users.map((user) => (
 <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
 <div className="flex items-start gap-4">
 <div className="h-12 w-12 rounded-full bg-foreground text-background font-bold flex items-center justify-center shrink-0">
 {user.name?.slice(0, 2).toUpperCase() || (user.email && user.email.slice(0, 2).toUpperCase()) ||"U"}
 </div>
 <div className="flex-1 min-w-0">
 <Link href={`/profile/${user.id}`}>
 <h3 className="font-bold text-foreground hover:text-foreground transition-colors truncate">
 {user.name || user.email ||"Unknown User"}
 </h3>
 </Link>
 <p className="text-muted-foreground capitalize mb-2">
 {user.role ? user.role.toLowerCase() :"student"}
 </p>
 {user.bio && (
 <p className="text-muted-foreground line-clamp-2 mb-2">
 {user.bio}
 </p>
 )}
 {user.skills && (
 <div className="flex flex-wrap gap-1 mt-2">
 {user.skills.split(",").slice(0, 3).map((skill, idx) => (
 <span
 key={idx}
 className="px-2 py-0.5 bg-accent text-xs rounded"
 >
 {skill.trim()}
 </span>
 ))}
 </div>
 )}

 </div>
 </div>
 </Card>
 ))}
 </div>
 </div>
 )}

 {/* Skills Results */}
 {(activeTab ==="all" || activeTab ==="skills") && results.results.skills && results.results.skills.length > 0 && (
 <div>
 <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
 <Code size={24} className="text-foreground" />
 Skills ({results.results.skills.length})
 </h2>
 <div className="flex flex-wrap gap-3">
 {results.results.skills.map((skill, idx) => (
 <button
 key={idx}
 onClick={() => {
 setSearchQuery(skill);
 router.push(`/search?q=${encodeURIComponent(skill)}`);
 }}
 className="px-4 py-2 bg-surface border border-border rounded-xl font-semibold text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
 >
 {skill}
 </button>
 ))}
 </div>
 </div>
 )}

 {/* No Results */}
 {totalCount === 0 && (
 <div className="text-center py-20">
 <Search size={64} className="mx-auto text-muted-foreground/50 mb-4" />
 <h3 className="font-bold text-foreground mb-2">
 No results found
 </h3>
 <p className="text-muted-foreground">
 Try adjusting your search terms or browse all gigs
 </p>
 <Link href="/get-gig" className="inline-block mt-6">
 <Button>Browse All Gigs</Button>
 </Link>
 </div>
 )}
 </div>
 )}

 {/* Empty State */}
 {!results && !isLoading && !error && (
 <div className="text-center py-20">
 <Search size={64} className="mx-auto text-muted-foreground/50 mb-4" />
 <h3 className="font-bold text-foreground mb-2">
 Start Searching
 </h3>
 <p className="text-muted-foreground">
 Enter a search term to find gigs, users, or skills
 </p>
 </div>
 )}
 </div>
 </div>
 );
}
