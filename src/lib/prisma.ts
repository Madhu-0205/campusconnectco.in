import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: any;
};

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    delayMs = 200,
    clientInstance?: any
): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const errorObj = err as Record<string, unknown>;
            const msg = typeof errorObj?.message === 'string' ? errorObj.message : '';
            const code = typeof errorObj?.code === 'string' ? errorObj.code : '';
            const isConnectionReset =
                msg.includes("10054") ||
                msg.includes("ConnectionReset") ||
                msg.includes("Connection reset") ||
                code === "P1001" ||
                code === "P1017";

            if (isConnectionReset && attempt < retries) {
                console.warn(`[Prisma] Connection reset. Retrying (${attempt}/${retries})...`);
                await new Promise((r) => setTimeout(r, delayMs * attempt));

                // Disconnect and reconnect on connection errors
                try {
                    const activeClient = clientInstance || prisma;
                    await activeClient.$disconnect();
                    await activeClient.$connect();
                } catch {
                    // ignore reconnect errors — Prisma will reconnect lazily
                }
                continue;
            }
            throw err;
        }
    }
    throw new Error("withRetry: all attempts exhausted");
}

function createPrismaClient() {
    let url = process.env.DATABASE_URL || "";
    if (url) {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set("connection_limit", "5");
            urlObj.searchParams.set("pool_timeout", "40");
            url = urlObj.toString();
        } catch {
            url = url + (url.includes('?') ? '&' : '?') + "connection_limit=5&pool_timeout=40";
        }
    }
    const client = new PrismaClient({
        log: ["error"],
        datasources: {
            db: {
                url,
            },
        },
    });

    return client.$extends({
        query: {
            $allOperations({ model, operation, args, query }) {
                return withRetry(() => query(args), 3, 200, client);
            }
        }
    });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
