"use client"

import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, MessageSquare, Check, X } from "lucide-react"

const applicants = [
    { id: 1, name: "Alice Zhang", gig: "React Native Developer for MVP", experience: "2 years", rating: 4.8, status: "NEW" },
    { id: 2, name: "David Kim", gig: "React Native Developer for MVP", experience: "1.5 years", rating: 4.9, status: "INTERVIEWED" },
    { id: 3, name: "Maria Garcia", gig: "UI/UX Design for Fintech App", experience: "3 years", rating: 5.0, status: "NEW" },
]

import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function ClientApplicantsPage() {
    const router = useRouter()

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold text-slate-900">Applicants</h2>
                <p className="text-slate-500">Review and hire students for your gigs.</p>
            </div>

            <div className="grid gap-6">
                {applicants.map((applicant) => (
                    <Card key={applicant.id} className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-lg text-slate-900">{applicant.name}</h3>
                                        {applicant.status === 'NEW' && (
                                            <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">New</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-slate-500">Applying for: <span className="text-primary font-medium">{applicant.gig}</span></p>
                                    <p className="text-xs text-slate-400 mt-1">{applicant.experience} exp • {applicant.rating}★ rating</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                        toast.info(`Opening chat with ${applicant.name}...`)
                                        router.push("/messages")
                                    }}
                                >
                                    <MessageSquare size={16} /> Chat
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => toast.error(`Application from ${applicant.name} declined.`)}
                                >
                                    <X size={16} /> Decline
                                </Button>
                                <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => toast.success(`Successfully hired ${applicant.name}!`)}
                                >
                                    <Check size={16} /> Hire Now
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
