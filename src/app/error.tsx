"use client";

import { useI18nPublic } from "@/lib/i18n-public";

const TEXTS = {
  tr: { title: "Bir hata oluştu", desc: "Lütfen tekrar deneyin. Sorun devam ederse bizimle iletişime geçin.", retry: "Tekrar Dene" },
  en: { title: "An error occurred", desc: "Please try again. If the problem persists, contact us.", retry: "Try Again" },
  de: { title: "Ein Fehler ist aufgetreten", desc: "Bitte versuchen Sie es erneut. Falls das Problem weiterhin besteht, kontaktieren Sie uns.", retry: "Erneut versuchen" },
  ru: { title: "Произошла ошибка", desc: "Пожалуйста, попробуйте снова. Если проблема сохраняется, свяжитесь с нами.", retry: "Повторить" },
} as const;

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { lang } = useI18nPublic();
  const txt = TEXTS[lang] || TEXTS.de;
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <h2 className="text-2xl font-bold text-red-400">{txt.title}</h2>
      <p className="text-neutral-400 max-w-md">
        {txt.desc}
      </p>
      <button
        onClick={reset}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        {txt.retry}
      </button>
    </div>
  );
}
