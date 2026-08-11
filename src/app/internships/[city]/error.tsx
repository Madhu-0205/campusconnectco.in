"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/Button";


export default function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-2">
                <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
            <p className="text-muted-foreground max-w-125">
                We encountered an error while trying to load internships. Please try again or return to the marketplace.
            </p>
            <div className="flex items-center gap-4 mt-4">
                <Button onClick={() => reset()} size="lg" variant="default">Try again</Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="/marketplace">Back to Marketplace</Link>
                </Button>
            </div>
        </div>
    );
}
