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
        <div className="fixed inset-0 pointer-events-none z-[-1]">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-900/20 rounded-full blur-[120px]" />
        </div>

        <PWARegister />
        <QueryProvider>
          <AuthProvider>
            <Navigation />
            <main className="container mx-auto px-4 py-6 md:py-12 min-h-screen relative z-10">
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
