import dynamic from"next/dynamic";
import { notFound } from"next/navigation";

import { prisma } from"@/lib/prisma";

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

 let data = null;
 
 try {
 data = await prisma.internship.findUnique({
 where: { id }
 });
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
