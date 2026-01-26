"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function RedirectToInternships() {
    const { status } = useSession()

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/auth/signin")
        } else if (status === "authenticated") {
            redirect("/dashboard/student/internships")
        }
    }, [status])

    return null
}
