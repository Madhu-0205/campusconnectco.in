"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, Bell, Shield, Palette } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
                <p className="text-slate-500">Manage your account and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <User size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Profile Settings</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Display Name</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="John Doe" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Email Address</label>
                            <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" defaultValue="john@university.edu" disabled />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Notifications</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Email Notifications</p>
                                <p className="text-xs text-slate-500">Receive alerts about new gigs and messages.</p>
                            </div>
                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Desktop Alerts</p>
                                <p className="text-xs text-slate-500">Show browser notifications for real-time updates.</p>
                            </div>
                            <input type="checkbox" className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline">Discard Changes</Button>
                    <Button>Save Preferences</Button>
                </div>
            </div>
        </div>
    )
}
