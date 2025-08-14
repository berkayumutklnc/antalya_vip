// scripts/set-admin.mjs
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saPath = path.join(__dirname, "..", "secrets", "firebase-service-account.json");
const serviceAccount = JSON.parse(fs.readFileSync(saPath, "utf8"));

initializeApp({ credential: cert(serviceAccount) });

const uid = process.argv[2];
const flag = (process.argv[3] ?? "true") !== "false"; 
if (!uid) {
  console.error("Kullanım: node scripts/set-admin.mjs <UID> [true|false]");
  process.exit(1);
}
await getAuth().setCustomUserClaims(uid, { admin: flag });
console.log(`OK → admin=${flag} set for uid=${uid}`);
process.exit(0);
