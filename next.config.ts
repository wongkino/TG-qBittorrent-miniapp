import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  // Expose GOOGLE_CLIENT_ID to the browser without a duplicate env var.
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
