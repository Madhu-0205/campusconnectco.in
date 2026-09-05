import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : "standalone",

  typescript: {
    ignoreBuildErrors: false,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "framer-motion", "@react-three/drei", "@react-three/fiber"],
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

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
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

import { withSentryConfig } from '@sentry/nextjs';

export default withSentryConfig(withAnalyzer(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "campusconnect",
  project: "campusconnect",
  
  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: "/monitoring",

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  // disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  // automaticVercelMonitors: true,
});
