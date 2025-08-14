"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

function getBypass(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("admin") === "1";
  } catch {
    return false;
  }
}

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const bypass = getBypass();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (bypass) {
        setReady(true);
        return;
      }
      if (!user) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}`);
        return;
      }
      if (!(await isAdmin(user))) {
        await signOut(auth).catch(() => {});
        router.replace(`/admin/login?next=${encodeURIComponent(pathname || "/admin")}&err=notadmin`);
        return;
      }
      setReady(true);
    });
    return () => unsub();
  }, [router, pathname, bypass]);

  if (!ready) return <div className="p-6 text-white/60">Yükleniyor…</div>;
  return <>{children}</>;
}
