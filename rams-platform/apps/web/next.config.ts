import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal .next/standalone folder with only the files needed
  // to run in production (no full node_modules) - required for the
  // multi-stage Dockerfile to produce a small image.
  output: "standalone",
  transpilePackages: ["@rams/database"],
  // argon2 is a native Node addon (compiled C++ binding) that internally
  // uses node:-prefixed core module imports. Webpack can't bundle those by
  // default ("UnhandledSchemeError: Reading from node:crypto"), and there's
  // no reason to bundle a native addon anyway - this tells Next.js to leave
  // it as a real Node `require()` at runtime instead of trying to bundle it.
  serverExternalPackages: ["argon2", "pdf-parse"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
