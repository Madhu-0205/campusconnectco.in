"use client";

import {
 motion,
 AnimatePresence,
 useMotionValue,
 useSpring,
 useTransform,
} from"framer-motion";
import {
 MapPin,
 X,
 Camera,
 Github,
 Linkedin,
 Instagram,
 Sparkles,
 Zap,
 Users,
 Plus,
 Trash2,
 ExternalLink,
 Globe,
 Award,
 Code,
 TrendingUp,
 FileText,
 CheckCircle2,
 LucideIcon
} from"lucide-react";
import Image from"next/image";
import { useState, useEffect, useRef } from"react";
import { toast } from"sonner";

import { Button } from"@/components/ui/Button";
import { createClient } from"@/lib/supabase/client";

interface Project {
 id: string;
 title: string;
 description: string | null;
 link: string | null;
 image: string | null;
}

export default function Profile() {
 const [isEditing, setIsEditing] = useState(false);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [showProjectModal, setShowProjectModal] = useState(false);

 const [profile, setProfile] = useState({
 name:"",
 role:"STUDENT",
 bio:"",
 university:"Campus Alumni",
 year:"2026",
 location:"Remote",
 status:"Available for Gigs",
 github:"",
 linkedin:"",
 instagram:"",
 portfolio:"",
 skills: [] as string[],
 image:"",
 coverImage:"",
 projects: [] as Project[],
 resumeData: null as any,
 });

 const [newProject, setNewProject] = useState({
 title:"",
 description:"",
 link:"",
 image:""
 });

 const [stats, setStats] = useState({
 applications: 0,
 connections: 0,
 completedGigs: 0,
 reputationPoints: 400,
 responseRate: 90,
 });

 /* ===============================
 IMAGE UPLOAD
 =============================== */
 const fileInputRef = useRef<HTMLInputElement>(null);
 const supabase = createClient();

 const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;

 if (file.size > 2 * 1024 * 1024) {
 toast.error("Image size must be less than 2MB");
 return;
 }

 const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
 if (!allowedTypes.includes(file.type)) {
 toast.error("Please upload an image file (JPEG, PNG, WEBP, or GIF)");
 return;
 }

 try {
 // Optimistic update
 const objectUrl = URL.createObjectURL(file);
 setProfile(prev => ({ ...prev, image: objectUrl }));

 const { data: { user } } = await supabase.auth.getUser();
 if (!user) throw new Error("No user");

 const fileExt = file.name.split('.').pop();
 const filePath = `${user.id}-${Date.now()}.${fileExt}`;

 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, file);

 if (uploadError) {
 // If bucket doesn't exist or other error, throw to catch block for base64 fallback
 throw uploadError;
 }

 const { data: { publicUrl } } = supabase.storage
 .from('avatars')
 .getPublicUrl(filePath);

 setProfile(prev => ({ ...prev, image: publicUrl }));
 toast.success("Profile picture updated!");
 } catch (error) {
 console.error("Upload failed, falling back to base64", error);
 // Fallback to base64
 const reader = new FileReader();
 reader.onloadend = () => {
 setProfile(prev => ({ ...prev, image: reader.result as string }));
 };
 reader.readAsDataURL(file);
 }
 };

 /* ===============================
 3D TILT EFFECT
 =============================== */
 const x = useMotionValue(0);
 const y = useMotionValue(0);
 const rotateX = useTransform(useSpring(y, { stiffness: 100, damping: 30 }), [-0.5, 0.5], ["15deg","-15deg"]);
 const rotateY = useTransform(useSpring(x, { stiffness: 100, damping: 30 }), [-0.5, 0.5], ["-15deg","15deg"]);

 const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
 const rect = e.currentTarget.getBoundingClientRect();
 x.set((e.clientX - rect.left) / rect.width - 0.5);
 y.set((e.clientY - rect.top) / rect.height - 0.5);
 };

 const handleMouseLeave = () => {
 x.set(0);
 y.set(0);
 };

 /* ===============================
 FETCH PROFILE
 =============================== */
 useEffect(() => {
 const fetchProfile = async () => {
 try {
 const res = await fetch("/api/user/profile");
 if (!res.ok) throw new Error();

 const data = await res.json();

 const formatSkills = (s: unknown): string[] => {
 if (Array.isArray(s)) return s;
 if (typeof s === 'string') return s.split(',').map(item => item.trim()).filter(Boolean);
 return [];
 };

 setProfile({
 name: data.name ??"Stellar Student",
 role: data.role ??"STUDENT",
 bio: data.bio ??"",
 university: data.college ?? data.university ??"Campus Alumni",
 year: data.year ??"2026",
 location: data.location ??"Remote",
 github: data.github ??"",
 linkedin: data.linkedin ??"",
 instagram: data.instagram ??"",
 portfolio: data.portfolio ??"",
 skills: formatSkills(data.skills),
 image: data.image ?? data.avatar_url ??"",
 coverImage: data.coverImage ??"",
 status: data.status ??"Available for Gigs",
 projects: data.projects ?? [],
 resumeData: data.resumeData ?? null,
 });


 setStats({
 applications: data.stats?.pendingApplications ?? 0,
 connections: data.stats?.connections ?? 0,
 completedGigs: data.stats?.completedGigs ?? 0,
 reputationPoints: data.stats?.reputationPoints ?? 400,
 responseRate: data.stats?.responseRate ?? 90,
 });
 } catch {
 toast.error("Error loading profile");
 } finally {
 setLoading(false);
 }
 };

 fetchProfile();
 }, []);

 /* ===============================
 AUTO-FILL FROM RESUME
 =============================== */
 const handleAutoFill = () => {
 if (!profile.resumeData) return;
 
 try {
 const parsed = profile.resumeData;
 
 // Generate or set Bio
 const newBio = parsed.summary || profile.bio;
 
 // Merge Skills
 const currentSkills = new Set(profile.skills.map((s: string) => s.toLowerCase()));
 const newSkills = [...profile.skills];
 (parsed.skills || []).forEach((skill: string) => {
 if (!currentSkills.has(skill.toLowerCase())) {
 newSkills.push(skill);
 }
 });
 
 // Projects will be handled later, for now let's set bio and skills
 setProfile(prev => ({
 ...prev,
 bio: newBio,
 skills: newSkills
 }));
 
 toast.success("Profile Auto-Filled! Don't forget to Publish Changes.", { icon:"✨" });
 } catch {
 toast.error("Failed to auto-fill from resume.");
 }
 };

 /* ===============================
 SAVE PROFILE
 =============================== */
 const handleSave = async () => {
 setSaving(true);
 try {
 const res = await fetch("/api/user/profile", {
 method:"PATCH",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify(profile),
 });

 if (!res.ok) throw new Error();

 toast.success("Profile updated seamlessly");
 setIsEditing(false);
 } catch {
 toast.error("Failed to update profile");
 } finally {
 setSaving(false);
 }
 };

 /* ===============================
 PROJECTS MANAGEMENT
 =============================== */
 const handleAddProject = async () => {
 if (!newProject.title) return toast.error("Project title is required");

 try {
 const res = await fetch("/api/user/projects", {
 method:"POST",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify(newProject),
 });

 if (!res.ok) throw new Error();

 const savedProject = await res.json();
 setProfile(prev => ({
 ...prev,
 projects: [...prev.projects, savedProject]
 }));

 setNewProject({ title:"", description:"", link:"", image:"" });
 setShowProjectModal(false);
 toast.success("Project added to Wall of Fame");
 } catch {
 toast.error("Failed to add project");
 }
 };

 const handleRemoveProject = async (id: string) => {
 try {
 const res = await fetch(`/api/user/projects?id=${id}`, {
 method:"DELETE"
 });

 if (!res.ok) throw new Error();

 setProfile(prev => ({
 ...prev,
 projects: prev.projects.filter(p => p.id !== id)
 }));
 toast.success("Project removed");
 } catch {
 toast.error("Failed to remove project");
 }
 };

 const addSkill = (skill: string) => {
 if (!skill || profile.skills.includes(skill)) return;
 setProfile({ ...profile, skills: [...profile.skills, skill] });
 };

 const removeSkill = (skill: string) => {
 setProfile({
 ...profile,
 skills: profile.skills.filter((s) => s !== skill),
 });
 };

 if (loading) {
 return (
 <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--color-background)" }}>
 <div className="h-12 w-12 rounded-full border-r-2 animate-spin" style={{ borderColor:"var(--color-primary)" }} />
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-background text-foreground font-display transition-colors duration-300">
 {/* LUXURY HEADER SECTION */}
 <div className="relative h-100 w-full overflow-hidden">
 <motion.div
 initial={{ scale: 1.1 }}
 animate={{ scale: 1 }}
 className="absolute inset-0 bg-center"
 style={{
 backgroundImage: profile.coverImage
 ? `url(${profile.coverImage})`
 :"linear-gradient(135deg, #0a0a0f 0%, rgba(31,169,113,0.15) 100%)",
 }}
 />
 <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-background" />

 {/* Header Action */}
 <div className="absolute top-8 right-8 flex gap-3 z-20">
 {isEditing && profile.resumeData && (
 <Button
 variant="glass"
 onClick={handleAutoFill}
 className="bg-orange-500/20 backdrop-blur-xl border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-foreground transition-all duration-500 rounded-full px-6 py-3 font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-2"
 >
 <Sparkles size={16} /> Auto-Fill
 </Button>
 )}
 <Button
 variant="glass"
 onClick={() => isEditing ? handleSave() : setIsEditing(true)}
 disabled={saving}
 className="bg-accent backdrop-blur-xl border-(--border-subtle) hover:bg-white hover:text-foreground transition-all duration-500 rounded-full px-8 py-3 font-black text-sm uppercase tracking-widest shadow-2xl"
 >
 {isEditing ? (saving ?"Syncing..." :"Publish Changes") :"Customize Profile"}
 </Button>
 {isEditing && (
 <Button
 variant="glass"
 onClick={() => setIsEditing(false)}
 className="bg-red-500/20 backdrop-blur-xl border-red-500/30 text-foreground hover:bg-red-500 transition-all rounded-full p-3"
 >
 <X size={20} />
 </Button>
 )}
 </div>
 </div>

 <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10 pb-20">
 <div className="grid lg:grid-cols-12 gap-12">

 {/* LEFT COLUMN: IDENTITY CARD */}
 <aside className="lg:col-span-4">
 <motion.div
 onMouseMove={handleMouseMove}
 onMouseLeave={handleMouseLeave}
 style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
 className="bg-card/80 backdrop-blur-xl rounded-5xl shadow-2xl p-10 border border-(--border-subtle) flex flex-col items-center text-center relative overflow-hidden"
 >
 {/* Accent bar */}
 <div className="absolute top-0 left-0 w-full h-1.5 rounded-t-5xl" style={{ background: "linear-gradient(90deg, var(--color-primary), #ffb800)" }} />

 {/* Avatar */}
 <div className="relative group mb-8">
 <div className="h-40 w-40 rounded-4xl bg-(--surface-2) flex items-center justify-center font-black text-foreground shadow-2xl transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 overflow-hidden border border-white/10">
 {profile.image ? (
 <Image src={profile.image} alt={profile.name} width={120} height={120} className="h-full w-full object-cover" />
 ) : (
 profile.name[0]
 )}
 </div>
 {isEditing && (
 <>
 <button
 onClick={() => fileInputRef.current?.click()}
 className="absolute bottom-2 right-2 p-3 bg-white text-foreground rounded-2xl shadow-xl hover:scale-110 transition-all z-20"
 >
 <Camera size={20} />
 </button>
 <input
 type="file"
 ref={fileInputRef}
 className="hidden"
 accept="image/*"
 onChange={handleImageUpload}
 />
 </>
 )}
 </div>

 {/* Info */}
 <div className="space-y-4 w-full relative z-10">
 {isEditing ? (
 <div className="space-y-4">
 <input
 value={profile.name}
 onChange={(e) => setProfile({ ...profile, name: e.target.value })}
 placeholder="Display Name"
 className="w-full bg-(--surface-2) border border-white/5 rounded-2xl px-6 py-4 font-black focus:border-electric outline-none transition-all text-foreground"
 />
 <input
 value={profile.role}
 onChange={(e) => setProfile({ ...profile, role: e.target.value })}
 placeholder="Professional Role"
 className="w-full bg-(--surface-2) border border-white/5 rounded-2xl px-6 py-3 font-bold text-center focus:border-electric outline-none transition-all"
 />
 </div>
 ) : (
 <>
 <div>
 <h1 className="font-black text-foreground tracking-tighter leading-none mb-2">
 {profile.name}
 </h1>
 <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border" style={{ background:"rgba(31,169,113,0.10)", color:"var(--color-primary)", borderColor:"rgba(31,169,113,0.20)" }}>
 <Zap size={12} fill="currentColor" /> {profile.role}
 </div>
 </div>
 <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
 <MapPin size={16} style={{ color:"var(--color-primary)" }} /> {profile.location}
 </p>
 </>
 )}
 </div>

 {/* Social Connectivity */}
 <div className="mt-10 pt-10 border-t border-white/5 w-full relative z-10">
 <p className="font-black text-muted-foreground uppercase tracking-[0.2em] mb-6">Digital Presence</p>
 <div className="space-y-4">
 <SocialLink
 icon={Github}
 label="GitHub"
 value={profile.github}
 isEditing={isEditing}
 onChange={(val) => setProfile({ ...profile, github: val })}
 />
 <SocialLink
 icon={Linkedin}
 label="LinkedIn"
 value={profile.linkedin}
 isEditing={isEditing}
 onChange={(val) => setProfile({ ...profile, linkedin: val })}
 />
 <SocialLink
 icon={Instagram}
 label="Instagram"
 value={profile.instagram}
 isEditing={isEditing}
 onChange={(val) => setProfile({ ...profile, instagram: val })}
 />
 <SocialLink
 icon={Globe}
 label="Portfolio"
 value={profile.portfolio}
 isEditing={isEditing}
 onChange={(val) => setProfile({ ...profile, portfolio: val })}
 />
 </div>
 </div>

 {/* Stats Quick Look */}
 <div className="grid grid-cols-2 gap-4 mt-8 w-full relative z-10">
 <div className="bg-(--surface-2)/50 p-4 rounded-3xl border border-white/5">
 <p className="font-black text-foreground">{stats.connections}</p>
 <p className="font-bold text-muted-foreground uppercase">Network</p>
 </div>
 <div className="bg-(--surface-2)/50 p-4 rounded-3xl border border-white/5">
 <p className="font-black text-foreground flex items-center gap-1">
 {(stats.reputationPoints / 100).toFixed(1)} <Sparkles size={16} className="text-amber-400" />
 </p>
 <p className="font-bold text-muted-foreground uppercase">Reputation Loop</p>
 </div>
 </div>

 {/* Referral Code Mini */}
 <div className="mt-4 w-full relative z-10 rounded-3xl flex items-center justify-between p-4" style={{ background:"rgba(31,169,113,0.05)", border:"1px solid rgba(31,169,113,0.20)" }}>
 <div>
 <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color:"var(--color-primary)" }}>Invite Friends</p>
 <p className="font-bold text-muted-foreground">Earn a profile boost</p>
 </div>
 <Button variant="outline" className="h-8 rounded-xl text-xs font-black px-3" style={{ borderColor:"var(--color-primary)", color:"var(--color-primary)" }} onClick={() => {
 navigator.clipboard.writeText("CAMPUS2024");
 toast.success("Referral code copied!");
 }}>
 Copy Link
 </Button>
 </div>
 </motion.div>
 </aside>

 {/* RIGHT COLUMN: CONTENT BIOGRAPHY & PROJECTS */}
 <div className="lg:col-span-8 space-y-12">

 {/* THE STORY (ABOUT) */}
 <section className="bg-card/60 backdrop-blur-xl rounded-5xl p-10 border border-(--border-subtle) shadow-xl">
 <div className="flex items-center justify-between mb-8">
 <h2 className="font-black text-foreground tracking-tight flex items-center gap-3">
 <div className="p-3 bg-background text-foreground rounded-2xl shadow-lg">
 <Award size={20} />
 </div>
 The Story
 </h2>
 </div>

 {isEditing ? (
 <textarea
 value={profile.bio}
 onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
 placeholder="Write your professional journey..."
 className="w-full h-48 bg-(--surface-2) border border-white/5 rounded-3xl p-6 font-medium text-foreground focus:border-electric outline-none transition-all resize-none"
 />
 ) : (
 <p className="text-muted-foreground leading-relaxed font-medium">
 {profile.bio ||"No biography provided yet. Start telling your story."}
 </p>
 )}

 {/* Skills Cloud */}
 <div className="mt-10">
 <p className="font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Core Competencies</p>
 <div className="flex flex-wrap gap-2">
 {profile.skills.map((skill) => (
 <motion.span
 key={skill}
 layout
 className="px-5 py-2.5 rounded-2xl bg-background text-foreground text-xs font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
 >
 {skill}
 {isEditing && (
 <X
 size={14}
 className="cursor-pointer hover:rotate-90 transition-transform"
 onClick={() => removeSkill(skill)}
 />
 )}
 </motion.span>
 ))}
 {isEditing && (
 <input
 placeholder="+ Add skill"
 className="px-5 py-2.5 rounded-2xl bg-(--surface-2) border-(--border) font-black outline-none focus:border-electric transition-all text-foreground"
 onKeyDown={(e) => {
 if (e.key ==="Enter") {
 addSkill(e.currentTarget.value);
 e.currentTarget.value ="";
 }
 }}
 />
 )}
 </div>
 </div>
 </section>

 {/* WALL OF FAME (PROJECTS) */}
 <section>
 <div className="flex items-center justify-between mb-8 px-4">
 <h2 className="font-black text-foreground tracking-tight flex items-center gap-4">
 <div className="p-3 rounded-2xl shadow-xl text-foreground" style={{ background:"var(--color-primary)", boxShadow:"0 8px 24px rgba(31,169,113,0.20)" }}>
 <Code size={24} />
 </div>
 Wall of Fame
 </h2>
 <Button
 onClick={() => setShowProjectModal(true)}
 className="rounded-2xl px-6 py-6 shadow-xl active:scale-95 transition-all font-bold text-foreground"
 style={{ background:"var(--color-primary)", boxShadow:"0 8px 24px rgba(31,169,113,0.20)" }}>

 <Plus size={20} className="mr-2" /> Showcase Project
 </Button>
 </div>

 <div className="grid md:grid-cols-2 gap-8">
 <AnimatePresence mode="popLayout">
 {profile.projects.length > 0 ? (
 profile.projects.map((project) => (
 <ProjectCard
 key={project.id}
 project={project}
 onRemove={() => handleRemoveProject(project.id)}
 />
 ))
 ) : (
 <div className="md:col-span-2 py-20 bg-(--surface) border-(--border) rounded-5xl flex flex-col items-center justify-center text-muted-foreground gap-4">
 <Code size={48} className="opacity-20" />
 <p className="font-black">Your portfolio is empty. Add your best work!</p>
 </div>
 )}
 </AnimatePresence>
 </div>
 </section>

 {/* AI RESUME ANALYZER & GAMIFICATION SECTION */}
 <div className="grid md:grid-cols-2 gap-8">
 {/* AI Resume Analyzer */}
 <section className="rounded-5xl p-8 relative overflow-hidden group" style={{ background:"linear-gradient(135deg, rgba(31,169,113,0.08), rgba(6,182,212,0.08))", border:"1px solid rgba(31,169,113,0.15)" }}>
 <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
 <FileText size={80} style={{ color:"var(--color-primary)" }} />
 </div>
 <div className="relative z-10 h-full flex flex-col">
 <div className="flex items-center gap-3 mb-4">
 <div className="p-2.5 text-foreground rounded-xl shadow-lg" style={{ background:"var(--color-primary)", boxShadow:"0 4px 16px rgba(31,169,113,0.30)" }}>
 <Sparkles size={18} />
 </div>
 <h2 className="font-black text-foreground">AI Resume Analyzer</h2>
 </div>
 <p className="text-muted-foreground font-medium mb-6">
 Get instant AI feedback on your resume. Optimize keywords, fix formatting, and match startup requirements seamlessly.
 </p>

 <div className="mt-auto space-y-3">
 <div className="flex items-center gap-2 font-bold text-muted-foreground">
 <CheckCircle2 size={14} className="text-emerald-500" /> ATS Optimization Check
 </div>
 <div className="flex items-center gap-2 font-bold text-muted-foreground">
 <CheckCircle2 size={14} className="text-emerald-500" /> Action Verb Enhancement
 </div>
 <Button className="w-full mt-4 text-foreground shadow-xl font-bold rounded-2xl p-6" style={{ background:"var(--color-primary)", boxShadow:"0 8px 24px rgba(31,169,113,0.25)" }}>
 Upload & Analyze
 </Button>
 </div>
 </div>
 </section>

 {/* Gamification & Reputation */}
 <section className="bg-card/60 backdrop-blur-xl border border-(--border-subtle) rounded-5xl p-8 relative overflow-hidden">
 <div className="flex items-center justify-between mb-6">
 <h2 className="font-black text-foreground flex items-center gap-3">
 <div className="p-2.5 bg-amber-500 text-foreground rounded-xl shadow-lg shadow-amber-500/30">
 <TrendingUp size={18} />
 </div>
 Campus Rank
 </h2>
 <span className="px-3 py-1 bg-warning/10 text-warning border border-amber-500/20 rounded-full text-xs font-black uppercase tracking-widest">
 Top 5%
 </span>
 </div>

 <div className="space-y-6">
 <div>
 <div className="flex justify-between items-end mb-2">
 <span className="font-black text-foreground">{stats.reputationPoints} <span className="text-muted-foreground">pts</span></span>
 <span className="font-bold text-emerald-500">+15 this week</span>
 </div>
 <div className="h-2 bg-(--surface-2) rounded-full overflow-hidden">
 <div className="h-full bg-linear-to-r from-amber-400 to-orange-500 rounded-full" style={{ width: `${Math.min(100, (stats.reputationPoints / 1000) * 100)}%` }} />
 </div>
 <p className="font-bold mt-2 uppercase tracking-widest text-center">{Math.max(0, 1000 - stats.reputationPoints)} pts to &quot;Expert&quot; tier</p>
 </div>

 <div className="pt-4 border-t border-white/5">
 <div className="grid grid-cols-2 gap-4 mb-5">
 <div>
 <p className="font-black text-foreground">{stats.completedGigs}</p>
 <p className="font-bold text-muted-foreground uppercase">Completed Gigs</p>
 </div>
 <div>
 <p className="font-black text-foreground">{stats.responseRate}%</p>
 <p className="font-bold text-muted-foreground uppercase">Response Rate</p>
 </div>
 </div>
 <p className="font-black text-muted-foreground uppercase tracking-widest mb-3">Trust Badges</p>
 <div className="flex gap-2">
 <div className="flex items-center justify-center p-3 bg-blue-50 border border-border text-foreground rounded-2xl hover:scale-105 transition-transform cursor-help" title="Top Developer">
 <Code size={20} />
 </div>
 <div className="flex items-center justify-center p-3 bg-primary border border-primary/20 text-primary rounded-2xl hover:scale-105 transition-transform cursor-help" title="Verified Designer">
 <Award size={20} />
 </div>
 <div className="flex items-center justify-center p-3 bg-emerald-50 border border-emerald-500/20 text-emerald-500 rounded-2xl hover:scale-105 transition-transform cursor-help" title="Campus Leader">
 <Users size={20} />
 </div>
 </div>
 </div>
 </div>
 </section>
 </div>
 </div>
 </div>
 </main>

 {/* PROJECT MODAL */}
 <AnimatePresence>
 {showProjectModal && (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 onClick={() => setShowProjectModal(false)}
 className="absolute inset-0 bg-black/60 backdrop-blur-md"
 />
 <motion.div
 initial={{ opacity: 0, scale: 0.9, y: 40 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.9, y: 40 }}
 className="relative w-full max-w-xl bg-(--surface) rounded-5xl shadow-2xl p-10 flex flex-col gap-6 border border-white/5"
 >
 <div className="flex justify-between items-center">
 <h3 className="font-black text-foreground tracking-tight">Showcase Project</h3>
 <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-(--surface-2) :bg-card rounded-full transition-colors text-muted-foreground">
 <X size={24} />
 </button>
 </div>

 <div className="space-y-4">
 <InputField
 label="Project Title"
 value={newProject.title}
 onChange={(v) => setNewProject({ ...newProject, title: v })}
 placeholder="e.g. Luxury Real Estate App"
 />
 <InputField
 label="Live Link / Repository"
 value={newProject.link}
 onChange={(v) => setNewProject({ ...newProject, link: v })}
 placeholder="https://github.com/..."
 />
 <div className="space-y-2">
 <label className="font-black text-muted-foreground uppercase tracking-widest px-1">Description</label>
 <textarea
 value={newProject.description}
 onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
 className="w-full h-32 bg-(--surface-2) border border-white/5 rounded-2xl p-4 font-bold outline-none focus:border-electric transition-all resize-none text-foreground"
 placeholder="What makes this project standout?"
 />
 </div>
 </div>

 <Button
 onClick={handleAddProject}
 className="w-full bg-foreground hover:bg-foreground/90 text-background py-6 rounded-2xl font-black text-lg transition-all shadow-xl"
 >
 Publish to Wall of Fame
 </Button>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </div>
 );
}

