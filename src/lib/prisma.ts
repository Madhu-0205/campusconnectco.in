import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClient;
};

function assertDatabaseUrl(value?: string): string {
    if (!value) {
        throw new Error("Missing DATABASE_URL. Set DATABASE_URL in your environment.");
    }

    try {
        const parsed = new URL(value);
        if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
            throw new Error("DATABASE_URL must start with postgres:// or postgresql://");
        }
        return value;
    } catch (err) {
        throw new Error("Invalid DATABASE_URL format. Ensure the value is a valid PostgreSQL connection string.");
    }
}

function getPrismaDatabaseUrl(): string {
    const rawUrl = assertDatabaseUrl(process.env.DATABASE_URL);
    const connectionLimit = Math.min(Math.max(parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10), 1), 100);
    const poolTimeout = Math.min(Math.max(parseInt(process.env.DB_POOL_TIMEOUT || "30", 10), 1), 120);
    const connectTimeout = Math.min(Math.max(parseInt(process.env.DB_CONNECT_TIMEOUT || "10", 10), 1), 60);
    const keepAlive = Math.min(Math.max(parseInt(process.env.DB_KEEP_ALIVE || "30", 10), 1), 120);

    const url = new URL(rawUrl);
    if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", String(connectionLimit));
    }
    if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", String(poolTimeout));
    }
    if (!url.searchParams.has("connect_timeout")) {
        url.searchParams.set("connect_timeout", String(connectTimeout));
    }
    if (!url.searchParams.has("keepalive")) {
        url.searchParams.set("keepalive", String(keepAlive));
    }

    return url.toString();
}

export async function withRetry<T>(
    fn: () => Promise<T>,
    retries = 3,
    initialDelayMs = 200
): Promise<T> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            return await fn();
        } catch (err: unknown) {
            const errorObj = err as Record<string, unknown>;
            const msg = typeof errorObj?.message === "string" ? errorObj.message : "";
            const code = typeof errorObj?.code === "string" ? errorObj.code : "";
            const isTransient =
                msg.includes("Connection reset") ||
                msg.includes("Connection reset by peer") ||
                msg.includes("timeout") ||
                code === "P1001" ||
                code === "P1017" ||
                code === "P1018" ||
                code === "P1020" ||
                code === "P1021" ||
                code === "P1022";

            if (isTransient && attempt < retries) {
                const backoff = Math.min(2000, initialDelayMs * 2 ** (attempt - 1));
                if (process.env.NODE_ENV !== "production") {
                    console.warn(`[Prisma] Transient query error. Retry ${attempt}/${retries} after ${backoff}ms:`, msg || code);
                }
                await new Promise((resolve) => setTimeout(resolve, backoff));
                continue;
            }
            throw err;
        }
    }
    throw new Error("withRetry: all attempts exhausted");
}

function createPrismaClient() {
    const url = getPrismaDatabaseUrl();

    const client = new PrismaClient({
        log: [
            { emit: "event", level: "query" },
            { emit: "event", level: "warn" },
            { emit: "event", level: "error" },
        ],
        datasources: {
            db: {
                url,
            },
        },
    });

    client.$on("query", (event) => {
        if (event.duration > 200) {
            console.warn(`[Prisma] Slow query detected (${event.duration}ms): ${event.query}`);
        }
    });

    client.$on("warn", (event) => {
        console.warn("[Prisma] Warning:", event.message);
    });

    client.$on("error", (event) => {
        console.error("[Prisma] Client error:", event.message);
    });

    const extendedClient = client.$extends({
        query: {
            $allOperations({ args, query }) {
                return withRetry(() => query(args), 3, 200);
            },
        },
    }) as PrismaClient;

    return extendedClient;
}

function setupPrismaShutdown(client: PrismaClient) {
    if (typeof process === "undefined" || process.env.PRISMA_SHUTDOWN_INSTALLED === "true") {
        return;
    }

    const gracefulDisconnect = async () => {
        try {
            await client.$disconnect();
        } catch {
            // ignore errors during shutdown
        }
    };

    process.on("SIGINT", async () => {
        await gracefulDisconnect();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        await gracefulDisconnect();
        process.exit(0);
    });

    process.on("beforeExit", async () => {
        await gracefulDisconnect();
    });

    process.on("exit", () => {
        client.$disconnect().catch(() => {
            // ignore.
        });
    });

    process.env.PRISMA_SHUTDOWN_INSTALLED = "true";
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
setupPrismaShutdown(prisma);
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

export default prisma;
