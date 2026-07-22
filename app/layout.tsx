import type { Metadata, Viewport } from "next";
import { SafeAreaBootScript } from "@/components/SafeAreaBootScript";
import { ThemeBootScript } from "@/components/ThemeBootScript";
import "./globals.css";

export const metadata: Metadata = {
  title: "qBittorrent",
  description: "Personal qBittorrent remote for web and iOS home screen",
  applicationName: "qBittorrent",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "qBittorrent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant" suppressHydrationWarning data-theme="dark">
      <head>
        <ThemeBootScript />
        <SafeAreaBootScript />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
