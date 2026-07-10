import prisma from '@/lib/prisma';

import { computeUserEmbedding, findTopN, Candidate } from './embeddings';

export async function rankStudentsForUser(queryUserId: string) {
    const queryUser = await prisma.user.findUnique({ where: { id: queryUserId } });
    if (!queryUser) throw new Error("Query user not found");

    const queryVector = await computeUserEmbedding(queryUserId);

    // Fetch all other users
    const users = await prisma.user.findMany({
        where: { id: { not: queryUserId }, role: "STUDENT" }
    });

    const userEmbeddings = await (prisma as any).userEmbedding.findMany({
        where: { userId: { in: users.map((u: any) => u.id) } }
    });

    const userEmbMap = new Map();
    userEmbeddings.forEach((ue: any) => userEmbMap.set(ue.userId, ue.vector));

    const candidates: Candidate[] = users.map((u: any) => ({
        ...u,
        id: u.id,
        vector: userEmbMap.get(u.id) as number[]
    })).filter((u: any) => u.vector);

    const boostFn = (student: Candidate): number => {
        let boost = 0;
        // +0.20 -> same college
        if (student.college && queryUser.college && student.college === queryUser.college) boost += 0.20;
        
        // Simplified boosts
        // +0.10 -> both show available (using isVerified or basic proxy since available is not standard here)
        if (student.isVerified && queryUser.isVerified) boost += 0.10;

        return boost;
    };

    return findTopN(queryVector, candidates, 10, boostFn);
}
