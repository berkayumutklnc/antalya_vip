"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError(true);
      return;
    }
    const supabase = getSupabaseClient();

    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`);
        return;
      }
      const role = session.user.app_metadata?.role;
      if (role !== "admin") {
        await supabase.auth.signOut();
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}&err=notadmin`);
        return;
      }
      setReady(true);
    }

    check();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`);
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  if (configError) {
    return (
      <div className="max-w-lg mx-auto p-8 mt-20 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-bold text-red-400">Supabase Yapılandırması Eksik</h1>
        <p className="text-white/60 text-sm">
          Admin paneli için Supabase ortam değişkenleri ayarlanmamış.
          Vercel Dashboard &rarr; Settings &rarr; Environment Variables bölümünden
          <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs">NEXT_PUBLIC_SUPABASE_URL</code> ve
          <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
          değişkenlerini ekleyin ve yeniden deploy edin.
        </p>
      </div>
    );
  }

  if (!ready) return <div className="p-6 text-white/60">Yükleniyor…</div>;
  return <>{children}</>;
}
