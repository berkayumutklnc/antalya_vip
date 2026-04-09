import { cookies, headers } from "next/headers";
import tr from "@/locales/tr.json";
import en from "@/locales/en.json";
import de from "@/locales/de.json";
import ru from "@/locales/ru.json";

const dict = { tr, en, de, ru };
const SUPPORTED = ["de", "en", "tr", "ru"];

export function getLocaleDict(locale: string) {
  return dict[locale as keyof typeof dict] || dict["de"];
}

export async function getLocaleFromCookie() {
  const cookieStore = await cookies();
  if (!cookieStore || typeof cookieStore.get !== "function") return "de";
  const cookie = cookieStore.get("lang_public");
  return (cookie?.value && SUPPORTED.includes(cookie.value) ? cookie.value : "de") as "de" | "en" | "tr" | "ru";
}

/** Read lang set by middleware (header > cookie > default) */
export async function getServerLang(): Promise<"de" | "en" | "tr" | "ru"> {
  try {
    const h = await headers();
    const hLang = h.get("x-lang");
    if (hLang && SUPPORTED.includes(hLang)) return hLang as any;
  } catch {}
  return getLocaleFromCookie();
}
