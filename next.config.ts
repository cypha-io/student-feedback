import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix workspace root warning for Turbopack (updated syntax)
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'olagshs.edu.gh',
        pathname: '/**',
      },
    ],
  },
  
  // Ensure environment variables are properly loaded
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
};

export default nextConfig;
