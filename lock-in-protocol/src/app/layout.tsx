import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/lib/auth/auth-context"
import { NotificationProvider } from "@/hooks/use-notifications"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { QueryProvider } from "@/lib/query-client"
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Lock-In Protocol',
    default: 'Lock-In Protocol - Personal Productivity System',
  },
  description: 'A comprehensive personal productivity webapp for tracking schedule adherence, workouts, nutrition, milestones, and analytics.',
  keywords: [
    'productivity',
    'schedule tracking',
    'workout tracker',
    'nutrition logging',
    'goal setting',
    'time blocking',
    'pomodoro technique',
    'habit tracking',
  ],
  authors: [
    {
      name: "Chiranjeet",
    },
  ],
  creator: "Chiranjeet",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    title: "Lock-In Protocol",
    description: "Personal productivity tracking system",
    siteName: "Lock-In Protocol",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lock-In Protocol",
    description: "Personal productivity tracking system",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='90' font-size='80'>🎯</text></svg>",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          defaultTheme="system"
          storageKey="lock-in-theme"
        >
          <QueryProvider>
            <AuthProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
              <Toaster richColors position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
