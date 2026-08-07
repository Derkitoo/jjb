import type { Metadata, Viewport } from "next";
import "./globals.css";
import { DataProvider } from "@/lib/data-context";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "BJJ Coach",
  description: "Suivi de tes séances de jiu-jitsu brésilien, chrono d'entraînement et diète healthy.",
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <DataProvider>
          <NavBar />
          <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-24 md:pb-10">
            {children}
          </main>
        </DataProvider>
      </body>
    </html>
  );
}
