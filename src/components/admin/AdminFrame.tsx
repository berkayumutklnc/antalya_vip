"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import AdminGate from "@/components/AdminGate";
import LanguageSwitch from "@/components/admin/LanguageSwitch";
import { I18nProvider, useI18n } from "@/lib/i18n-admin";

const NAV = [
  { href: "/admin", key: "nav.dashboard", icon: "🏠" },
  { href: "/admin/reservations", key: "nav.reservations", icon: "🧾" },
  { href: "/admin/vehicles", key: "nav.vehicles", icon: "🚐" },
  { href: "/admin/calendar", key: "nav.calendar", icon: "🗓️" },
] as const;

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useI18n();

  return (
    <AdminGate>
      <div className="min-h-screen grid grid-cols-[240px_1fr] bg-neutral-950 text-white">
        <aside className="border-r border-white/10 p-4 space-y-4">
          <div className="text-xl font-bold">Admin</div>
          <nav className="space-y-1">
            {NAV.map((n) => {
              const active = pathname === n.href || pathname?.startsWith(n.href + "/");
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded border ${
                    active
                      ? "bg-white text-black border-white"
                      : "bg-neutral-900 border-white/10 hover:bg-neutral-800"
                  }`}
                >
                  <span>{n.icon}</span>
                  <span>{t(n.key)}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="p-4">
          <header className="flex items-center justify-end mb-4 gap-2">
            <LanguageSwitch />
          </header>
          {children}
        </div>
      </div>
    </AdminGate>
  );
}

export default function AdminFrame({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <Shell>{children}</Shell>
    </I18nProvider>
  );
}
