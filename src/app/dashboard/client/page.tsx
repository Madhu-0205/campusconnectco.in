"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { PlusCircle, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ClientDashboard() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">Client Dashboard</h2>
                    <p className="text-slate-500">Manage your gigs and hire talent.</p>
                </div>
                <Link href="/dashboard/client/post-gig">
                    <Button> <PlusCircle className="mr-2 h-4 w-4" /> Post New Gig</Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                            <Briefcase className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Active Gigs</p>
                            <h3 className="text-2xl font-bold">3</h3>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                            <Users className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">New Applicants</p>
                            <h3 className="text-2xl font-bold">12</h3>
                        </div>
                    </div>
                </Card>
                <Card>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Completed Jobs</p>
                            <h3 className="text-2xl font-bold">8</h3>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Active Gigs List */}
            <h3 className="font-bold text-xl mt-8">Your Active Gigs</h3>
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="flex justify-between items-center p-6">
                        <div>
                            <h4 className="font-bold text-lg">React Native Developer for MVP</h4>
                            <p className="text-sm text-slate-500">Posted 2 days ago • 5 Applicants</p>
                        </div>
                        <Button variant="outline" size="sm">Manage</Button>
                    </Card>
                ))}
            </div>
        </div>
    )
}

function Briefcase(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            <rect width="20" height="14" x="2" y="6" rx="2" />
        </svg>
    )
}
