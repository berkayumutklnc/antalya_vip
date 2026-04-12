// scripts/set-admin.mjs
// Usage: node scripts/set-admin.mjs <USER_ID> [true|false]
// Sets app_metadata.role = "admin" (or "user") on a Supabase Auth user.
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
//
// app_metadata is used (not user_metadata) because it cannot be
// modified by the user themselves — only by service_role calls.

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required.");
  process.exit(1);
}

const uid = process.argv[2];
const flag = (process.argv[3] ?? "true") !== "false";

if (!uid) {
  console.error("Kullanım: node scripts/set-admin.mjs <USER_ID> [true|false]");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.updateUserById(uid, {
  app_metadata: { role: flag ? "admin" : "user" },
});

if (error) {
  console.error("Hata:", error.message);
  process.exit(1);
}

console.log(`OK → app_metadata.role=${flag ? "admin" : "user"} set for uid=${uid} (email: ${data.user?.email ?? "?"})`);
process.exit(0);
