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
    <Link href="/impressum" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Impressum</Link>
  </li>
  <li>
    <Link href="/agb" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">AGB</Link>
  </li>
  <li>
    <Link href="/datenschutz" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Datenschutz</Link>
  </li>
</ul>

          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white font-bold">Transfer</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/antalya-havalimani-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Antalya Airport</Link></li>
              <li><Link href="/belek-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Belek</Link></li>
              <li><Link href="/lara-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Lara / Kundu</Link></li>
              <li><Link href="/kemer-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Kemer</Link></li>
              <li><Link href="/side-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Side / Manavgat</Link></li>
              <li><Link href="/alanya-transfer" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Alanya</Link></li>
              <li><Link href="/vip-transfer-antalya" className="hover:text-blue-400 transition-colors duration-200 py-1 inline-block">Antalya City</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/60 md:flex-row">
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
