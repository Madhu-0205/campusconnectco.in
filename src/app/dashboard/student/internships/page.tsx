import { prisma } from "@/lib/prisma";

import InternshipsClient from "./InternshipsClient";

export default async function Page() {
    // 1. Concurrent fetching logic as per 🔧 STEP 7
    const [all, trending, recommended] = await Promise.all([
        prisma.internship.findMany({ 
            take: 30, 
            orderBy: { createdAt: 'desc' },
            where: { status: 'OPEN' }
        }),
        prisma.internship.findMany({ 
            where: { status: 'OPEN' }, 
            take: 6,
            orderBy: { views: 'desc' }
        }),
        prisma.internship.findMany({ 
            where: { isFeatured: true, status: 'OPEN' }, 
            take: 6 
        })
    ]);
    
    // 2. Serialize Prisma dates to ISO strings for Client Component compatibility
    const serialize = (items: { deadline?: Date | null; createdAt: Date; updatedAt: Date; [key: string]: unknown }[]) => items.map(i => ({
        ...i,
        deadline: i.deadline?.toISOString() || null,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
    }));

    return (
        <InternshipsClient 
             
            initialInternships={serialize(all) as any} 
             
            initialTrending={serialize(trending) as any} 
             
            initialRecommended={serialize(recommended) as any} 
        />
    );
}
