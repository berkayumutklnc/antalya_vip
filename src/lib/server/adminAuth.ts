import { getAdminClient } from "@/lib/supabaseAdmin";

/**
 * Verify Supabase JWT from Authorization header and check admin status.
 * Returns the decoded UID on success, throws on failure.
 */
export async function verifyAdminToken(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AuthError("Missing or malformed Authorization header", 401);
  }

  const token = match[1];
  const supabase = getAdminClient();
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new AuthError("Invalid or expired token", 401);
  }

  const user = data.user;
  const role = user.app_metadata?.role;

  if (role !== "admin") {
    throw new AuthError("Not an admin", 403);
  }

  return user.id;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "AuthError";
  }
}
