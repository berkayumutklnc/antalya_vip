"use client";

import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/config/site";
import { useI18nPublic } from "@/lib/i18n-public";

function safeT(t: (k: string) => string, key: string, fallback: string) {
  const s = t(key);
  if (!s || s === key || s.startsWith(key.split(".")[0] + ".")) return fallback;
  return s;
}

export default function Footer() {
  const { t } = useI18nPublic();
  const year = new Date().getFullYear();

  const rights = safeT(t, "footer.rights", "Tüm hakları saklıdır.");
  const contactTitle = safeT(t, "footer.contact", "İletişim");
  const linksTitle = safeT(t, "footer.links", "Bağlantılar");

  const phoneHref = SITE.phone?.startsWith("+")
    ? `tel:${SITE.phone}`
    : `tel:+${SITE.phone?.replace(/\D/g, "")}`;
  const waHref = `https://wa.me/${(SITE.whatsapp || "").replace(/\D/g, "")}`;

  return (
    <footer className="mt-20">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5 flex flex-col items-center justify-center">
            <Image src="/logo_2.png" alt={SITE.name} width={280} height={280} className="w-3/4 md:w-full h-auto object-contain mx-auto" />
            {SITE.address ? (
              <p className="mt-3 text-sm leading-relaxed text-white/70">{SITE.address}</p>
            ) : null}
          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white font-bold">{contactTitle}</div>
            <ul className="space-y-2 text-sm">
              {SITE.phone ? (
                <li>
                  <a href={phoneHref} className="text-white/70 hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
                    {SITE.phone}
                  </a>
                </li>
              ) : null}
              {SITE.email ? (
                <li>
                  <a href={`mailto:${SITE.email}`} className="text-white/70 hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
                    {SITE.email}
                  </a>
                </li>
              ) : null}
              {SITE.whatsapp ? (
                <li>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-blue-400 transition-colors duration-200 py-1 inline-block" onClick={() => (window as any).gtag?.("event","whatsapp_click",{location:"footer"})}>
                    WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white font-bold">{linksTitle}</div>
            <ul className="space-y-2 text-sm text-white/70">
  <li>
    <Link href="/#rezervasyon" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "nav.reservation", "Rezervasyon")}
    </Link>
  </li>
  <li>
    <Link href="/#hizmetler" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "home.services.title", "Hizmetlerimiz")}
    </Link>
  </li>
  <li>
    <Link href="/#filo" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "home.fleet.title", "Araç Filomuz")}
    </Link>
  </li>
  <li>
    <Link href="/about" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "nav.about", "Hakkımızda")}
    </Link>
  </li>
  <li>
    <Link href="/faq" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "nav.faq", "SSS")}
    </Link>
  </li>
  <li>
    <Link href="/policies/cancellation" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "nav.cancelPolicy", "İptal Politikası")}
    </Link>
  </li>
  <li>
    <Link href="/policies/privacy" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">
      {safeT(t, "nav.privacy", "KVKK / Gizlilik")}
    </Link>
  </li>
  <li>
    <Link href="/impressum" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "footer.legal.impressum", "Impressum")}</Link>
  </li>
  <li>
    <Link href="/agb" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "footer.legal.agb", "AGB")}</Link>
  </li>
  <li>
    <Link href="/datenschutz" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "footer.legal.datenschutz", "Datenschutz")}</Link>
  </li>
</ul>

          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white font-bold">{safeT(t, "footer.transfer.title", "Transfers")}</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/antalya-havalimani-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.airport", "Antalya Airport Transfer")}</Link></li>
              <li><Link href="/belek-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.belek", "Belek Transfer")}</Link></li>
              <li><Link href="/lara-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.lara", "Lara / Kundu Transfer")}</Link></li>
              <li><Link href="/kemer-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.kemer", "Kemer Transfer")}</Link></li>
              <li><Link href="/side-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.side", "Side / Manavgat Transfer")}</Link></li>
              <li><Link href="/alanya-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.alanya", "Alanya Transfer")}</Link></li>
              <li><Link href="/vip-transfer-antalya" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">{safeT(t, "home.link.vip", "VIP Transfer Antalya")}</Link></li>
            </ul>
          </div>
        </div>

        {/* TURSAB Premium Badge */}
        <div className="mt-10 flex justify-center">
          <div className="relative flex items-center gap-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/40 via-yellow-900/20 to-amber-950/40 px-8 py-5 shadow-[0_0_30px_rgba(245,158,11,0.12)] backdrop-blur-sm">
            {/* Left decorative line */}
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-amber-500/60 to-transparent" />
            {/* Shield icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-yellow-600/10 ring-1 ring-amber-500/40">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-amber-400">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
              </svg>
            </div>
            {/* Text */}
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-500/80">Yetkili Belge Tescili</span>
              <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-sm font-bold text-transparent">
                Golden Goat Turizm Seyehat Acentesi
              </span>
              <span className="text-xs font-medium tracking-wider text-amber-400/80">TÜRSAB Belge No: 11302</span>
            </div>
            {/* Right decorative line */}
            <div className="h-12 w-px bg-gradient-to-b from-transparent via-amber-500/60 to-transparent" />
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/60 md:flex-row">
          <div>
            © {year} {SITE.name}. {rights} —{" "}
            <Link
              href="https://www.linkedin.com/in/berkayumutkilinc"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white"
            >
              Berkay Umut KILINÇ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
