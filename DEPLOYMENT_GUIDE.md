# CampusConnect Production Deployment Guide

This guide outlines the production deployment procedure for CampusConnect on Vercel (Next.js serverless) and Supabase (PostgreSQL + Auth + Storage).

---

## 🏗 Prerequisites
- A **Supabase** account and project.
- A **Vercel** account linked to your code repository.
- A **Razorpay** merchant account for payment processing.
- A **Groq** or **OpenAI** API account for AI features.
- An **Upstash** account for Redis rate limiting.

---

## 🚀 Step 1: Database Setup (Supabase)
1. **Migrations Execution:**
   Run migrations against your production Supabase database:
   ```bash
   npx prisma migrate deploy
   ```
2. **Apply Row-Level Security (RLS) Policies:**
   Apply database-level RLS policies located in [supabase_rls_policies.sql](file:///Users/madhu/Downloads/campusconnectco.in-main/prisma/supabase_rls_policies.sql):
   ```bash
   # Run via Supabase SQL Editor or direct psql connection:
   psql -h aws-0-us-east-1.pooler.supabase.com -U postgres.your-project -d postgres -f prisma/supabase_rls_policies.sql
   ```
3. **Storage Buckets:**
   Create a public bucket named `avatars` on the Supabase Storage Dashboard. Set maximum file upload limit to `2MB` and restrict uploads to images (`image/*`).

---

## 🛠 Step 2: Environment Variables
Configure the following keys in your Vercel Project Dashboard:

```env
# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Database Connection (Transaction Pooler)
DATABASE_URL="postgresql://postgres.your-project:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=4"
DIRECT_URL="postgresql://postgres.your-project:password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# AI Integrations
GROQ_API_KEY="gsk_prod_..."
OPENAI_API_KEY="sk-proj-..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# Payments
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="your-live-secret"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_WEBHOOK_SECRET="your-webhook-secret"

# Internal Security
CRON_SECRET="your-secure-bearer-token"
OPPORTUNITIES_AUTO_KEY="your-api-key"
NEXT_PUBLIC_APP_URL="https://campusconnectco.in"
```

---

## 📦 Step 3: Vercel Deployment
1. Import the repository into Vercel.
2. Select **Next.js** preset.
3. Add the env keys above.
4. Click **Deploy**. Vercel will build the static pages and generate serverless route bundles.
