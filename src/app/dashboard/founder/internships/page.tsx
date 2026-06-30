"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    GraduationCap, Plus, Search, Star, StarOff, CheckCircle, XCircle,
    Trash2, Edit3, Calendar, MapPin, DollarSign, Clock, Building2,
    Loader2, X, Save, ExternalLink,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Internship {
    id: string;
    title: string;
    description: string;
    company: string;
    skills: string | null;
    stipend: number | null;
    duration: string | null;
    location: string | null;
    tags: string | null;
    applicationLink: string | null;
    deadline: string | null;
    status: string;
    isFeatured: boolean;
    views: number;
    applyCount: number;
    createdAt: string;
}

const EMPTY_FORM = {
    title: "",
    description: "",
    company: "",
    skills: "",
    stipend: "",
    duration: "",
    location: "",
    deadline: "",
    status: "OPEN",
    isFeatured: false,
    applicationLink: "",
    tags: "",
};

export default function InternshipManagementPage() {
    const [internships, setInternships] = useState<Internship[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [stats, setStats] = useState({ total: 0, open: 0, pending: 0, featured: 0 });
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadInternships(); }, []);

    const loadInternships = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/founder/internships");
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setInternships(data.internships || []);
            setStats(data.stats || { total: 0, open: 0, pending: 0, featured: 0 });
        } catch {
            toast.error("Failed to load internships");
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (internship: Internship) => {
        setForm({
            title: internship.title,
            description: internship.description,
            company: internship.company,
            skills: internship.skills || "",
            stipend: internship.stipend?.toString() || "",
            duration: internship.duration || "",
            location: internship.location || "",
            deadline: internship.deadline ? internship.deadline.slice(0, 10) : "",
            status: internship.status,
            isFeatured: internship.isFeatured,
             
            applicationLink: (internship as any).applicationLink || "",
             
            tags: (internship as any).tags || "",
        });
        setEditingId(internship.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.company || !form.description) {
            toast.error("Title, company and description are required");
            return;
        }
        setSaving(true);
        try {
            const url = editingId ? `/api/founder/internships/${editingId}` : "/api/founder/internships";
            const method = editingId ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(editingId ? "Internship updated!" : "Internship created!");
            setShowModal(false);
            loadInternships();
        } catch {
            toast.error("Failed to save internship");
        } finally {
            setSaving(false);
        }
    };

    const handleAction = async (id: string, action: string) => {
        try {
            const res = await fetch(`/api/founder/internships/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action }),
            });
            if (!res.ok) throw new Error("Failed");
            const labels: Record<string, string> = {
                approve: "Approved!", reject: "Rejected", feature: "Featured status toggled",
            };
            toast.success(labels[action] || "Done");
            loadInternships();
        } catch {
            toast.error("Action failed");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Soft-delete this internship? It will be marked DELETED.")) return;
        try {
            const res = await fetch(`/api/founder/internships/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            toast.success("Internship deleted");
            loadInternships();
        } catch {
            toast.error("Delete failed");
        }
    };

    const filtered = internships.filter((i) => {
        if (i.status === "DELETED") return false;
        const matchSearch = i.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            i.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === "all" || i.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const statusColor = (s: string) => {
        if (s === "OPEN") return "bg-green-500/20 text-green-400";
        if (s === "PENDING") return "bg-amber-500/20 text-amber-400";
        return "bg-red-500/20 text-red-400";
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="md:text-4xl font-black text-white tracking-tight">
                        Internship <span className="text-orange-500">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Post, edit, approve & feature internship listings.</p>
                </div>
                <button
                    onClick={openNew}
                    className="px-5 py-2.5 bg-(--primary) rounded-xl font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-colors shadow-lg shadow-(--primary)/20"
                >
                    <Plus size={16} /> New Internship
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total", value: stats.total, color: "bg-blue-500/10 text-blue-400" },
                    { label: "Open", value: stats.open, color: "bg-green-500/10 text-green-400" },
                    { label: "Pending", value: stats.pending, color: "bg-amber-500/10 text-amber-400" },
                    { label: "Featured", value: stats.featured, color: "bg-purple-500/10 text-purple-400" },
                ].map((s) => (
                    <div key={s.label} className="bg-[#111116] rounded-2xl p-5 shadow-sm border-none">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                            <GraduationCap size={20} />
                        </div>
                        <p className="font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
                        <p className="font-black text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-[#111116] rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by title or company..."
                        className="w-full pl-11 pr-4 py-3 bg-white/5 rounded-xl outline-none focus:ring-2 focus:ring-(--primary)/40 text-sm"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-white/5 rounded-xl outline-none focus:ring-2 focus:ring-(--primary)/40 text-sm font-medium"
                >
                    <option value="all">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="PENDING">Pending</option>
                    <option value="CLOSED">Closed</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-[#111116] rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-white/5/60 border-white/10">
                            <tr>
                                {["Internship", "Company", "Stipend", "Deadline", "Status", "Actions"].map((h) => (
                                    <th key={h} className="px-6 py-4 font-black text-slate-500 uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {loading ? (
                                [...Array(4)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        {Array(6).fill(null).map((_, j) => (
                                            <td key={j} className="px-6 py-4"><div className="h-5 bg-white/5 rounded" /></td>
                                        ))}
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-16 text-center">
                                    <GraduationCap size={48} className="mx-auto text-slate-700 mb-3" />
                                    <p className="text-slate-500 font-medium">No internships found</p>
                                </td></tr>
                            ) : filtered.map((internship) => (
                                <motion.tr
                                    key={internship.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div>
                                                <p className="font-bold text-white line-clamp-1">{internship.title}</p>
                                                <p className="text-slate-500 line-clamp-1">{internship.skills || "No skills listed"}</p>
                                            </div>
                                            {internship.isFeatured && (
                                                <span className="shrink-0 px-2 py-0.5 bg-amber-100 rounded-full text-[10px] font-black">⭐ Featured</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-300">
                                            <Building2 size={14} className="text-slate-400" />
                                            {internship.company}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-orange-500">
                                            {internship.stipend ? `₹${internship.stipend.toLocaleString()}/mo` : "Unpaid"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {internship.deadline ? (
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Calendar size={13} />
                                                {new Date(internship.deadline).toLocaleDateString()}
                                            </div>
                                        ) : <span className="text-slate-400">No deadline</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-black ${statusColor(internship.status)}`}>
                                            {internship.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1">
                                            {internship.status === "PENDING" && (
                                                <>
                                                    <button onClick={() => handleAction(internship.id, "approve")} title="Approve"
                                                        className="p-2 hover:bg-green-500/20 rounded-lg transition-colors">
                                                        <CheckCircle size={16} className="text-green-600" />
                                                    </button>
                                                    <button onClick={() => handleAction(internship.id, "reject")} title="Reject"
                                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                                        <XCircle size={16} className="text-red-600" />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleAction(internship.id, "feature")} title="Toggle Feature"
                                                className="p-2 hover:bg-amber-500/20 rounded-lg transition-colors">
                                                {internship.isFeatured
                                                    ? <StarOff size={16} className="text-amber-500" />
                                                    : <Star size={16} className="text-slate-400" />}
                                            </button>
                                            <button onClick={() => openEdit(internship)} title="Edit"
                                                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors">
                                                <Edit3 size={16} className="text-blue-600" />
                                            </button>
                                            <button onClick={() => handleDelete(internship.id)} title="Delete"
                                                className="p-2 hover:bg-red-500/20 rounded-lg transition-colors">
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111116] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-white/10 flex justify-between items-center sticky top-0 bg-[#111116] rounded-t-3xl z-10">
                                <h2 className="font-black text-white">
                                    {editingId ? "Edit Internship" : "New Internship"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Title *</label>
                                        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="Frontend Developer Intern" className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40 font-medium" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Company *</label>
                                        <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                                            placeholder="Acme Corp" className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Location</label>
                                        <div className="relative">
                                            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                                                placeholder="Remote / Bangalore" className="w-full pl-9 pr-3 py-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Description *</label>
                                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            rows={4} placeholder="Describe responsibilities, requirements..." className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40 resize-none" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Skills (comma-separated)</label>
                                        <input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })}
                                            placeholder="React, TypeScript, Node.js" className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Duration</label>
                                        <div className="relative">
                                            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                                placeholder="3 months" className="w-full pl-9 pr-3 py-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Monthly Stipend (₹)</label>
                                        <div className="relative">
                                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input type="number" value={form.stipend} onChange={(e) => setForm({ ...form, stipend: e.target.value })}
                                                placeholder="10000" className="w-full pl-9 pr-3 py-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Application Deadline</label>
                                        <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                                            className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Status</label>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                                            className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40">
                                            <option value="OPEN">Open</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                        <button
                                            onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isFeatured ? 'bg-amber-500' : 'bg-slate-300'}`}
                                        >
                                            <span className={`${form.isFeatured ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                                        </button>
                                        <span className="font-bold text-slate-300">Mark as Featured</span>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Tags (work mode)</label>
                                        <div className="flex gap-2 flex-wrap">
                                            {["Remote", "Hybrid", "Onsite"].map((t) => {
                                                 
                                                const selected = (form as any).tags?.includes(t);
                                                return (
                                                    <button key={t} type="button"
                                                        onClick={() => {
                                                             
                                                            const current = ((form as any).tags || "").split(",").map((x: string) => x.trim()).filter(Boolean);
                                                            const next = selected ? current.filter((x: string) => x !== t) : [...current, t];
                                                             
                                                            setForm({ ...form, tags: next.join(",") } as any);
                                                        }}
                                                        className={`px-4 py-2 rounded-xl font-bold border transition-all ${selected ? "bg-(--primary)/10" : "bg-white/5 border-white/10 text-slate-500" }`}
                                                    >{t}</button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <ExternalLink size={12} /> Official Application Link
                                        </label>
                                        <input type="url" value={form.applicationLink || ""}
                                            onChange={(e) => setForm({ ...form, applicationLink: e.target.value })}
                                            placeholder="https://company.com/apply" className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                                        <p className="text-slate-400">Students will be redirected here when they click Apply. Leave blank to collect interest through the platform.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white/5 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                                        Cancel
                                    </button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="px-5 py-2.5 bg-(--primary) rounded-xl font-bold text-sm flex items-center gap-2 hover:brightness-110 transition-colors disabled:opacity-60">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {saving ? "Saving..." : editingId ? "Update" : "Create"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
