"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"

export default function RedirectToGetGigs() {
    const { status } = useSession()

    useEffect(() => {
        if (status === "unauthenticated") {
            redirect("/auth/signin")
        } else if (status === "authenticated") {
            redirect("/dashboard/student/gigs")
        }
    }, [status])

    return null
}
