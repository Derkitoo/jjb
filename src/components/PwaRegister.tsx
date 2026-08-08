"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("SW enregistré:", reg.scope);
          })
          .catch((err) => {
            console.warn("Échec d'enregistrement du SW:", err);
          });
      });
    }
  }, []);

  return null;
}
