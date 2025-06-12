import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { PWAInstaller } from "@/components/PWAInstaller";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STELLARUSH - The Ultimate Solana Crash Game",
  description: "Experience the thrill of STELLARUSH - a next-generation crash game built on Solana. Bet, rush, and win with real SOL!",
  keywords: "solana, crash game, blockchain, crypto, gambling, stellarush, provably fair, sol, web3",
  authors: [{ name: "STELLARUSH Team" }],
  creator: "STELLARUSH",
  publisher: "STELLARUSH",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "STELLARUSH",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "STELLARUSH",
    title: "STELLARUSH - The Ultimate Solana Crash Game",
    description: "Experience the thrill of STELLARUSH - a next-generation crash game built on Solana",
    images: [
      {
        url: "/screenshots/desktop.png",
        width: 1280,
        height: 720,
        alt: "STELLARUSH Game Interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "STELLARUSH - The Ultimate Solana Crash Game",
    description: "Experience the thrill of STELLARUSH - a next-generation crash game built on Solana",
    images: ["/screenshots/desktop.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="STELLARUSH" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#f97316" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${geist.variable} ${geistMono.variable} antialiased`}>
        <WalletProvider>
          {children}
          <PWAInstaller />
        </WalletProvider>
      </body>
    </html>
  );
}
