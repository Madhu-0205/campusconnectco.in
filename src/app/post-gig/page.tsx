"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RedirectToPostGig() {
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!session) {
                    router.replace("/auth/sign-in");
                    return;
                }

                router.replace("/client-hub/post-gig");
            } catch (error) {
                console.error("Session Check Error:", error);
                router.replace("/auth/sign-in");
            }
        
        };

        checkSession();
    }, [router, supabase]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <p>Redirecting...</p>
        </div>
    );
}