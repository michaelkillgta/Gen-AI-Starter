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
  // Allowed image qualities (Next 16 needs the list): 75 default, 85 for screenshots with text.
  // Images live in web/public, or on the media host (MEDIA_URL, e.g. a Cloudflare R2
  // bucket at https://media.your-domain.in) once they are moved off GitHub.
  images: {
    qualities: [75, 85],
    remotePatterns: process.env.MEDIA_URL ? [new URL(`${process.env.MEDIA_URL.replace(/\/$/, "")}/**`)] : [],
  },
  // The screen tests build into their own folder, so a test run never overwrites
  // the files (and CSS) a running `next dev` is serving from .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // No floating "N" dev badge; it gets in the way of design reviews.
  devIndicators: false,
  // The production Docker image runs the self-contained server (web/Dockerfile).
  output: process.env.BUILD_STANDALONE === "1" ? "standalone" : undefined,
  // The web app is its own project (the repo root's package.json is only dev tooling),
  // so server.js lands at the top of .next/standalone.
  // process.cwd(), not __dirname: Next always runs from web/, and __dirname is undefined
  // when the config is compiled as ESM (the fallback compiler does that).
  outputFileTracingRoot: path.resolve(process.cwd()),
  // Track addresses from before the two-track plan (Sept 2026).
  async redirects() {
    return [
      { source: "/tracks/foundations", destination: "/tracks/ai-ml", permanent: true },
      { source: "/tracks/agents-that-dont-break", destination: "/tracks/gen-ai", permanent: true },
      { source: "/tracks/rag-and-documents", destination: "/tracks/gen-ai", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // The admin area is private: never index it, never cache it.
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      { source: "/admin", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};

export default nextConfig;
