import { Briefcase, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

export default function GigNotFound() {
    return (
        <div className="min-h-screen bg-white/2 dark:bg-slate-950 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mx-auto w-20 h-20 bg-white/5 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                    <Briefcase size={40} className="text-slate-400 dark:text-slate-600" />
                </div>

                <h1 className="font-black text-slate-900 dark:text-white mb-3">
                    Gig Not Found
                </h1>

                <p className="text-slate-600 dark:text-slate-400 mb-8">
                    The gig you&apos;re looking for doesn&apos;t exist or has been removed.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/get-gig">
                        <Button className="w-full sm:w-auto">
                            <Search size={18} className="mr-2" />
                            Browse All Gigs
                        </Button>
                    </Link>
                    <Link href="/dashboard/student">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ArrowLeft size={18} className="mr-2" />
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
