import { redirect } from "next/navigation";

import { protectPage } from "@/lib/auth-checks";
import prisma from "@/lib/prisma";

import AIInsightsClient from "./AIInsightsClient";

export default async function AIInsightsPage() {
    const { authorized } = await protectPage(["FOUNDER"]);

    if (!authorized) {
        redirect("/dashboard");
    }

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [gigs, apps, escrows] = await Promise.all([
        prisma.gig.findMany({ select: { createdAt: true, title: true, status: true }, orderBy: { createdAt: "desc" }, take: 100 }),
        prisma.application.count({ where: { createdAt: { gte: lastMonth } } }),
        prisma.escrow.findMany({ select: { createdAt: true, amount: true, status: true }, take: 100, orderBy: { createdAt: "desc" } })
    ]);

    return <AIInsightsClient stats={{ gigs, apps, escrows }} />;
}
