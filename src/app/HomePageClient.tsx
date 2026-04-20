"use client";

import Image from "next/image";
import Link from "next/link";
import Wizard from "@/components/ReservationForm/Wizard";
import { VEHICLES } from "@/types/reservation";
import { useI18nPublic } from "@/lib/i18n-public";
import LocalBusinessJSONLD from "@/components/SEO/LocalBusiness";
import FAQJSONLD from "@/components/SEO/FAQ";

export default function HomePageClient() {
  const { t } = useI18nPublic();

  const badgeIcons = ["✓", "🚘", "🛡️", "⏰"];

  const badges = [
    { icon: badgeIcons[0], title: t("home.badge.support"), desc: t("home.badge.supportDesc") },
    { icon: badgeIcons[1], title: t("home.badge.driver"), desc: t("home.badge.driverDesc") },
    { icon: badgeIcons[2], title: t("home.badge.insured"), desc: t("home.badge.insuredDesc") },
    { icon: badgeIcons[3], title: t("home.badge.ontime"), desc: t("home.badge.ontimeDesc") },
  ];

  const services = [
    { title: t("home.svc.airport"), img: "/images/airport.jpg" },
    { title: t("home.svc.hotel"), img: "/images/hotel.jpg" },
    { title: t("home.svc.city"), img: "/images/city.jpg" },
    { title: t("home.svc.tour"), img: "/images/tour.jpg" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <LocalBusinessJSONLD />
      <FAQJSONLD />
      <section
        className="relative flex min-h-[60vh] md:h-[70vh] items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-5xl font-extrabold tracking-tight md:text-7xl drop-shadow-lg">
            {t("home.hero.title")}
          </h1>
          <p className="mt-4 text-lg text-white/80 md:text-xl">
            {t("home.hero.subtitle")}
          </p>
          <a
            href="#rezervasyon"
            className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg hover:bg-blue-700 active:scale-95 transition-all duration-200"
          >
            {t("home.hero.cta")}
          </a>
        </div>
      </section>
      <main id="rezervasyon" className="container mx-auto w-full max-w-5xl flex-1 px-4">
        <div className="relative -mt-16 md:-mt-20">
          <div className="rounded-2xl border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur md:p-6">
            <Wizard />
          </div>
        </div>
        <section className="mx-auto mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {badges.map((b) => (
            <div key={b.title} className="rounded-xl border border-white/10 bg-black p-3 md:p-4 hover:border-white/20 transition-colors">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="font-semibold">{b.title}</div>
              <div className="mt-1 text-sm text-white/70">{b.desc}</div>
            </div>
          ))}
        </section>
        <section id="hizmetler" className="mt-16">
          <h2 className="mb-6 text-3xl font-bold">{t("home.services.title")}</h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[
              { href: "/antalya-havalimani-transfer", labelKey: "home.link.airport", img: "/images/airport.jpg" },
              { href: "/belek-transfer", labelKey: "home.link.belek", img: "/images/tour.jpg" },
              { href: "/lara-transfer", labelKey: "home.link.lara", img: "/images/city.jpg" },
              { href: "/kemer-transfer", labelKey: "home.link.kemer", img: "/images/hotel.jpg" },
              { href: "/side-transfer", labelKey: "home.link.side", img: "/images/hero.jpg" },
              { href: "/alanya-transfer", labelKey: "home.link.alanya", img: "/images/airport.jpg" },
              { href: "/vip-transfer-antalya", labelKey: "home.link.vip", img: "/images/hotel.jpg" },
            ].map((s) => (
              <Link key={s.href} href={s.href}>
                <div className="overflow-hidden rounded-2xl border border-blue-500/20 bg-black hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200">
                  <Image src={s.img} alt={t(s.labelKey)} width={400} height={160} className="h-32 w-full object-cover" />
                  <div className="p-3">
                    <div className="text-sm font-semibold md:text-base">{t(s.labelKey)}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section id="filo" className="mt-16">
          <h2 className="mb-6 text-3xl font-bold">{t("home.fleet.title")}</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {VEHICLES.map((v: any) => (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-emerald-500/20 bg-black hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
                <Image src={v.image} alt={v.title || v.name} width={400} height={192} className="h-48 w-full object-cover" />
                <div className="space-y-1 p-4">
                  <div className="text-lg font-semibold">{v.title || v.name}</div>
                  {v.features?.length ? (
                    <div className="text-sm text-white/70">{v.features.join(" • ")}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-right">
            <a
              href="#rezervasyon"
              className="inline-block rounded-xl border-2 border-blue-600 bg-transparent px-6 py-3 font-semibold text-blue-400 hover:bg-blue-600 hover:text-white active:scale-95 transition-all duration-200"
            >
              {t("home.fleet.cta")}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
