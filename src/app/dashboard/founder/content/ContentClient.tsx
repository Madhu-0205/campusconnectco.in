"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, Edit3, Trash2, MessageSquare, Layout, CheckCircle,
    X, AlertCircle, Info, Loader2, Save,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";

interface Announcement {
    id: string;
    title: string;
    body: string;
    priority: string;
    isActive: boolean;
    createdAt: string;
}

const EMPTY_FORM = { title: "", body: "", priority: "NORMAL", isActive: true };

export default function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState("announcements");
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => { loadAnnouncements(); }, []);

    const loadAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/founder/announcements");
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setAnnouncements(data.announcements || []);
        } catch {
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setForm(EMPTY_FORM);
        setEditingId(null);
        setShowModal(true);
    };

    const openEdit = (a: Announcement) => {
        setForm({ title: a.title, body: a.body, priority: a.priority, isActive: a.isActive });
        setEditingId(a.id);
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.title || !form.body) {
            toast.error("Title and body are required");
            return;
        }
        setSaving(true);
        try {
            const url = editingId ? `/api/founder/announcements/${editingId}` : "/api/founder/announcements";
            const method = editingId ? "PATCH" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            if (!res.ok) throw new Error("Failed");
            toast.success(editingId ? "Updated!" : "Created!");
            setShowModal(false);
            loadAnnouncements();
        } catch {
            toast.error("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this announcement?")) return;
        try {
            const res = await fetch(`/api/founder/announcements/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed");
            toast.success("Deleted");
            loadAnnouncements();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const handleToggleActive = async (a: Announcement) => {
        try {
            const res = await fetch(`/api/founder/announcements/${a.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: !a.isActive }),
            });
            if (!res.ok) throw new Error("Failed");
            loadAnnouncements();
        } catch {
            toast.error("Failed to toggle");
        }
    };

    const priorityIcon = (p: string) => {
        if (p === "HIGH") return <AlertCircle size={15} className="text-red-500" />;
        if (p === "LOW") return <Info size={15} className="text-blue-400" />;
        return <CheckCircle size={15} className="text-green-500" />;
    };

    const priorityColor = (p: string) => {
        if (p === "HIGH") return "bg-red-500/10 border-red-500/20";
        if (p === "LOW") return "bg-blue-500/10 border-blue-500/20";
        return "bg-green-500/10 border-green-500/20";
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="md:text-4xl font-black text-white tracking-tight">
                        Content <span className="text-orange-500">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Manage platform announcements and homepage content.</p>
                </div>
                <Button onClick={openNew} className="bg-(--primary) hover:bg-blue-600 text-white gap-2">
                    <Plus size={16} /> Create New
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-3">
                {[
                    { id: "announcements", label: "Announcements", icon: MessageSquare },
                    { id: "banners", label: "Notices Board", icon: Layout },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold transition-all ${activeTab === tab.id ? "bg-(--primary) shadow-md" : "bg-[#111116] text-slate-400 border border-white/10 hover:border-(--primary)/40" }`}
                    >
                        <tab.icon size={15} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === "announcements" && (
                <div className="space-y-4">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />
                        ))
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-16 bg-[#111116] rounded-3xl">
                            <MessageSquare size={48} className="mx-auto text-slate-700 mb-3" />
                            <p className="text-slate-500 font-medium">No announcements yet</p>
                            <button onClick={openNew} className="mt-4 px-4 py-2 bg-(--primary) rounded-xl text-sm font-bold">Create First</button>
                        </div>
                    ) : announcements.map((a) => (
                        <motion.div
                            key={a.id}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`p-5 rounded-2xl border bg-[#111116] group hover:shadow-sm transition-all ${priorityColor(a.priority)}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    <div className="mt-0.5 shrink-0">{priorityIcon(a.priority)}</div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-white truncate">{a.title}</h3>
                                            {!a.isActive && (
                                                <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold shrink-0">Inactive</span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 line-clamp-2">{a.body}</p>
                                        <p className="text-slate-400 mt-1">{new Date(a.createdAt).toLocaleDateString()} · Priority: {a.priority}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button onClick={() => handleToggleActive(a)}
                                        className={`p-2 rounded-lg transition-colors font-bold ${a.isActive ? "bg-green-100" : "bg-white/5 text-slate-500 hover:bg-slate-200"}`}
                                        title={a.isActive ? "Deactivate" : "Activate"}>
                                        <CheckCircle size={15} />
                                    </button>
                                    <button onClick={() => openEdit(a)}
                                        className="p-2 hover:bg-blue-500/10 rounded-lg transition-colors">
                                        <Edit3 size={15} className="text-blue-600" />
                                    </button>
                                    <button onClick={() => handleDelete(a.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                                        <Trash2 size={15} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === "banners" && (
                <div className="text-center py-16 bg-[#111116] rounded-3xl">
                    <Layout size={48} className="mx-auto text-slate-700 mb-3" />
                    <p className="text-slate-500 font-medium">Homepage banner management</p>
                    <p className="text-slate-400 mt-1">Banner upload via Supabase Storage — coming soon</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#111116] rounded-3xl shadow-2xl w-full max-w-lg">
                            <div className="p-6 border-white/10 flex justify-between items-center">
                                <h2 className="font-black text-white">
                                    {editingId ? "Edit Announcement" : "New Announcement"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/5 rounded-xl">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="font-black uppercase tracking-wider text-slate-500">Title *</label>
                                    <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Platform Maintenance Tonight" className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40 font-medium" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="font-black uppercase tracking-wider text-slate-500">Body *</label>
                                    <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
                                        rows={4} placeholder="Detailed announcement content..." className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Priority</label>
                                        <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                            className="w-full p-3 bg-white/5 rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40 font-medium">
                                            <option value="LOW">Low</option>
                                            <option value="NORMAL">Normal</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="font-black uppercase tracking-wider text-slate-500">Status</label>
                                        <div className="flex items-center gap-3 h-[46px] px-4 bg-white/5 rounded-xl border border-white/10">
                                            <button onClick={() => setForm({ ...form, isActive: !form.isActive })}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? "bg-green-500" : "bg-slate-300"}`}>
                                                <span className={`${form.isActive ? "translate-x-6" : "translate-x-1"} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                                            </button>
                                            <span className="font-bold text-slate-300">{form.isActive ? "Active" : "Inactive"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button onClick={() => setShowModal(false)} className="px-4 py-2.5 bg-white/5 rounded-xl font-bold text-sm">Cancel</button>
                                    <button onClick={handleSave} disabled={saving}
                                        className="px-4 py-2.5 bg-(--primary) rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-600 transition-colors disabled:opacity-60">
                                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
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
