"use client";

import { Bookmark, Loader2, Briefcase, GraduationCap } from"lucide-react";
import { useState, useEffect } from"react";
import { toast } from"sonner";

import EmptyState from"@/components/ui/EmptyState";
import { GigCard } from"@/components/v2/GigCard";
import { InternshipCard } from"@/components/v2/InternshipCard";
import { ContextualMapLayout } from"@/components/v2/maps/ContextualMapLayout";
import { useMapContext, MarkerData } from"@/components/v2/maps/MapContext";
import { MapDataSync } from"@/components/v2/maps/MapDataSync";

function SavedOpportunitiesContent() {
 const [loading, setLoading] = useState(true);
 const [savedGigs, setSavedGigs] = useState<any[]>([]);
 const [savedInternships, setSavedInternships] = useState<any[]>([]);
 const [activeTab, setActiveTab] = useState<"all" |"gigs" |"internships">("all");
 const { setHoveredId } = useMapContext();

 useEffect(() => {
 const fetchSaved = async () => {
 try {
 const res = await fetch("/api/user/saved");
 if (!res.ok) throw new Error("Failed to fetch saved opportunities");
 const data = await res.json();
 if (data.success) {
 setSavedGigs(data.gigs || []);
 setSavedInternships(data.internships || []);
 }
 } catch (error) {
 toast.error("Failed to load saved items");
 } finally {
 setLoading(false);
 }
 };
 fetchSaved();
 }, []);

 const handleUnsave = (id: string, type:"gig" |"internship") => {
 if (type ==="gig") {
 setSavedGigs(prev => prev.filter(g => g.id !== id));
 } else {
 setSavedInternships(prev => prev.filter(i => i.id !== id));
 }
 };

 const displayGigs = activeTab ==="all" || activeTab ==="gigs";
 const displayInternships = activeTab ==="all" || activeTab ==="internships";

 const markers: MarkerData[] = [];
 if (displayGigs) {
 savedGigs.filter(g => g.latitude && g.longitude).forEach(g => {
 markers.push({
 id: g.id,
 type:"gig",
 lat: g.latitude,
 lng: g.longitude,
 title: g.title,
 subtitle: g.company ||"CampusConnect"
 });
 });
 }
 if (displayInternships) {
 savedInternships.filter(i => i.latitude && i.longitude).forEach(i => {
 markers.push({
 id: i.id,
 type:"internship",
 lat: i.latitude,
 lng: i.longitude,
 title: i.title,
 subtitle: i.companyName ||"Unknown Company"
 });
 });
 }

 return (
 <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
 <MapDataSync markers={markers} />
 <div className="flex flex-col gap-2">
 <div className="flex items-center gap-2">
 <span className="w-8 h-1 bg-primary rounded-full" />
 <span className="font-bold text-primary uppercase tracking-widest">Bookmarks</span>
 </div>
 <h1 className="font-black text-3xl md:text-5xl text-slate-900 tracking-tight">
 Saved Opportunities
 </h1>
 <p className="text-slate-500 font-medium text-lg">
 Keep track of gigs and internships you want to apply for later.
 </p>
 </div>

 {/* Navigation Tabs */}
 <div className="flex flex-wrap gap-2 pt-4">
 <button 
 onClick={() => setActiveTab("all")}
 className={`px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm ${activeTab ==="all" ?"bg-surface-2 text-white shadow-lg shadow-slate-900/20" :"bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
 >
 <Bookmark size={16} /> All Saved
 </button>
 <button 
 onClick={() => setActiveTab("gigs")}
 className={`px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm ${activeTab ==="gigs" ?"bg-blue-600 text-white shadow-lg shadow-blue-600/20" :"bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
 >
 <Briefcase size={16} /> Campus Gigs
 </button>
 <button 
 onClick={() => setActiveTab("internships")}
 className={`px-5 py-2.5 rounded-full font-bold transition-all flex items-center gap-2 text-sm ${activeTab ==="internships" ?"bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" :"bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"}`}
 >
 <GraduationCap size={16} /> Internships
 </button>
 </div>

 {loading ? (
 <div className="flex justify-center p-12">
 <Loader2 className="w-8 h-8 animate-spin text-primary" />
 </div>
 ) : (
 <div className="space-y-8">
 {/* Gigs Section */}
 {displayGigs && (
 <div className="space-y-4">
 {activeTab ==="all" && savedGigs.length > 0 && <h2 className="text-2xl font-black text-slate-900">Saved Gigs</h2>}
 
 {savedGigs.length === 0 ? (
 activeTab ==="gigs" && (
 <EmptyState 
 title="No Saved Gigs" 
 description="You haven't bookmarked any gigs yet. Browse the catalog to find opportunities."
 icon={<Briefcase size={32} />}
 />
 )
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {savedGigs.map(gig => (
 <div 
 key={gig.id} 
 className="relative group"
 onMouseEnter={() => setHoveredId(gig.id)}
 onMouseLeave={() => setHoveredId(null)}
 >
 <button 
 onClick={() => handleUnsave(gig.id,"gig")}
 className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-blue-600 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
 title="Unsave Gig"
 >
 <Bookmark size={20} className="fill-current" />
 </button>
 <GigCard 
 title={gig.title}
 company="CampusConnect"
 location={gig.location ||"Remote"}
 compensation={`₹${gig.budget}`}
 duration={gig.duration ||"Project based"}
 tags={gig.tags ? JSON.parse(gig.tags) : []}
 href={`/dashboard/student/gigs/${gig.id}`}
 />
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Internships Section */}
 {displayInternships && (
 <div className="space-y-4">
 {activeTab ==="all" && savedInternships.length > 0 && <h2 className="text-2xl font-black text-slate-900 pt-4 border-t border-slate-100">Saved Internships</h2>}
 
 {savedInternships.length === 0 ? (
 activeTab ==="internships" && (
 <EmptyState 
 title="No Saved Internships" 
 description="You haven't bookmarked any internships yet. Browse the catalog to find opportunities."
 icon={<GraduationCap size={32} />}
 />
 )
 ) : (
 <div className="grid grid-cols-1 gap-4">
 {savedInternships.map(internship => (
 <div 
 key={internship.id} 
 className="relative group"
 onMouseEnter={() => setHoveredId(internship.id)}
 onMouseLeave={() => setHoveredId(null)}
 >
 <button 
 onClick={() => handleUnsave(internship.id,"internship")}
 className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur rounded-full text-emerald-600 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
 title="Unsave Internship"
 >
 <Bookmark size={20} className="fill-current" />
 </button>
 <InternshipCard 
 role={internship.title}
 company={internship.companyName ||"Unknown Company"}
 location={internship.location ||"Remote"}
 stipend={internship.stipend ||"Unpaid"}
 type={internship.type ||"Internship"}
 tags={internship.tags ? JSON.parse(internship.tags) : []}
 href={`/dashboard/student/internships/${internship.id}`}
 />
 </div>
 ))}
 </div>
 )}
 </div>
 )}

 {/* Global Empty State */}
 {activeTab ==="all" && savedGigs.length === 0 && savedInternships.length === 0 && (
 <EmptyState 
 title="No Bookmarks Yet" 
 description="When you see a gig or internship you like, click the bookmark icon to save it here for later."
 icon={<Bookmark size={32} />}
 />
 )}
 </div>
 )}
 </div>
 );
}

export default function SavedOpportunitiesPage() {
 return (
 <ContextualMapLayout>
 <SavedOpportunitiesContent />
 </ContextualMapLayout>
 );
}
