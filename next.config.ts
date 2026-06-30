import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  typescript: {
    ignoreBuildErrors: false,
  },

  // Keep heavy native modules out of the Next.js bundle so they run as plain
  // Node.js requires (avoids pdf-parse test-fixture crash and mammoth issues).
  serverExternalPackages: ["pdf-parse", "mammoth", "groq-sdk"],

  // Turbopack config (Next.js 16 default bundler)
  turbopack: {
    resolveAlias: {
      // Stub out the broken pdf-parse internal test helper path
      "./test/helper": { browser: "./test/helper", default: "./test/helper" },
    },
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.supabase.in" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    formats: ["image/webp"],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  outputFileTracingIncludes: {
    "/**/*": [
      "./node_modules/.prisma/client/**/*",
      "./node_modules/@prisma/engines/**/*",
    ],
  },

  webpack(config: import("webpack").Configuration) {
    // pdf-parse ships a test helper that breaks in webpack bundled envs.
    // Since pdf-parse + mammoth + groq-sdk are in serverExternalPackages,
    // webpack never actually bundles them — this is a belt-and-suspenders guard.
    if (config.resolve) {
      config.resolve.alias = {
        ...(config.resolve.alias as Record<string, string>),
      };
    }
    return config;
  },
};

export default nextConfig;
