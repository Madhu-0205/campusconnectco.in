import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "lh3.googleusercontent.com" },
      { hostname: "ui-avatars.com" },
      { hostname: "images.unsplash.com" }
    ]
  },
};

export default nextConfig;