/* ===============================
 COMPONENTS
================================ */

function SocialLink({ icon: Icon, label, value, isEditing, onChange }: {
 icon: LucideIcon,
 label: string,
 value: string,
 isEditing: boolean,
 onChange: (val: string) => void
}) {
 return (
 <div className="group">
 {isEditing ? (
 <div className="relative">
 <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
 <input
 value={value}
 onChange={(e) => onChange(e.target.value)}
 placeholder={`${label} Profile URL`}
 className="w-full bg-(--surface-2) border border-white/5 rounded-2xl pl-12 pr-6 py-3 font-bold text-foreground focus:border-electric outline-none transition-all"
 />
 </div>
 ) : (
 <a
 href={value}
 target="_blank"
 rel="noopener noreferrer"
 className={`flex items-center gap-4 p-4 rounded-2xl border-transparent transition-all duration-300 ${!value ?"opacity-30 pointer-events-none" :""}`}
 style={{}}
 onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor ="rgba(31,169,113,0.20)"; (e.currentTarget as HTMLElement).style.background ="rgba(31,169,113,0.05)" }}
 onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor ="transparent"; (e.currentTarget as HTMLElement).style.background ="transparent" }}
 >
 <div className="h-10 w-10 bg-(--surface-2) shadow-lg border border-white/5 rounded-xl flex items-center justify-center text-foreground transition-all"
 onMouseEnter={(e) => { const el = e.currentTarget; el.style.background ="var(--color-primary)"; el.style.color ="white" }}
 onMouseLeave={(e) => { const el = e.currentTarget; el.style.background =""; el.style.color ="" }}>
 <Icon size={18} />
 </div>
 <div className="text-left">
 <p className="font-black text-muted-foreground uppercase tracking-widest">{label}</p>
 <p className="font-black text-foreground truncate max-w-37.5">{value ?"Connected" :"Not Connected"}</p>
 </div>
 {value && <ExternalLink size={14} className="ml-auto text-muted-foreground transition-all" style={{ color:"var(--color-text-muted)" }} />}
 </a>
 )}
 </div>
 );
}

