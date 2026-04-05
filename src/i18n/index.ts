export type Lang = "tr" | "en" | "de" | "ru";

export function resolveLang(searchParams?: URLSearchParams): Lang {
  const fallback: Lang = "de";
  try {
    if (typeof window !== "undefined" && !searchParams) {
      const sp = new URLSearchParams(window.location.search);
      const l = (sp.get("lang") || "").toLowerCase();
      if (l === "tr" || l === "en" || l === "de" || l === "ru") return l as Lang;
      return fallback;
    }
    if (searchParams) {
      const l = (searchParams.get("lang") || "").toLowerCase();
      if (l === "tr" || l === "en" || l === "de" || l === "ru") return l as Lang;
    }
  } catch {}
  return fallback;
}

import tr from "./tr.json";
import en from "./en.json";
import de from "./de.json";
import ru from "./ru.json";

const dict: Record<Lang, Record<string, string>> = { tr, en, de, ru } as const;

export function t(key: string, lang: Lang): string {
  const d = dict[lang] || {};
  return d[key] ?? key;
}