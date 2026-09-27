import path from "node:path";

import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // No floating "N" dev badge; it gets in the way of design reviews.
  devIndicators: false,
  // The production Docker image runs the self-contained server (web/Dockerfile).
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  // The web app is its own project (the repo root's package.json is only dev tooling),
  // so server.js lands at the top of .next/standalone.
  outputFileTracingRoot: path.join(__dirname),
  // Track addresses from before the two-track plan (Sept 2026).
  async redirects() {
    return [
      { source: "/tracks/foundations", destination: "/tracks/ai-ml", permanent: true },
      { source: "/tracks/agents-that-dont-break", destination: "/tracks/gen-ai", permanent: true },
      { source: "/tracks/rag-and-documents", destination: "/tracks/gen-ai", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
