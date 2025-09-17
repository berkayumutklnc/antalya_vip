import { getApps, initializeApp, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function ensureAppOrNull() {
  if (getApps().length) return getApp();
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return null;
  const json = JSON.parse(Buffer.from(b64, "base64").toString("utf8"));
  return initializeApp({ credential: cert(json as any) });
}

export function getAdminDbOrThrow() {
  const app = ensureAppOrNull();
  if (!app) {
    throw new Error("Service account missing: set FIREBASE_SERVICE_ACCOUNT_BASE64.");
  }
  return getFirestore(app);
}
