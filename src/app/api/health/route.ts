import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        await prisma.$queryRaw`SELECT 1`
        return NextResponse.json({ status: "ok", database: "connected" })
    } catch (error) {
        console.error("Database connection failed:", error)
        return NextResponse.json({ status: "error", database: "disconnected", error: String(error) }, { status: 500 })
    }
}
