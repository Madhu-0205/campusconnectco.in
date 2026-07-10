import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Validate UUID format to prevent DB casting crashes
    if (!z.string().uuid().safeParse(id).success) {
      return NextResponse.json({ error: "Invalid internship ID format" }, { status: 400 });
    }

    const internship = await prisma.internship.findUnique({
      where: { id }
    });
    
    if (internship) return NextResponse.json(internship);

    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
