import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mockInternships } from "@/lib/mock-data";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // 1. Try Prisma first for real data
    if (id.length > 10) { // Likely a UUID
      const internship = await prisma.internship.findUnique({
        where: { id }
      });
      if (internship) return NextResponse.json(internship);
    }

    // 2. Fallback to Mock Data
    const mock = mockInternships.find(i => i.id === id);
    if (mock) return NextResponse.json(mock);

    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
