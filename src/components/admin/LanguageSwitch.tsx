"use client";
import { useI18n, type Lang } from "@/lib/i18n-admin";

const langs: Lang[] = ["tr","en","de","ru"];

export default function LanguageSwitch() {
  const { lang, setLang } = useI18n();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e)=> setLang(e.target.value as Lang)}
      className="px-2 py-1 rounded bg-neutral-800 border border-white/10 text-sm"
    >
      {langs.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
