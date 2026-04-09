import { getAdminAuth, getAdminDbOrThrow } from "@/lib/firebaseAdmin";

/**
 * Verify Firebase ID token from Authorization header and check admin status.
 * Returns the decoded UID on success, throws on failure.
 */
export async function verifyAdminToken(req: Request): Promise<string> {
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new AuthError("Missing or malformed Authorization header", 401);
  }

  const idToken = match[1];
  const auth = getAdminAuth();
  const decoded = await auth.verifyIdToken(idToken);
  const uid = decoded.uid;

  // Check admin custom claim first
  if (decoded.admin === true) return uid;

  // Fall back to admins collection
  const adminDoc = await getAdminDbOrThrow().collection("admins").doc(uid).get();
  if (!adminDoc.exists) {
    throw new AuthError("Not an admin", 403);
  }

  return uid;
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
