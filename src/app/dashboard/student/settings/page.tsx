"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, Bell, Shield, Palette, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [initialData, setInitialData] = useState({
        name: "",
        email: "",
        emailNotifications: true,
        desktopAlerts: false
    })
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        emailNotifications: true,
        desktopAlerts: false
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch("/api/user/profile")
                if (!res.ok) throw new Error("Failed to fetch settings")
                const data = await res.json()
                const profileData = {
                    name: data.name || "John Doe",
                    email: data.email || "john@university.edu",
                    emailNotifications: true,
                    desktopAlerts: false
                }
                setInitialData(profileData)
                setFormData(profileData)
            } catch (error) {
                toast.error("Error loading settings")
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch("/api/user/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email
                })
            })

            if (!res.ok) throw new Error("Failed to save preferences")

            setInitialData(formData)
            toast.success("Preferences saved successfully!")
        } catch (error) {
            toast.error("Failed to save preferences")
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const handleDiscard = () => {
        setFormData(initialData)
        toast.info("Changes discarded")
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-primary" size={32} />
            </div>
        )
    }

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialData)

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="w-8 h-1 bg-primary rounded-full" />
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">Preferences</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Account Settings</h2>
                <p className="text-slate-500 font-medium">Manage your professional identity and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-8 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-blue-100/50 text-blue-600 rounded-2xl">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 tracking-tight">Profile Identity</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Publicly visible information</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Display Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900"
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm font-black text-slate-700 uppercase tracking-widest">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-slate-900"
                                placeholder="your@email.com"
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-8 border-none bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-purple-100/50 text-purple-600 rounded-2xl">
                            <Bell size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-slate-800 tracking-tight">Notification Channels</h3>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">How we reach you</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                                <p className="font-bold text-slate-900">Email Notifications</p>
                                <p className="text-sm text-slate-500 font-medium">Receive alerts about new gigs and messages via email.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.emailNotifications}
                                    onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors">
                            <div className="space-y-1">
                                <p className="font-bold text-slate-900">Desktop Alerts</p>
                                <p className="text-sm text-slate-500 font-medium">Show browser notifications for real-time dashboard updates.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.desktopAlerts}
                                    onChange={(e) => setFormData({ ...formData, desktopAlerts: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            </label>
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        className="h-14 px-8 rounded-2xl font-bold border-2"
                        onClick={handleDiscard}
                        disabled={!hasChanges || saving}
                    >
                        Discard Changes
                    </Button>
                    <Button
                        className="h-14 px-8 rounded-2xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : "Save Preferences"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
