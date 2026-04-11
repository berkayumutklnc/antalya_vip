"use client";
import { useI18nPublic } from "@/lib/i18n-public";
import { SITE } from "@/config/site";

export default function AboutPage() {
  const { t } = useI18nPublic();
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 prose prose-invert">
      <h1>{t("about.title")}</h1>
      <p>{t("about.p1")}</p>
      <p>{t("about.p2")}</p>
      <p>{t("about.p3")}</p>
      <div className="not-prose mt-8 rounded-xl bg-blue-950/30 border border-blue-500/30 ring-1 ring-white/10 p-5">
        <div className="text-sm font-semibold text-white/90">{t("about.contact")}:</div>
        <div className="mt-2 text-sm">
          <a className="underline hover:text-blue-400 transition-colors" href={`tel:${SITE.phone}`}>{SITE.phone}</a> ·{" "}
          <a className="underline hover:text-blue-400 transition-colors" href={`mailto:${SITE.email}`}>{SITE.email}</a>
        </div>
      </div>
    </main>
  );
}
