import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";
import { mockInternships } from "@/lib/mock-data";

const InternshipDetailsClient = dynamic(
  () => import("@/components/internships/InternshipDetailsClient"), 
  { ssr: true }
);

export default async function InternshipPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  // 1. Direct Prisma DB Query for fastest execution (no HTTP overhead)
  let data = null;
  
  try {
    if (id && id.length > 10) { // UUID check
      data = await prisma.internship.findUnique({
        where: { id }
      });
    }

    // 2. Fallback to mock data if not in DB
    if (!data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data = mockInternships.find((i: any) => i.id === id) || null;
    }
  } catch (error) {
    console.error("Failed to fetch internship:", error);
    // Let the error boundary handle database outages
    throw new Error("Failed to load internship data");
  }

  // 3. Render 404 cleanly
  if (!data) {
    return notFound();
  }

  return <InternshipDetailsClient internship={data} />;
}
