"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        const swPath = window.location.pathname.includes("/jjb")
          ? "/jjb/sw.js"
          : "./sw.js";
        navigator.serviceWorker
          .register(swPath)
          .then((reg) => {
            console.log("SW enregistré avec succès sur scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("Échec d'enregistrement du SW:", err);
          });
      });
    }
  }, []);

  return null;
}
