"use client";

import { useState, useEffect } from "react";
import {
    MapPin,
    Calendar,
    Briefcase,
    GraduationCap,
    Edit3,
    X,
    Camera,
    Upload,
    Github,
    Linkedin,
    Instagram,
    Sparkles,
    Zap,
    Users,
    Link as LinkIcon,
    Plus,
    Trash2,
    ExternalLink,
    Globe,
    Award,
    Code
} from "lucide-react";
import {
    motion,
    AnimatePresence,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

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
        name: "",
        role: "STUDENT",
        bio: "",
        university: "Campus Alumni",
        year: "2026",
        location: "Remote",
        status: "Available for Gigs",
        github: "",
        linkedin: "",
        instagram: "",
        portfolio: "",
        skills: [] as string[],
        image: "",
        coverImage: "",
        projects: [] as Project[],
    });

    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        link: "",
        image: ""
    });

    const [stats, setStats] = useState({
        applications: 0,
        connections: 0,
    });

    /* ===============================
       3D TILT EFFECT
    =============================== */
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(useSpring(y, { stiffness: 100, damping: 30 }), [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(useSpring(x, { stiffness: 100, damping: 30 }), [-0.5, 0.5], ["-15deg", "15deg"]);

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

                setProfile({
                    name: data.name ?? "Stellar Student",
                    role: data.role ?? "STUDENT",
                    bio: data.bio ?? "",
                    university: data.university ?? "Campus Alumni",
                    year: data.year ?? "2026",
                    location: data.location ?? "Remote",
                    github: data.github ?? "",
                    linkedin: data.linkedin ?? "",
                    instagram: data.instagram ?? "",
                    portfolio: data.portfolio ?? "",
                    skills: data.skills || [],
                    image: data.image ?? "",
                    coverImage: data.coverImage ?? "",
                    status: data.status ?? "Available for Gigs",
                    projects: data.projects ?? [],
                });

                setStats({
                    applications: data._count?.applications ?? 0,
                    connections: data._count?.conversations ?? 0,
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
       SAVE PROFILE
    =============================== */
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProject),
            });

            if (!res.ok) throw new Error();

            const savedProject = await res.json();
            setProfile(prev => ({
                ...prev,
                projects: [...prev.projects, savedProject]
            }));

            setNewProject({ title: "", description: "", link: "", image: "" });
            setShowProjectModal(false);
            toast.success("Project added to Wall of Fame");
        } catch {
            toast.error("Failed to add project");
        }
    };

    const handleRemoveProject = async (id: string) => {
        try {
            const res = await fetch(`/api/user/projects?id=${id}`, {
                method: "DELETE"
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
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-12 w-12 rounded-full border-t-2 border-primary border-r-2"
                />
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
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: profile.coverImage
                            ? `url(${profile.coverImage})`
                            : "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                    }}
                />
                <div className="absolute inset-0 bg-linear-to-b from-black/20 via-black/40 to-background" />

                {/* Header Action */}
                <div className="absolute top-8 right-8 flex gap-3 z-20">
                    <Button
                        variant="glass"
                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                        disabled={saving}
                        className="bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all duration-500 rounded-full px-8 py-3 font-black text-sm uppercase tracking-widest shadow-2xl"
                    >
                        {isEditing ? (saving ? "Syncing..." : "Publish Changes") : "Customize Profile"}
                    </Button>
                    {isEditing && (
                        <Button
                            variant="glass"
                            onClick={() => setIsEditing(false)}
                            className="bg-red-500/20 backdrop-blur-xl border-red-500/30 text-white hover:bg-red-500 transition-all rounded-full p-3"
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
                            className="bg-card/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-10 border border-white/20 dark:border-slate-800 flex flex-col items-center text-center relative overflow-hidden"
                        >
                            {/* Accent Decoration */}
                            <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-electric via-indigo-500 to-purple-600" />

                            {/* Avatar */}
                            <div className="relative group mb-8">
                                <div className="h-40 w-40 rounded-[2rem] bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-6xl font-black text-white shadow-2xl transform transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 overflow-hidden border-4 border-white dark:border-slate-700">
                                    {profile.image ? (
                                        <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
                                    ) : (
                                        profile.name[0]
                                    )}
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-2 right-2 p-3 bg-white text-slate-900 rounded-2xl shadow-xl hover:scale-110 transition-all z-20">
                                        <Camera size={20} />
                                    </button>
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
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-black text-xl text-center focus:border-electric outline-none transition-all text-foreground"
                                        />
                                        <input
                                            value={profile.role}
                                            onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                            placeholder="Professional Role"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-3 font-bold text-muted-foreground text-center focus:border-electric outline-none transition-all"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h1 className="text-4xl font-black text-foreground tracking-tighter leading-none mb-2">
                                                {profile.name}
                                            </h1>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-electric/10 text-electric rounded-full text-xs font-black uppercase tracking-widest border border-electric/20">
                                                <Zap size={12} fill="currentColor" /> {profile.role}
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
                                            <MapPin size={16} className="text-electric" /> {profile.location}
                                        </p>
                                    </>
                                )}
                            </div>

                            {/* Social Connectivity */}
                            <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 w-full relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Digital Presence</p>
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
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-2xl font-black text-foreground">{stats.connections}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Network</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-2xl font-black text-foreground">4.9</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Rating</p>
                                </div>
                            </div>
                        </motion.div>
                    </aside>

                    {/* RIGHT COLUMN: CONTENT BIOGRAPHY & PROJECTS */}
                    <div className="lg:col-span-8 space-y-12">

                        {/* THE STORY (ABOUT) */}
                        <section className="bg-card/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-[2.5rem] p-10 border border-white/20 dark:border-slate-800 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-black text-foreground tracking-tight flex items-center gap-3">
                                    <div className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-lg">
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
                                    className="w-full h-48 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl p-6 font-medium text-foreground focus:border-electric outline-none transition-all resize-none"
                                />
                            ) : (
                                <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                    {profile.bio || "No biography provided yet. Start telling your story."}
                                </p>
                            )}

                            {/* Skills Cloud */}
                            <div className="mt-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Competencies</p>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((skill) => (
                                        <motion.span
                                            key={skill}
                                            layout
                                            className="px-5 py-2.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
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
                                            className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 text-xs font-black outline-none focus:border-electric transition-all text-foreground"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    addSkill(e.currentTarget.value);
                                                    e.currentTarget.value = "";
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
                                <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-4">
                                    <div className="p-3 bg-electric text-white rounded-2xl shadow-xl shadow-electric/20">
                                        <Code size={24} />
                                    </div>
                                    Wall of Fame
                                </h2>
                                <Button
                                    onClick={() => setShowProjectModal(true)}
                                    className="bg-electric hover:bg-blue-600 text-white rounded-2xl px-6 py-6 shadow-xl active:scale-95 transition-all font-bold"
                                >
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
                                        <div className="md:col-span-2 py-20 bg-slate-50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-400 gap-4">
                                            <Code size={48} className="opacity-20" />
                                            <p className="font-black">Your portfolio is empty. Add your best work!</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>
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
                            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 flex flex-col gap-6 border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex justify-between items-center">
                                <h3 className="text-3xl font-black text-foreground tracking-tight">Showcase Project</h3>
                                <button onClick={() => setShowProjectModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400">
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
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Description</label>
                                    <textarea
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 font-bold outline-none focus:border-electric transition-all resize-none text-foreground"
                                        placeholder="What makes this project standout?"
                                    />
                                </div>
                            </div>

                            <Button
                                onClick={handleAddProject}
                                className="w-full bg-slate-900 dark:bg-white hover:bg-electric dark:hover:bg-electric text-white dark:text-slate-900 py-6 rounded-2xl font-black text-lg transition-all shadow-xl"
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

import { LucideIcon } from "lucide-react";

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
                    <Icon size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={`${label} Profile URL`}
                        className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-foreground focus:border-electric outline-none transition-all"
                    />
                </div>
            ) : (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 border-transparent hover:border-electric/20 hover:bg-electric/5 transition-all duration-300 ${!value ? "opacity-30 pointer-events-none" : ""}`}
                >
                    <div className="h-10 w-10 bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 rounded-xl flex items-center justify-center text-slate-900 dark:text-white group-hover:bg-electric group-hover:text-white transition-all">
                        <Icon size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                        <p className="text-sm font-black text-foreground truncate max-w-[150px]">{value ? "Connected" : "Not Connected"}</p>
                    </div>
                    {value && <ExternalLink size={14} className="ml-auto text-slate-300 group-hover:text-electric transition-all" />}
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
            className="group bg-card/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-500"
        >
            <div className="relative h-48 bg-slate-100 dark:bg-slate-800">
                {project.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                        <Code size={40} className="text-slate-200 dark:text-slate-700" />
                    </div>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                    {project.link && (
                        <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-4 bg-white rounded-2xl text-slate-900 hover:scale-110 transition-transform shadow-2xl"
                        >
                            <ExternalLink size={20} />
                        </a>
                    )}
                    <button
                        onClick={onRemove}
                        className="p-4 bg-red-500 rounded-2xl text-white hover:scale-110 transition-transform shadow-2xl shadow-red-500/20"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            <div className="p-8">
                <h3 className="text-xl font-black text-foreground mb-2 group-hover:text-electric transition-colors">{project.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed">
                    {project.description || "No description provided."}
                </p>
            </div>
        </motion.div>
    );
}

function InputField({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
    return (
        <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl px-6 py-4 font-bold text-foreground outline-none focus:border-electric transition-all"
            />
        </div>
    );
}
