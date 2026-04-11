"use client";
import { usePathname } from "next/navigation";
import { I18nProvider } from "@/lib/i18n-admin";
import AdminGate from "@/components/AdminGate";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <I18nProvider>
      {isLogin ? children : <AdminGate>{children}</AdminGate>}
    </I18nProvider>
  );
}