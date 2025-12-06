import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/AuthProvider";
import { QueryProvider } from "@/components/QueryProvider";
import { APP_CONFIG } from "@/lib/appConfig";
import RoomieStatusFAB from "@/components/RoomieStatusFAB";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `Vibra Alta | Depto 3 (${APP_CONFIG.appVersion})`,
  description: "Gestión de departamento y convivencia - Vibra Alta",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Roomie App",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import PWARegister from "@/components/PWARegister";
import NoiseTexture from "@/components/ui/NoiseTexture";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased bg-background text-foreground relative overflow-x-hidden`}
      >
        {/* Ambient Background Glow */}
        {/* Premium Ambient Background */}
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
          {/* Deep Base Gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a0a12] to-[#110c1d]" />

          {/* Neon Glow Orbs */}
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-pink-600/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute top-[40%] left-[50%] translate-x-[-50%] w-[40%] h-[40%] bg-cyan-600/5 rounded-full blur-[120px]" />

          <NoiseTexture />
        </div>

        <PWARegister />
        <QueryProvider>
          <AuthProvider>
            <Navigation />
            <main className="container mx-auto px-4 py-8 pt-28 md:pt-32 min-h-screen relative z-10">
              {children}
            </main>
            <Toaster position="top-center" theme="dark" />
            <RoomieStatusFAB />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
