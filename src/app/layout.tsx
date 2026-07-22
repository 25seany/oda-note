import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import { getLocale } from "@/lib/i18n/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://snapgrade.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Snapgrade — Snap your mistake, get it fixed in seconds",
  description:
    "Snap a photo of any handwritten problem. Snapgrade grades it instantly, explains the mistake, and builds your personal wrong-answer notebook.",
  openGraph: {
    title: "Snapgrade — Snap your mistake, get it fixed in seconds",
    description:
      "Point your camera at any handwritten problem and get graded, explained, and organized into a notebook automatically.",
    url: SITE_URL,
    siteName: "Snapgrade",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Snapgrade — Snap your mistake, get it fixed in seconds",
    description: "Instant AI grading for handwritten problems. Free to try, no sign-up.",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#18181b",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
