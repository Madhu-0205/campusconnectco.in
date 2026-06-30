import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const internship = await prisma.internship.findUnique({
      where: { id }
    });
    
    if (internship) return NextResponse.json(internship);

    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
