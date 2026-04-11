"use client";
import { useI18nPublic } from "@/lib/i18n-public";

export default function FAQPage() {
  const { t } = useI18nPublic();
  const items = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
  ];
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">{t("faq.title")}</h1>
      <div className="divide-y divide-white/10 rounded-xl border border-white/10">
        {items.map((it, i) => (
          <details key={i} className="group p-5 open:bg-white/[0.02] hover:bg-white/[0.01] transition-colors">
            <summary className="cursor-pointer list-none text-white/90 font-medium group-open:text-white">
              {it.q}
            </summary>
            <p className="mt-2 text-white/80">{it.a}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
