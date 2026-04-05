"use client";

import { useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const raw = (process.env.NEXT_PUBLIC_ADMIN_UID || "").replace(/["']/g, "");
const ADMIN_UIDS = raw
  .split(/[,\s]+/)
  .map((s) => s.trim())
  .filter(Boolean);

async function isAdmin(user: User | null): Promise<boolean> {
  if (!user) return false;
  try {
    const token = await user.getIdTokenResult(true);
    if (token.claims?.admin === true) return true;
  } catch {}
  return ADMIN_UIDS.includes(user.uid);
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const nextUrl = sp.get("next") || "/admin";

  useEffect(() => {
    const unsub = onAuthStateChanged(getClientAuth(), async (user) => {
      if (await isAdmin(user)) {
        router.replace(nextUrl);
      }
    });
    return () => unsub();
  }, [router, nextUrl]);

  async function onLogin() {
    setErr(null);
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(getClientAuth(), email.trim(), pass);
      if (!(await isAdmin(cred.user))) {
        setErr("Bu kullanıcı için admin yetkisi yok.");
        await signOut(getClientAuth());
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
    await signOut(getClientAuth());
  }

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Giriş</h1>

      {err && (
        <div className="rounded border border-red-600/40 bg-red-900/20 p-3 text-red-200">
          {err}
        </div>
      )}

      <div className="space-y-2">
        <input
          type="email"
          placeholder="E-posta"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded bg-neutral-900 border border-white/10 p-2"
        />
        <input
          type="password"
          placeholder="Şifre"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="w-full rounded bg-neutral-900 border border-white/10 p-2"
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={onLogin}
          disabled={loading}
          className={`rounded px-4 py-2 ${
            loading ? "bg-neutral-700" : "bg-blue-600 hover:bg-blue-700"
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
          Admin’e dön
        </Link>
      </div>

      <p className="text-white/40 text-xs">
        UID izinli liste: <code>{ADMIN_UIDS.join(", ") || "(boş)"}</code>
      </p>
    </main>
  );
}
