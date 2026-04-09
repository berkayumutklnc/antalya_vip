import Link from "next/link";
import { getServerLang } from "@/lib/i18n";

const TEXTS = {
  tr: { msg: "Sayfa bulunamadı.", home: "Ana Sayfaya Dön" },
  en: { msg: "Page not found.", home: "Go to Homepage" },
  de: { msg: "Seite nicht gefunden.", home: "Zur Startseite" },
  ru: { msg: "Страница не найдена.", home: "На главную" },
} as const;

export default async function NotFound() {
  const lang = await getServerLang();
  const txt = TEXTS[lang] || TEXTS.de;
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-5xl font-bold text-neutral-500">404</h1>
      <p className="text-lg text-neutral-400">{txt.msg}</p>
      <Link href="/" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
        {txt.home}
      </Link>
    </div>
  );
}
