import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import { AdminProvider } from "@/lib/admin-context";
import { TimerProvider } from "@/lib/timer-context";
import NavBar from "@/components/NavBar";
import TimerBanner from "@/components/TimerBanner";
import PwaRegister from "@/components/PwaRegister";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BJJ Coach - Suivi & Chrono JJB",
  description: "Suivi de tes séances de jiu-jitsu brésilien, chrono d'entraînement et diète healthy.",
  manifest: "/jjb/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "BJJ Coach",
  },
  applicationName: "BJJ Coach",
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`h-full antialiased ${outfit.variable}`}>
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground selection:bg-accent/30 selection:text-accent">
        <PwaRegister />
        <DataProvider>
          <AdminProvider>
            <TimerProvider>
              <NavBar />
              <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-10">
                {children}
              </main>
              <TimerBanner />
            </TimerProvider>
          </AdminProvider>
        </DataProvider>
      </body>
    </html>
  );
}

