import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import prisma from "@/lib/prisma"

export default async function StudentDashboardRedirect() {
    const supabase = await createClient()
    const {
        data: { user },
        error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
        redirect("/auth/signin")
    }

    const profile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
    })

    const role = profile?.role || "STUDENT"

    if (role === "CLIENT") redirect("/dashboard/client")
    if (role === "FOUNDER") redirect("/dashboard/founder")

    redirect("/get-gig")   // ✅ FINAL DESTINATION
}
