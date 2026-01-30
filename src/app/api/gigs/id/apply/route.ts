import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { createClient } from "@/lib/supabase/server"

export async function POST(
    _: Request,
    { params }: { params: { id: string } }
) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const application = await prisma.application.create({
        data: {
            gigId: params.id,
            applicantId: user.id,   // ✅ correct field
            status: "PENDING"
        }
    })

    return NextResponse.json(application)
}
