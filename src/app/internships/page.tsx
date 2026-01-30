"use client"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useEffect } from "react"

export default function RedirectToInternships() {
    const supabase = createClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                redirect("/auth/signin")
            } else {
                redirect("/dashboard/student/internships")
            }
        }

        checkAuth()
    }, [supabase])

    return null
}
