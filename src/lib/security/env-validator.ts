import { z } from "zod";

const PublicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, "NEXT_PUBLIC_SUPABASE_ANON_KEY must be a valid token"),
  NEXT_PUBLIC_APP_URL: z.string().url("NEXT_PUBLIC_APP_URL must be a valid URL"),
});

const ServerEnvSchema = PublicEnvSchema.extend({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid connection string"),
  DIRECT_URL: z.string().url("DIRECT_URL must be a valid connection string"),
  CRON_SECRET: z.string().min(5, "CRON_SECRET must be set"),
  RAZORPAY_KEY_ID: z.string().min(5, "RAZORPAY_KEY_ID must be set"),
  RAZORPAY_KEY_SECRET: z.string().min(5, "RAZORPAY_KEY_SECRET must be set"),
  GROQ_API_KEY: z.string().min(5, "GROQ_API_KEY must be set"),
});

export function validateEnv(isEdge = false) {
  // Skip environment validation during Next.js production build or test runs to prevent CI/build crashes
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.ANALYZE === "true" ||
    process.env.NODE_ENV === "test"
  ) {
    return;
  }

  const schema = isEdge ? PublicEnvSchema : ServerEnvSchema;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    console.error(`❌ CRITICAL: Missing or invalid environment variables at startup (${isEdge ? "Edge" : "Server"}):`);
    console.error(JSON.stringify(errors, null, 2));
    throw new Error(`CRITICAL: Failed to validate environment variables at startup (${isEdge ? "Edge" : "Server"}).`);
  }
}
