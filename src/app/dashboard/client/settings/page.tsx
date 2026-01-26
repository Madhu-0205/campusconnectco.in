"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, Bell, Building, Globe } from "lucide-react"

export default function ClientSettingsPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Client Settings</h2>
                <p className="text-slate-500">Manage your business profile and preferences.</p>
            </div>

            <div className="grid gap-6">
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <Building size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Company Information</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Company Name</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="StartupX" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Website URL</label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="https://startupx.io" />
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                            <User size={20} />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">Primary Contact</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Contact Person</label>
                            <input type="text" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="John Client" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700">Business Email</label>
                            <input type="email" className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50" defaultValue="admin@startupx.io" disabled />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button variant="outline">Discard Changes</Button>
                    <Button>Save Settings</Button>
                </div>
            </div>
        </div>
    )
}
