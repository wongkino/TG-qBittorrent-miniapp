import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { THEME_BOOT_SCRIPT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "qBittorrent",
  description: "Personal qBittorrent remote for Telegram and iOS home screen",
  applicationName: "qBittorrent",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "qBittorrent",
  },
  formatDetection: {
    telephone: false,
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
      <body suppressHydrationWarning>
        <Script
          id="theme-boot"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }}
        />
        {children}
      </body>
    </html>
  );
}
