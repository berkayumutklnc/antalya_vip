"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get("next") || "/admin";

  const configured = isSupabaseConfigured();

  useEffect(() => {
    if (!configured) return;
    const supabase = getSupabaseClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user.app_metadata?.role === "admin") {
        router.replace(nextUrl);
      }
    });
  }, [router, nextUrl, configured]);

  async function onLogin() {
    if (!configured) {
      setErr("Supabase yapılandırması eksik. Vercel'de NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY ortam değişkenlerini ayarlayın.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      if (data.user?.app_metadata?.role !== "admin") {
        setErr("Bu kullanıcı için admin yetkisi yok.");
        await supabase.auth.signOut();
        return;
      }
      router.replace(nextUrl);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onLogout() {
    if (!configured) return;
    await getSupabaseClient().auth.signOut();
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-6">
      <div className="flex flex-col items-center gap-3">
        <img src="/logo.png" alt="Zenturo Travel" className="h-16 w-auto" />
        <h1 className="text-2xl font-bold">Admin Giriş</h1>
      </div>

      {err && (
        <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">
          {err}
        </div>
      )}

      <div className="space-y-3">
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg bg-neutral-900 border border-white/15 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full rounded-lg bg-neutral-900 border border-white/15 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onLogin}
          disabled={loading}
          className={`rounded-lg px-5 py-2.5 font-semibold transition-all duration-200 ${
            loading ? "bg-neutral-700 cursor-not-allowed opacity-60" : "bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-600/20"
          }`}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş yap"}
        </button>
        <button
          onClick={onLogout}
          className="rounded bg-neutral-700 hover:bg-neutral-600 px-4 py-2"
        >
          Çıkış
        </button>
        <Link
          href="/admin"
          className="rounded bg-neutral-800 hover:bg-neutral-700 px-4 py-2"
        >
          Admin'e dön
        </Link>
      </div>
    </main>
  );
}
