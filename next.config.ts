import type { NextConfig } from "next";
import { networkInterfaces } from "node:os";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

/** LAN IPv4 hosts so phones/other PCs can hit `next dev` without origin blocks. */
function lanDevOrigins(): string[] {
  const hosts = new Set<string>();
  for (const nets of Object.values(networkInterfaces())) {
    for (const net of nets ?? []) {
      if (net.internal) continue;
      // Node may report family as "IPv4" or numeric 4 depending on version.
      const family = String(net.family);
      if (family !== "IPv4" && family !== "4") continue;
      hosts.add(net.address);
    }
  }
  return [...hosts];
}

const nextConfig: NextConfig = {
  // Next 16 blocks cross-origin `/_next/*` + HMR unless listed here.
  allowedDevOrigins: lanDevOrigins(),
  env: {
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
