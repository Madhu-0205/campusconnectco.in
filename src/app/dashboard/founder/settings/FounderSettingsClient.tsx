"use client"

import { motion } from "framer-motion"
import { Info, Save, DollarSign, Bell, Shield, Palette, Globe, Trash2, Plus, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/Button"

interface Settings {
    platformName: string;
    supportEmail: string;
    maintenanceMode: string;
    studentFee: string;
    clientFee: string;
    escrowEnabled: string;
    aiEnabled: string;
    emailNotifications: string;
    commissionEnterprise: string;
    commissionStandard: string;
    commissionMicro: string;
    categories?: string;
    escrowDisputeRules: string;
    moderationStringency: string;
}

export default function PlatformSettingsPage() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("general")
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [categories, setCategories] = useState<string[]>([])
    const [newCategory, setNewCategory] = useState("")
    const [settings, setSettings] = useState<Settings>({
        platformName: "Campus Connect",
        supportEmail: "support@campusconnectco.in",
        maintenanceMode: "false",
        studentFee: "5",
        clientFee: "10",
        escrowEnabled: "true",
        aiEnabled: "true",
        emailNotifications: "true",
        commissionEnterprise: "10",
        commissionStandard: "8.5",
        commissionMicro: "7",
        escrowDisputeRules: "Standard 7-day arbitration",
        moderationStringency: "Strict (AI + Auto-Flag)",
    })

    useEffect(() => { loadSettings(); }, [])

    const loadSettings = async () => {
        setFetching(true)
        try {
            const res = await fetch("/api/founder/settings")
            if (!res.ok) throw new Error("Failed")
            const data = await res.json()
            const s = data.settings as Settings
            setSettings(s)
            setCategories(s.categories ? JSON.parse(s.categories) : ["Web Development", "Graphic Design", "Content Writing", "Digital Marketing", "Video Editing"])
        } catch {
            toast.error("Failed to load settings")
        } finally {
            setFetching(false)
        }
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const payload = { ...settings, categories: JSON.stringify(categories) }
            const res = await fetch("/api/founder/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ settings: payload }),
            })
            if (!res.ok) throw new Error("Failed")
            toast.success("Platform settings saved to database!")
        } catch {
            toast.error("Failed to save settings")
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteAccount = async () => {
        const confirmation = window.prompt("To permanently delete your founder account, type 'DELETE' below:")
        if (confirmation !== "DELETE") {
            if (confirmation !== null) toast.error("Account deletion cancelled.")
            return
        }

        try {
            const res = await fetch("/api/user/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ confirmation: "DELETE" })
            })

            if (!res.ok) throw new Error("Failed to delete account")
            
            toast.success("Founder account permanently deleted.")
            router.push("/")
        } catch (error) {
            toast.error("Failed to delete account")
            console.error(error)
        }
    }

    const toggle = (key: keyof Settings) => {
        setSettings(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }))
    }

    const isEnabled = (key: keyof Settings) => settings[key] === "true"

    const renderContent = () => {
        switch (activeTab) {
            case "general":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="font-bold text-slate-300">Platform Name</label>
                                <input type="text" value={settings.platformName}
                                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                    className="w-full p-3 bg-(--surface-2) rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                            </div>
                            <div className="space-y-2">
                                <label className="font-bold text-slate-300">Support Email</label>
                                <input type="email" value={settings.supportEmail}
                                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                    className="w-full p-3 bg-(--surface-2) rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40" />
                            </div>
                        </div>
                        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                            <Info className="text-amber-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-amber-400">Maintenance Mode</h4>
                                <p className="text-amber-500 mb-3">
                                    Enables a maintenance banner for non-admin users. Platform remains accessible.
                                </p>
                                <ToggleButton enabled={isEnabled("maintenanceMode")} onToggle={() => toggle("maintenanceMode")} color="amber" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <label className="font-bold text-slate-300">Escrow Dispute Rules</label>
                                <select value={settings.escrowDisputeRules} onChange={(e) => setSettings({ ...settings, escrowDisputeRules: e.target.value })}
                                    className="w-full p-3 bg-(--surface-2) rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40">
                                    <option value="Standard 7-day arbitration">Standard 7-day arbitration</option>
                                    <option value="Fast-track 3-day resolution">Fast-track 3-day resolution</option>
                                    <option value="Strict refund only (Client favors)">Strict refund only (Client favors)</option>
                                    <option value="Founder Manual Over-ride">Founder Manual Over-ride</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="font-bold text-slate-300">Moderation Stringency</label>
                                <select value={settings.moderationStringency} onChange={(e) => setSettings({ ...settings, moderationStringency: e.target.value })}
                                    className="w-full p-3 bg-(--surface-2) rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40">
                                    <option value="Low (Post immediately)">Low (Post immediately)</option>
                                    <option value="Medium (AI Flagging)">Medium (AI Flagging)</option>
                                    <option value="Strict (AI + Auto-Flag)">Strict (AI + Auto-Flag)</option>
                                    <option value="Maximum (100% Manual Review)">Maximum (100% Manual Review)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )
            case "fees":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-4 bg-blue-500/10 rounded-xl mb-2">
                            <h3 className="font-bold text-blue-400 mb-1">Commission Configuration</h3>
                            <p className="text-blue-400">Applied to all Escrow transactions. Changes take effect immediately.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { key: "studentFee" as const, label: "Student Fee %", desc: "Deducted from student earnings" },
                                { key: "clientFee" as const, label: "Client Markup %", desc: "Added to client invoice" },
                                { key: "commissionEnterprise" as const, label: "Enterprise Rate %", desc: "High-value gigs (>₹50k)" },
                                { key: "commissionStandard" as const, label: "Standard Rate %", desc: "Regular gigs" },
                            ].map((f) => (
                                <div key={f.key} className="p-5 bg-(--surface-2) rounded-2xl border border-white/10">
                                    <p className="font-bold text-slate-300 mb-1">{f.label}</p>
                                    <p className="text-slate-500 mb-4">{f.desc}</p>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={settings[f.key]}
                                            onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
                                            className="w-20 font-black bg-transparent outline-none border-slate-300 focus:border-(--primary) text-white" />
                                        <span className="font-bold text-slate-400">%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            case "categories":
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-4 bg-purple-500/10 rounded-xl">
                            <h3 className="font-bold text-purple-400 mb-1">Gig Categories</h3>
                            <p className="text-purple-400">These appear in the gig posting form for all users.</p>
                        </div>
                        <div className="flex gap-3">
                            <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && newCategory.trim()) { setCategories([...categories, newCategory.trim()]); setNewCategory(""); } }}
                                placeholder="New category name..." className="flex-1 p-3 bg-(--surface-2) rounded-xl border border-white/10 outline-none focus:ring-2 focus:ring-(--primary)/40 text-sm" />
                            <button onClick={() => { if (newCategory.trim()) { setCategories([...categories, newCategory.trim()]); setNewCategory(""); } }}
                                className="px-4 py-3 bg-(--primary) rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-600 transition-colors">
                                <Plus size={16} /> Add
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {categories.map((cat, i) => (
                                <motion.div key={i} layout
                                    className="flex items-center justify-between p-3 bg-(--surface-2) border border-white/10 rounded-xl group">
                                    <span className="font-medium text-sm">{cat}</span>
                                    <button onClick={() => setCategories(categories.filter((_, idx) => idx !== i))}
                                        className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1">
                                        <Trash2 size={15} />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )
            case "features":
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        {[
                            { key: "escrowEnabled" as const, label: "Escrow System", desc: "Secure payment holding for all gig transactions.", icon: Shield },
                            { key: "aiEnabled" as const, label: "AI Service Agent", desc: "Automated support chatbot for platform queries.", icon: Globe },
                            { key: "emailNotifications" as const, label: "Email Notifications", desc: "Send transactional emails on key events.", icon: Bell },
                        ].map((f) => (
                            <div key={f.key} className="flex items-center justify-between p-4 bg-(--surface-2)/50 rounded-xl border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${isEnabled(f.key) ? "bg-(--primary)/10" : "bg-slate-200 text-slate-500"}`}>
                                        <f.icon size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white">{f.label}</h4>
                                        <p className="text-slate-500">{f.desc}</p>
                                    </div>
                                </div>
                                <ToggleButton enabled={isEnabled(f.key)} onToggle={() => toggle(f.key)} color="blue" />
                            </div>
                        ))}
                    </div>
                )
            case "danger":
                return (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between gap-6">
                            <div>
                                <h3 className="font-bold text-red-500 tracking-tight text-xl mb-1">Delete Founder Account</h3>
                                <p className="text-red-400/80 font-medium max-w-lg text-sm">
                                    Permanently delete your founder account and all associated platform data. This action is irreversible.
                                </p>
                            </div>
                            <Button 
                                variant="destructive" 
                                className="h-12 px-6 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shrink-0"
                                onClick={handleDeleteAccount}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </div>
                )
            default:
                return null
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="md:text-4xl font-black text-white tracking-tight">
                        Platform <span className="text-(--primary)">Settings</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-1">Configure global parameters, fees, and feature flags. Saved to database.</p>
                </div>
                <Button onClick={handleSave} disabled={loading || fetching}
                    className="bg-(--primary) hover:bg-blue-600 text-white gap-2">
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save All</>}
                </Button>
            </div>

            {fetching ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-(--primary)" />
                </div>
            ) : (
                <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                    {/* Nav */}
                    <nav className="w-full md:w-56 space-y-1.5">
                        {[
                            { id: "general", icon: Palette, label: "General" },
                            { id: "fees", icon: DollarSign, label: "Fees & Commission" },
                            { id: "categories", icon: Globe, label: "Categories" },
                            { id: "features", icon: Shield, label: "Feature Flags" },
                            { id: "danger", icon: Trash2, label: "Danger Zone" },
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === tab.id ? "bg-(--primary) text-white shadow-lg shadow-(--primary)/20" : "text-slate-400 hover:bg-white/5"}`}>
                                <tab.icon size={16} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>

                    {/* Content */}
                    <div className="flex-1 bg-(--surface) rounded-3xl p-4 md:p-8 shadow-sm border border-white/5">
                        {renderContent()}
                    </div>
                </div>
            )}
        </div>
    )
}

function ToggleButton({ enabled, onToggle, color }: { enabled: boolean; onToggle: () => void; color: string }) {
    return (
        <button onClick={onToggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${enabled ? (color === "amber" ? "bg-(--accent)" : "bg-(--primary)") : "bg-white/10"}`}>
            <span className={`${enabled ? "translate-x-6" : "translate-x-1"} inline-block h-5 w-5 transform rounded-full bg-white transition duration-200`} />
        </button>
    )
}
