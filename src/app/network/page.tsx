"use client";

import {
    Search,
    MapPin,
    GraduationCap,
    Filter,
    UserPlus,
    Check,
    X,
} from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { useState, useMemo } from "react";
import { useToast } from "@/components/ToastProvider";

const users = [
    { id: 1, name: "Alice Zhang", role: "Computer Science", year: "Senior", university: "Stanford", bio: "Looking for hackathon teammates! Full stack developer.", tags: ["React", "Node.js", "AI"] },
    { id: 2, name: "Marcus Johnson", role: "Business Admin", year: "Junior", university: "UPenn", bio: "Building a fintech startup. Need a technical co-founder.", tags: ["Finance", "Marketing", "Strategy"] },
    { id: 3, name: "Priya Patel", role: "UX Design", year: "Sophomore", university: "RISD", bio: "Portfolio building. Open to freelance design gigs.", tags: ["Figma", "Prototyping", "User Research"] },
    { id: 4, name: "David Kim", role: "Data Science", year: "Masters", university: "Berkeley", bio: "Deep learning enthusiast. Exploring NLP applications.", tags: ["Python", "PyTorch", "SQL"] },
    { id: 5, name: "Emma Wilson", role: "Psychology", year: "Senior", university: "Yale", bio: "Researching HCI. Interested in usability testing.", tags: ["Research", "Statistics", "Writing"] },
    { id: 6, name: "James Lee", role: "Electrical Eng", year: "Junior", university: "MIT", bio: "Hardware hacking and embedded systems.", tags: ["C++", "Arduino", "Robotics"] },
];

export default function Network() {
    const { addToast } = useToast();

    const [connected, setConnected] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [university, setUniversity] = useState("All");
    const [showFilters, setShowFilters] = useState(false);

    const toggleConnect = (id: number, name: string) => {
        if (connected.includes(id)) {
            setConnected(prev => prev.filter(c => c !== id));
        } else {
            setConnected(prev => [...prev, id]);
            addToast(`Connection request sent to ${name}`, "success");
        }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const query = search.toLowerCase();
            const matchSearch =
                user.name.toLowerCase().includes(query) ||
                user.university.toLowerCase().includes(query) ||
                user.tags.join(" ").toLowerCase().includes(query);

            const matchUni =
                university === "All" || user.university === university;

            return matchSearch && matchUni;
        });
    }, [search, university]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <FadeIn>
                <div className="mb-8 text-center pt-8">
                    <h1 className="text-4xl font-heading font-bold text-white mb-3">
                        Discover Your Network
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Connect with ambitious students, co-founders, and collaborators across campuses.
                    </p>
                </div>
            </FadeIn>

            {/* Search + Filters */}
            <FadeIn delay={0.1}>
                <div className="glass-card rounded-xl p-4 mb-8 flex flex-col gap-4">

                    <div className="flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={20}
                            />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, university, or skill..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-electric/50"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white hover:bg-slate-700 transition flex items-center gap-2"
                            >
                                <Filter size={18} />
                                Filters
                            </button>
                        </div>
                    </div>

                    {/* Expandable Filter Panel */}
                    {showFilters && (
                        <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-700/50">
                            <select
                                value={university}
                                onChange={(e) => setUniversity(e.target.value)}
                                className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white cursor-pointer"
                            >
                                <option value="All">All Universities</option>
                                <option>MIT</option>
                                <option>Stanford</option>
                                <option>Berkeley</option>
                                <option>UPenn</option>
                                <option>RISD</option>
                                <option>Yale</option>
                            </select>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setUniversity("All");
                                }}
                                className="flex items-center gap-1 px-4 py-2 bg-slate-700 rounded-lg text-white hover:bg-slate-600 transition"
                            >
                                <X size={14} />
                                Reset
                            </button>
                        </div>
                    )}
                </div>
            </FadeIn>

            {/* User Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user, i) => (
                    <FadeIn key={user.id} delay={0.1 + i * 0.05}>
                        <div className="glass-card rounded-xl p-6 hover:border-electric/30 transition-all duration-300 group h-full flex flex-col">

                            <div className="flex justify-between items-start mb-4">
                                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 group-hover:border-electric transition" />

                                <button
                                    onClick={() => toggleConnect(user.id, user.name)}
                                    className={`p-2 rounded-full transition ${connected.includes(user.id)
                                        ? "bg-green-500 text-white"
                                        : "bg-slate-800 text-electric hover:bg-electric hover:text-white"
                                        }`}
                                >
                                    {connected.includes(user.id) ? <Check size={20} /> : <UserPlus size={20} />}
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-electric transition">
                                {user.name}
                            </h3>
                            <p className="text-electric text-sm font-medium mb-3">
                                {user.role}
                            </p>

                            <div className="space-y-2 text-sm text-gray-400 mb-4 flex-1">
                                <div className="flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    <span>{user.university} • {user.year}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={16} />
                                    <span className="truncate">{user.bio}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto">
                                {user.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-slate-800 text-gray-300 border border-slate-700"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    No matching profiles found.
                </div>
            )}
        </div>
    );
}