function ProjectCard({ project, onRemove }: { project: Project, onRemove: () => void }) {
 return (
 <motion.div
 layout
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="group bg-card/50 backdrop-blur-xl rounded-4xl border border-white/5 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
 >
 <div className="relative h-48 bg-(--surface-2)">
 {project.image ? (
 <Image src={project.image} alt={project.title} width={400} height={300} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100">
 <Code size={40} className="text-foreground" />
 </div>
 )}

 {/* Actions Overlay */}
 <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
 {project.link && (
 <a
 href={project.link}
 target="_blank"
 rel="noopener noreferrer"
 className="p-4 bg-white rounded-2xl text-foreground hover:scale-110 transition-transform shadow-2xl"
 >
 <ExternalLink size={20} />
 </a>
 )}
 <button
 onClick={onRemove}
 className="p-4 bg-red-500 rounded-2xl text-foreground hover:scale-110 transition-transform shadow-2xl shadow-red-500/20"
 >
 <Trash2 size={20} />
 </button>
 </div>
 </div>

 <div className="p-8">
 <h3 className="font-black text-foreground mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
 <p className="text-sm font-medium line-clamp-2 leading-relaxed">
 {project.description ||"No description provided."}
 </p>
 </div>
 </motion.div>
 );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
 return (
 <div className="space-y-2">
 <label className="font-black text-muted-foreground uppercase tracking-widest px-1">{label}</label>
 <input
 value={value}
 onChange={(e) => onChange(e.target.value)}
 placeholder={placeholder}
 className="w-full bg-(--surface-2) border border-white/5 rounded-2xl px-6 py-4 font-bold text-foreground outline-none focus:border-electric transition-all"
 />
 </div>
 );
}
