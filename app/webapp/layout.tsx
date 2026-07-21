import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "qBittorrent",
  description: "Personal qBittorrent remote for iOS home screen",
  applicationName: "qBittorrent",
  manifest: "/webapp/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "qBittorrent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/webapp/icon.svg",
    apple: "/webapp/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function WebAppLayout({ children }: { children: ReactNode }) {
  return children;
}
