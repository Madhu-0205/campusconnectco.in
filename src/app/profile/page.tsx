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
    Sparkles,
    Zap,
    Users,
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
        coverImage: "",
    });

    const [stats, setStats] = useState({
        applications: 0,
        connections: 0,
    });

    /* ===============================
       3D TILT
    =============================== */
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(useSpring(y), [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(useSpring(x), [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX / rect.width - 0.5);
        y.set(e.clientY / rect.height - 0.5);
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
                    skills: data.skills ? data.skills.split(",") : [],
                    image: data.image ?? "",
                    coverImage: data.coverImage ?? "",
                    status: data.status ?? "Available for Gigs",
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

            toast.success("Profile updated");
            setIsEditing(false);
        } catch {
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
        setProfile({
            ...profile,
            skills: profile.skills.filter((s) => s !== skill),
        });
    };

    /* ===============================
       LOADING
    =============================== */
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-electric" />
            </div>
        );
    }

    /* ===============================
       UI
    =============================== */
    return (
        <div className="min-h-screen bg-[#faf3e0] py-12">
            <div className="max-w-7xl mx-auto px-4 pb-20 relative">
                {/* Cover */}
                <div className="relative h-64 rounded-3xl overflow-hidden mb-8">
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: profile.coverImage
                                ? `url(${profile.coverImage})`
                                : "linear-gradient(to right,#0f172a,#312e81)",
                        }}
                    />
                </div>

                <div className="grid lg:grid-cols-12 gap-8 -mt-24">
                    {/* PROFILE CARD */}
                    <div className="lg:col-span-4">
                        <motion.div
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="glass-card rounded-3xl p-8 bg-slate-900/60 backdrop-blur-xl"
                        >
                            <div className="text-center mb-6">
                                <div className="h-36 w-36 mx-auto rounded-3xl bg-[#f4e4bc] flex items-center justify-center text-5xl font-black">
                                    {profile.name[0]}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditing ? (
                                    <motion.div className="space-y-4">
                                        <input
                                            value={profile.name}
                                            onChange={(e) =>
                                                setProfile({ ...profile, name: e.target.value })
                                            }
                                            className="w-full bg-[#f4e4bc] rounded-xl px-4 py-3 font-black text-center"
                                        />
                                        <input
                                            value={profile.role}
                                            onChange={(e) =>
                                                setProfile({ ...profile, role: e.target.value })
                                            }
                                            className="w-full bg-[#f4e4bc] rounded-xl px-4 py-2 font-bold text-center"
                                        />
                                    </motion.div>
                                ) : (
                                    <>
                                        <h1 className="text-3xl font-black text-slate-100">
                                            {profile.name}
                                        </h1>
                                        <p className="text-xs uppercase tracking-widest mt-2 text-slate-300">
                                            {profile.role}
                                        </p>
                                    </>
                                )}
                            </AnimatePresence>

                            <div className="mt-6 flex gap-4">
                                <Button
                                    onClick={() =>
                                        isEditing ? handleSave() : setIsEditing(true)
                                    }
                                    disabled={saving}
                                    className="flex-1"
                                >
                                    {isEditing ? (saving ? "Saving..." : "Save") : "Edit Profile"}
                                </Button>

                                {isEditing && (
                                    <Button variant="glass" onClick={() => setIsEditing(false)}>
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* CONTENT */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* ABOUT */}
                        <div className="glass-card p-8 rounded-3xl">
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                                <Edit3 size={18} /> About Me
                            </h2>
                            {isEditing ? (
                                <textarea
                                    value={profile.bio}
                                    onChange={(e) =>
                                        setProfile({ ...profile, bio: e.target.value })
                                    }
                                    className="w-full h-32 bg-[#f4e4bc] rounded-xl p-4 font-bold"
                                />
                            ) : (
                                <p className="font-bold">{profile.bio}</p>
                            )}
                        </div>

                        {/* SKILLS */}
                        <div className="glass-card p-8 rounded-3xl">
                            <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                                <Zap size={18} /> Skills
                            </h2>
                            <div className="flex flex-wrap gap-3">
                                {profile.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="px-4 py-2 rounded-xl bg-slate-900/10 font-black flex items-center gap-2"
                                    >
                                        {skill}
                                        {isEditing && (
                                            <X
                                                size={14}
                                                className="cursor-pointer"
                                                onClick={() => removeSkill(skill)}
                                            />
                                        )}
                                    </span>
                                ))}
                                {isEditing && (
                                    <input
                                        placeholder="+ Add skill"
                                        className="px-4 py-2 rounded-xl bg-[#f4e4bc] font-black"
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

                        {/* STATS */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <StatCard
                                label="Gigs Applied"
                                value={stats.applications}
                                icon={Briefcase}
                            />
                            <StatCard label="Rating" value="4.9" icon={Sparkles} />
                            <StatCard
                                label="Connections"
                                value={stats.connections}
                                icon={Users}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ===============================
   STAT CARD
================================ */
function StatCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number | string;
    icon: any;
}) {
    return (
        <div className="glass-card p-6 rounded-3xl text-center">
            <Icon className="mx-auto mb-3" />
            <p className="text-xs uppercase tracking-widest font-black text-slate-500">
                {label}
            </p>
            <h4 className="text-3xl font-black">{value}</h4>
        </div>
    );
}
