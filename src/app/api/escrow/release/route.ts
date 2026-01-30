import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const { escrowId } = await req.json()

    const escrow = await prisma.escrow.update({
        where: { id: escrowId },
        data: { status: "RELEASED" }
    })

    return NextResponse.json(escrow)
}
