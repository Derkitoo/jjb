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
      {/* Barre du haut (desktop) */}
      <header className="hidden md:flex items-center justify-between px-6 py-4 border-b border-border bg-surface/60 backdrop-blur sticky top-0 z-40">
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

      {/* Barre du bas (mobile) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-surface/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-6">
          {ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <span className="text-lg leading-none">{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
