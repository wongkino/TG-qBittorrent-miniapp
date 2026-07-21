import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  },
  async redirects() {
    return [
      { source: "/webapp", destination: "/", permanent: true },
      { source: "/webapp/", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
