import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../hooks/useAuth";
import MobileNav from "../components/MobileNav";
import InstallPWA from "../components/InstallPWA";
import NotificationPrompt from "../components/NotificationPrompt";
import OfflineIndicator from "../components/OfflineIndicator";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "NomadNotes - Travel Smarter, Work Anywhere",
  description: "Empowering the modern explorer with tools to travel further, work smarter, and live freely.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NomadNotes",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "NomadNotes",
    title: "NomadNotes - Travel Smarter, Work Anywhere",
    description: "Empowering the modern explorer with tools to travel further, work smarter, and live freely.",
  },
  twitter: {
    card: "summary",
    title: "NomadNotes - Travel Smarter, Work Anywhere",
    description: "Empowering the modern explorer with tools to travel further, work smarter, and live freely.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="application-name" content="NomadNotes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NomadNotes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#059467" />
        
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="32x32" href="/icons/icon-192x192.svg" />
        <link rel="icon" type="image/svg+xml" sizes="16x16" href="/icons/icon-192x192.svg" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/icons/icon-192x192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <MobileNav />
          <InstallPWA />
          <NotificationPrompt />
          <OfflineIndicator />
        </AuthProvider>
        <Script
          src="https://upload-widget.cloudinary.com/global/all.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
