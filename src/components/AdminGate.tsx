"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
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

  useEffect(() => {
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
  }, [router, pathname]);

  if (!ready) return <div className="p-6 text-white/60">Yükleniyor…</div>;
  return <>{children}</>;
}
