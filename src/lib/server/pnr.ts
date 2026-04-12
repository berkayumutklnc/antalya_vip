import { randomInt } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I
const CODE_LEN = 7;
const MAX_ATTEMPTS = 10;

function randomCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LEN; i++) {
    code += CHARSET[randomInt(CHARSET.length)];
  }
  return `TRF-${code}`;
}

/**
 * Generate a collision-resistant PNR code.
 * Checks the `reservations` table for uniqueness.
 */
export async function generateUniquePNR(db: SupabaseClient): Promise<string> {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const code = randomCode();
    const { data } = await db
      .from("reservations")
      .select("code")
      .eq("code", code)
      .limit(1)
      .maybeSingle();
    if (!data) return code;
  }
  throw new Error("Failed to generate unique PNR after max attempts");
}
