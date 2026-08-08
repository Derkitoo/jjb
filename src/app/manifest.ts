import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BJJ Coach - Suivi & Chrono JJB",
    short_name: "BJJ Coach",
    description: "Application de suivi d'entraînements de Jiu-Jitsu Brésilien, chrono de rounds et diète.",
    start_url: "/jjb/",
    scope: "/jjb/",
    display: "standalone",
    background_color: "#0b0d12",
    theme_color: "#0b0d12",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/jjb/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/jjb/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
