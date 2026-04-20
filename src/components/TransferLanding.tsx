"use client";

import type { Metadata } from "next";
import type { TransferRoute, TransferContent } from "@/content/transfers";
import { buildTransferMetadata } from "@/lib/seo";

export type LandingProps = {
  citySlug: string;
  h1: string;
  title: string;
  description: string;
  distances?: Array<{ to: string; minutes: string }>;
  canonical: string;
};

export function buildMetadata({ title, description, canonical }: LandingProps): Metadata {
  return buildTransferMetadata({ title, description, canonical });
}

import WhatsAppReserveButton from "@/components/WhatsAppReserveButton";
import RelatedTransfers from "@/components/public/RelatedTransfers";
import PricingPreview from "@/components/public/PricingPreview";
import BreadcrumbJsonLd from "@/components/SEO/BreadcrumbJsonLd";
import FAQPageJsonLd from "@/components/SEO/FAQPageJsonLd";
import { SITE } from "@/config/site";
import Link from "next/link";
import { useI18nPublic } from "@/lib/i18n-public";

interface TransferLandingFullProps {
  route: TransferRoute;
  lang?: string;
}

/** New data-driven landing page component */
export function TransferLandingFull({ route, lang: langProp }: TransferLandingFullProps) {
  const { lang: contextLang, t } = useI18nPublic();
  const rawLang = langProp || contextLang || "de";
  const validLang = (["tr", "de", "en", "ru"] as const).includes(rawLang as "tr")
    ? (rawLang as "tr" | "de" | "en" | "ru")
    : "de";
  const c: TransferContent = route.content[validLang];

  const breadcrumbs = [
    { name: "Zenturo", url: "/" },
    { name: c.h1, url: `/${route.slug}` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FAQPageJsonLd faqs={c.faqs} />

      <main className="mx-auto w-full max-w-4xl px-4 py-10 space-y-12">
        {/* Breadcrumb navigation */}
        <nav className="text-sm text-white/50" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-blue-400 transition-colors duration-200">Zenturo</Link>
          <span className="mx-2">›</span>
          <span className="text-white/80">{c.h1}</span>
        </nav>

        {/* H1 + intro */}
        <header>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">{c.h1}</h1>
          <p className="mt-3 text-lg text-white/70 leading-relaxed">{c.intro}</p>
          <div className="mt-4">
            <Link
              href="/#rezervasyon"
className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
              {t("landing.cta.book")}
            </Link>
          </div>
        </header>

        {/* Route info cards */}
        {route.distances.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">
              {t("landing.routes.title")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {route.distances.map((d) => (
                <div key={d.to} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                  <div className="font-medium">{d.to}</div>
                  <div className="text-sm text-white/50 mt-1">⏱ {d.minutes}</div>
                </div>
              ))}
            </div>
            {route.distanceKm > 0 && (
              <p className="mt-2 text-sm text-white/40">
                {t("landing.routes.distance", { km: String(route.distanceKm) })}
              </p>
            )}
          </section>
        )}

        {/* Pricing preview */}
        <PricingPreview priceKey={route.priceKey} lang={validLang} />

        {/* Why Zenturo */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            {t("landing.whyUs.title", { name: SITE.shortName })}
          </h2>
          <ul className="space-y-2">
            {c.whyUs.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-white/80">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-xl font-bold mb-4">
            {t("landing.faq.title")}
          </h2>
          <div className="divide-y divide-white/10 rounded-xl border border-white/10">
            {c.faqs.map((faq, i) => (
              <details key={i} className="group p-4 open:bg-white/[0.02]">
                <summary className="cursor-pointer list-none font-medium text-white/90 group-open:text-white">
                  {faq.q}
                </summary>
                <p className="mt-2 text-white/70">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Trust signals */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "🛫", title: t("landing.trust.flight"), desc: t("landing.trust.flightDesc") },
            { icon: "👶", title: t("landing.trust.child"), desc: t("landing.trust.childDesc") },
            { icon: "💰", title: t("landing.trust.price"), desc: t("landing.trust.priceDesc") },
            { icon: "🕐", title: t("landing.trust.support"), desc: t("landing.trust.supportDesc") },
          ].map((b) => (
            <div key={b.icon} className="rounded-lg border border-white/10 bg-white/[0.02] p-4 text-center">
              <div className="text-2xl">{b.icon}</div>
              <div className="mt-1 text-sm font-semibold">{b.title}</div>
              <div className="mt-1 text-xs text-white/50">{b.desc}</div>
            </div>
          ))}
        </section>

        {/* CTA */}
        <section className="rounded-xl border border-blue-500/30 bg-blue-950/20 p-6 text-center">
          <h2 className="text-xl font-bold">
            {t("landing.cta.title")}
          </h2>
          <p className="mt-2 text-white/70">
            {t("landing.cta.subtitle")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link
              href="/#rezervasyon"
              className="inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all duration-200"
            >
              {t("landing.cta.book")}
            </Link>
            <WhatsAppReserveButton city={route.slug} />
          </div>
        </section>

        {/* Related destinations */}
        <RelatedTransfers slugs={route.related} currentSlug={route.slug} lang={validLang} />
      </main>
    </div>
  );
}

/** Legacy wrapper — kept for backward compat until all pages migrate */
export default function TransferLanding(props: LandingProps) {
  return (
    <main className="prose prose-invert mx-auto max-w-3xl px-4 py-10">
      <h1>{props.h1}</h1>
      <p>{props.description}</p>

      {props.distances?.length ? (
        <>
          <h2>Popüler Rotalar</h2>
          <ul>
            {props.distances.map((d) => (
              <li key={d.to}>{d.to}: {d.minutes}</li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>Niçin {SITE.shortName} VIP?</h2>
      <ul>
        <li>Uçuş takibi ile kapıda karşılama</li>
        <li>Deneyimli şoförler, sigortalı taşımacılık</li>
        <li>Ücretsiz çocuk koltuğu, Wi-Fi, soğuk içecek</li>
        <li>7/24 sabit fiyat, gizli ücret yok</li>
      </ul>

      <h2>Sık Sorulanlar</h2>
      <details><summary>Karşılama noktası neresi?</summary><p>Terminal çıkışında isim panosu ile karşılanırsınız.</p></details>
      <details><summary>Gece/erken saatlerde çalışıyor musunuz?</summary><p>Evet, 7/24 hizmet.</p></details>

      <p>
        <WhatsAppReserveButton city={props.citySlug} />
      </p>
    </main>
  );
}