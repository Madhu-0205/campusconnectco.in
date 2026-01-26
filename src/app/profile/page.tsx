"use client";

import { useState, useEffect, useRef } from 'react';
import { MapPin, Calendar, Link as LinkIcon, Briefcase, GraduationCap, Edit3, Save, X, Camera, Upload, Trash2, Github, ExternalLink, Sparkles, Zap, Users } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { toast } from 'sonner';

export default function Profile() {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        name: "",
        role: "STUDENT",
        bio: "",
        university: "Campus Alumni",
        year: "2026",
        location: "Remote",
        status: "Available for Gigs",
        github: "",
        skills: [] as string[],
        image: "",
        coverImage: ""
    });

    // 3D Tilt Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const [stats, setStats] = useState({ applications: 0, connections: 0 });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/user/profile");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setProfile({
                    name: data.name || "Stellar Student",
                    bio: data.bio || "Crafting digital experiences and solving campus problems.",
                    skills: data.skills ? data.skills.split(',') : ["React", "Design", "Node.js"],
                    image: data.image || "",
                    coverImage: data.coverImage || "",
                    role: data.role || "STUDENT",
                    university: data.university || "Campus Alumni",
                    year: data.year || "2026",
                    location: data.location || "Remote",
                    github: data.github || "",
                    status: data.status || "Available for Gigs",
                });
                setStats({
                    applications: data._count?.applications || 0,
                    connections: data._count?.conversations || 0,
                });
            } catch (error) {
                toast.error("Error loading profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(profile)
            });
            if (!res.ok) throw new Error("Failed to save");
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const addSkill = (skill: string) => {
        if (!skill || profile.skills.includes(skill)) return;
        setProfile({ ...profile, skills: [...profile.skills, skill] });
    };

    const removeSkill = (skill: string) => {
        setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#faf3e0] py-12">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 relative"
            >
                {/* Background Decor */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-electric/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] -z-10" />

                {/* Cover Image Section */}
                <div className="relative group/cover h-64 md:h-80 rounded-3xl overflow-hidden mb-8 shadow-2xl border border-white/5">
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/cover:scale-105"
                        style={{ backgroundImage: profile.coverImage ? `url(${profile.coverImage})` : `linear-gradient(to right, #0f172a, #1e1b4b, #312e81)` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {isEditing && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover/cover:opacity-100 transition-opacity">
                            <label className="cursor-pointer flex flex-col items-center gap-2 text-white font-bold h-full w-full justify-center">
                                <Camera size={32} className="animate-bounce" />
                                <span>Update Cover Design</span>
                                <input type="file" className="hidden" />
                            </label>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 -mt-32 relative z-10">

                    {/* Profile Card Col */}
                    <div className="lg:col-span-4">
                        <motion.div
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="glass-card rounded-[2.5rem] p-8 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] bg-slate-900/60 backdrop-blur-2xl"
                        >
                            <div className="relative mb-8" style={{ transform: "translateZ(50px)" }}>
                                <div className="h-40 w-40 rounded-3xl border-4 border-slate-900 bg-slate-800 mx-auto relative overflow-hidden group/avatar shadow-2xl skew-x-1">
                                    {profile.image ? (
                                        <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#f4e4bc] flex items-center justify-center text-5xl font-black text-slate-900 shadow-inner">
                                            {profile.name[0]}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer">
                                            <Upload className="text-white" size={24} />
                                        </div>
                                    )}
                                </div>

                                {/* Pro Badge */}
                                <div className="absolute -bottom-2 right-12 h-10 w-10 rounded-2xl bg-slate-950 flex items-center justify-center text-emerald-400 shadow-2xl border border-white/10 animate-pulse">
                                    <Sparkles size={20} />
                                </div>
                            </div>

                            <div className="text-center" style={{ transform: "translateZ(30px)" }}>
                                <AnimatePresence mode="wait">
                                    {isEditing ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="space-y-4 mb-6"
                                        >
                                            <input
                                                value={profile.name}
                                                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                                className="w-full bg-[#f4e4bc] border border-white/10 rounded-2xl px-4 py-3 text-slate-900 text-center font-black text-xl focus:border-electric focus:ring-1 focus:ring-electric outline-none"
                                                placeholder="Your Display Name"
                                            />
                                            <input
                                                value={profile.role}
                                                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                                                className="w-full bg-[#f4e4bc] border border-white/10 rounded-xl px-4 py-2 text-indigo-900 text-center font-bold text-sm focus:border-electric outline-none"
                                                placeholder="Your Role"
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className="mb-6">
                                            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{profile.name}</h1>
                                            <p className="text-slate-950 font-black uppercase tracking-widest text-xs inline-block px-3 py-1 bg-slate-950/10 rounded-full border border-slate-950/20">
                                                {profile.role}
                                            </p>
                                        </div>
                                    )}
                                </AnimatePresence>

                                <div className="h-px w-full bg-linear-to-r from-transparent via-white/10 to-transparent mb-6" />

                                <div className="space-y-4 text-sm text-slate-900 font-bold mb-8">
                                    {isEditing ? (
                                        <div className="space-y-4 text-left">
                                            <div className="flex items-center gap-2 bg-[#f4e4bc] p-3 rounded-2xl border border-white/10">
                                                <GraduationCap size={16} className="text-indigo-900 shrink-0" />
                                                <input
                                                    value={profile.university}
                                                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-slate-900 font-bold w-full"
                                                    placeholder="University"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#f4e4bc] p-3 rounded-2xl border border-white/10">
                                                <Calendar size={16} className="text-indigo-900 shrink-0" />
                                                <input
                                                    value={profile.year}
                                                    onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-slate-900 font-bold w-full"
                                                    placeholder="Graduation Year"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#f4e4bc] p-3 rounded-2xl border border-white/10">
                                                <MapPin size={16} className="text-indigo-900 shrink-0" />
                                                <input
                                                    value={profile.location}
                                                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-slate-900 font-bold w-full"
                                                    placeholder="Location"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 bg-[#f4e4bc] p-3 rounded-2xl border border-white/10">
                                                <Github size={16} className="text-indigo-900 shrink-0" />
                                                <input
                                                    value={profile.github}
                                                    onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                                                    className="bg-transparent border-none outline-none text-slate-900 font-bold w-full"
                                                    placeholder="GitHub Link"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3 justify-center lg:justify-start">
                                                <GraduationCap size={20} className="text-indigo-900" />
                                                <span>{profile.university} • {profile.year}</span>
                                            </div>
                                            <div className="flex items-center gap-3 justify-center lg:justify-start">
                                                <MapPin size={20} className="text-indigo-900" />
                                                <span>{profile.location}</span>
                                            </div>
                                            <div className="flex items-center gap-3 justify-center lg:justify-start">
                                                <Github size={20} className="text-indigo-900" />
                                                <span className="truncate">{profile.github || "Add GitHub"}</span>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                                        className={`flex-1 font-black py-4 rounded-2xl h-auto border-none shadow-xl transition-all hover:scale-[1.05] active:scale-[0.95] ${isEditing ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-white text-slate-950 hover:bg-slate-100'}`}
                                        disabled={saving}
                                    >
                                        {isEditing ? (saving ? "Saving..." : "Save Bio") : "Edit Profile"}
                                    </Button>
                                    {isEditing && (
                                        <Button
                                            variant="glass"
                                            onClick={() => setIsEditing(false)}
                                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 font-black py-4 rounded-2xl h-auto"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Col */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card rounded-4xl p-8 border border-white/5 bg-white/5 backdrop-blur-md"
                        >
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <Edit3 className="text-indigo-900" /> About Me
                            </h2>
                            {isEditing ? (
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                                    className="w-full bg-[#f4e4bc] border border-white/5 rounded-2xl p-6 text-slate-900 text-lg leading-relaxed focus:border-electric outline-none h-40 font-bold"
                                    placeholder="Tell us your story..."
                                />
                            ) : (
                                <p className="text-slate-900 text-lg leading-relaxed font-bold">
                                    {profile.bio}
                                </p>
                            )}
                        </motion.div>

                        {/* Skills Section */}
                        <div className="glass-card rounded-4xl p-8 border border-white/5 bg-white/5 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                    <Zap className="text-indigo-900" /> Skills & Stack
                                </h2>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {profile.skills.map((skill) => (
                                    <motion.span
                                        layout
                                        key={skill}
                                        className="px-5 py-2.5 bg-slate-950/10 text-slate-900 rounded-2xl text-sm font-black border border-slate-950/10 hover:border-slate-950/30 transition-all cursor-default flex items-center gap-2 group/skill"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <X
                                                size={14}
                                                className="text-slate-500 hover:text-red-400 cursor-pointer"
                                                onClick={() => removeSkill(skill)}
                                            />
                                        )}
                                    </motion.span>
                                ))}
                                {isEditing && (
                                    <input
                                        type="text"
                                        placeholder="+ Add Skill (Enter)"
                                        className="px-5 py-2.5 bg-[#f4e4bc] border border-white/10 rounded-2xl text-sm font-black text-slate-900 outline-none focus:border-electric transition-all w-48 shadow-lg"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                addSkill(e.currentTarget.value);
                                                e.currentTarget.value = "";
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        </div>

                        {/* Stats Dashboard */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard label="Gigs Applied" value={stats.applications.toString()} icon={Briefcase} color="text-emerald-400" />
                            <StatCard label="Client Rating" value="4.9" icon={Sparkles} color="text-amber-400" />
                            <StatCard label="Connections" value={stats.connections.toString()} icon={Users} color="text-electric" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
    return (
        <div className="glass-card rounded-4xl p-7 border border-slate-950/5 bg-slate-950/5 backdrop-blur-sm group hover:bg-slate-950/10 transition-all shadow-xl">
            <div className={`p-4 rounded-2xl bg-slate-950 w-fit mb-5 shadow-2xl ${color}`}>
                <Icon size={24} />
            </div>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{label}</p>
            <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h4>
        </div>
    );
}

import { Button } from '@/components/ui/Button';
