"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export default function RedirectToPostGig() {
    const [isChecking, setIsChecking] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                redirect("/auth/signin")
            } else {
                redirect("/dashboard/client/post-gig")
            }
        }

        checkAuth()
    }, [supabase])

    return null
}
