import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings/site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  let metadataBase: URL | undefined;

  if (settings.siteUrl) {
    try {
      metadataBase = new URL(settings.siteUrl);
    } catch {
      metadataBase = undefined;
    }
  }

  return {
    metadataBase,
    title: {
      default: settings.seoDefaultTitle || settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    description:
      settings.seoDefaultDescription ||
      settings.siteDescription ||
      undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
