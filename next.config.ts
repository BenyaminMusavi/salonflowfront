import type { NextConfig } from "next";

/**
 * Derived from NEXT_PUBLIC_API_DOMAIN rather than hardcoded: no production API host is
 * decided yet (BACKEND_UPDATE_REPORT.md §5), so a fixed hostname here would work today
 * and silently break on the next environment. A wide-open "**" hostname was the previous
 * default — Next's image optimizer fetches server-side, so an unrestricted remote pattern
 * lets the app be told to proxy-fetch an arbitrary attacker-supplied URL.
 *
 * If uploaded media (salon cover/profile/gallery) is ever served from a separate storage
 * host (e.g. a CDN or blob storage domain distinct from the API), add that hostname here
 * too once it's known.
 */
function resolveApiHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_DOMAIN;
  if (!raw) return null;
  try {
    return new URL(raw).hostname;
  } catch {
    return null;
  }
}

const apiHostname = resolveApiHostname();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: apiHostname
      ? [
          { protocol: "https", hostname: apiHostname },
          { protocol: "http", hostname: apiHostname },
        ]
      : [],
  },
};

export default nextConfig;
