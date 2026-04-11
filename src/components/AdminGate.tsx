"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getClientAuth, isFirebaseConfigured } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

const rawInput = (process.env.NEXT_PUBLIC_ADMIN_UID || "").replace(/["']/g, "");
const ADMIN_UIDS = rawInput
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

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setConfigError(true);
      return;
    }
    try {
      const unsub = onAuthStateChanged(getClientAuth(), async (user) => {
        if (!user) {
          router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`);
          return;
        }
        if (!(await isAdmin(user))) {
          await signOut(getClientAuth()).catch(() => {});
          router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}&err=notadmin`);
          return;
        }
        setReady(true);
      });
      return () => unsub();
    } catch {
      setConfigError(true);
    }
  }, [router, pathname]);

  if (configError) {
    return (
      <div className="max-w-lg mx-auto p-8 mt-20 text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h1 className="text-xl font-bold text-red-400">Firebase Yapılandırması Eksik</h1>
        <p className="text-white/60 text-sm">
          Admin paneli için Firebase ortam değişkenleri ayarlanmamış.
          Vercel Dashboard &rarr; Settings &rarr; Environment Variables bölümünden
          <code className="mx-1 px-1.5 py-0.5 bg-white/10 rounded text-xs">NEXT_PUBLIC_FIREBASE_*</code>
          değişkenlerini ekleyin ve yeniden deploy edin.
        </p>
      </div>
    );
  }

  if (!ready) return <div className="p-6 text-white/60">Yükleniyor…</div>;
  return <>{children}</>;
}
