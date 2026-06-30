import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
    try {
        const apiKey = request.headers.get("x-internal-key");

        if (!process.env.OPPORTUNITIES_AUTO_KEY || apiKey !== process.env.OPPORTUNITIES_AUTO_KEY) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        const {
            title,
            description,
            company,
            skills,
            stipend,
            duration,
            location,
            deadline,
            applicationLink,
            tags,
        } = body;

        // DUPLICATE CHECK
        const existing = await prisma.internship.findFirst({
            where: {
                title,
                company,
            },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                duplicate: true,
                internship: existing,
            });
        }

        const internship = await prisma.internship.create({
            data: {
                title,
                description,
                company,
                skills: skills || null,
                stipend: stipend || null,
                duration: duration || null,
                location: location || null,
                applicationLink: applicationLink || null,
                deadline: deadline ? new Date(deadline) : null,
                tags: tags || null,
                status: "OPEN",
                isFeatured: false,
            },
        });

        return NextResponse.json({
            success: true,
            internship,
        });

    } catch (error) {
        console.error("[IMPORT_INTERNSHIP FULL ERROR]", error);

        return NextResponse.json(
            {
                success: false,
                error: String(error),
                details: error instanceof Error ? error.message : "Unknown error"
            },
            { status: 500 }
        );
    }
}