import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Only the Supabase project (REST, auth, realtime websocket) is reachable from
// the browser besides our own origin.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "";
const supabaseSocket = supabaseOrigin.replace(/^https/, "wss");

// "Without nonces" CSP (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md):
// a nonce would force every page, including the cached landing page, to render
// dynamically. Inline scripts are needed by Next.js itself; everything else is
// locked to our own origin.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${supabaseOrigin} ${supabaseSocket}${isDev ? " ws://localhost:* http://localhost:*" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
]
  .join("; ")
  .replace(/\s{2,}/g, " ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Uploaded profile images are served from the Supabase Storage public bucket.
    remotePatterns: supabaseOrigin
      ? [{ protocol: "https", hostname: new URL(supabaseOrigin).hostname, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
