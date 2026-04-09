"use client";
import { useI18nPublic, type Lang } from "@/lib/i18n-public";
import { useCallback } from "react";

const langs: Lang[] = ["tr","en","de","ru"];

export default function LanguageSwitchPublic() {
  const { lang, setLang } = useI18nPublic();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Lang;
    setLang(next);
    // Sync URL ?lang= param so links are shareable
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("lang", next);
      window.history.replaceState(null, "", url.toString());
    } catch {}
  }, [setLang]);

  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={handleChange}
      className="px-2 py-1 rounded bg-neutral-800 border border-white/10 text-sm"
    >
      {langs.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
    </select>
  );
}
