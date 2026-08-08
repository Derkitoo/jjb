"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/", label: "Accueil", icon: "🏠" },
  { href: "/sessions", label: "Séances", icon: "🥋" },
  { href: "/gameplan", label: "Gameplan", icon: "♟️" },
  { href: "/timer", label: "Chrono", icon: "⏱️" },
  { href: "/diet", label: "Diète", icon: "🥗" },
  { href: "/settings", label: "Réglages", icon: "⚙️" },
] as const;

export default function NavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Barre du haut (desktop >= 1024px) */}
      <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-accent">火</span>
          <span>BJJ Coach</span>
        </Link>
        <nav className="flex items-center gap-1">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-white"
                    : "text-muted hover:text-foreground hover:bg-surface-2"
                }`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Barre du bas (mobile & foldables < 1024px) : Floating Glassmorphic Dock */}
      <nav className="lg:hidden fixed bottom-2 inset-x-2 sm:inset-x-6 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="bg-surface/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/90 p-1.5">
          <ul className="grid grid-cols-6 items-center">
            {ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`relative flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl text-[10px] font-bold transition-all duration-200 active:scale-95 ${
                      active
                        ? "bg-accent/15 text-accent border border-accent/30 shadow-[0_0_12px_rgba(225,29,72,0.3)] font-black"
                        : "text-muted hover:text-foreground hover:bg-surface-2/60"
                    }`}
                  >
                    <span className={`text-base leading-none transition-transform duration-200 ${active ? "scale-110" : ""}`}>
                      {item.icon}
                    </span>
                    <span className="truncate max-w-full tracking-tight">{item.label}</span>
                    {active && (
                      <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_6px_#e11d48]" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
