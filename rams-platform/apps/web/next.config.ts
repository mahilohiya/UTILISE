import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@rams/database"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
