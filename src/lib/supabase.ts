"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;
  if (typeof window === "undefined") {
    throw new Error("Supabase client sadece client bileşenlerde kullanılmalı.");
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "[supabase] Client env vars not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  _client = createBrowserClient(url, anonKey);
  return _client;
}
