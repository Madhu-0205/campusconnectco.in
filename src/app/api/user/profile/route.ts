import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, bio, skills, university, year, location, status, github, image, coverImage } = body;

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name,
                bio,
                skills: Array.isArray(skills) ? skills.join(',') : skills,
                image,
                coverImage,
            } as any
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Profile Update Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                coverImage: true,
                bio: true,
                skills: true,
                role: true,
                _count: {
                    select: {
                        applications: true,
                        conversations: true,
                    }
                }
            } as any
        }) as any;

        return NextResponse.json(user);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
