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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <Image src="/logo.png" alt={SITE.name} width={140} height={36} className="h-9 w-auto mb-2" />
            {SITE.address ? (
              <p className="mt-3 text-sm leading-relaxed text-white/70">{SITE.address}</p>
            ) : null}
          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white/90 font-semibold">{contactTitle}</div>
            <ul className="space-y-2 text-sm">
              {SITE.phone ? (
                <li>
                  <a href={phoneHref} className="text-white/70 hover:text-white transition">
                    {SITE.phone}
                  </a>
                </li>
              ) : null}
              {SITE.email ? (
                <li>
                  <a href={`mailto:${SITE.email}`} className="text-white/70 hover:text-white transition">
                    {SITE.email}
                  </a>
                </li>
              ) : null}
              {SITE.whatsapp ? (
                <li>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition" onClick={() => (window as any).gtag?.("event","whatsapp_click",{location:"footer"})}>
                    WhatsApp
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white/90 font-semibold">{linksTitle}</div>
            <ul className="space-y-2 text-sm text-white/70">
  <li>
    <Link href="/#rezervasyon" className="hover:text-white transition">
      {safeT(t, "nav.reservation", "Rezervasyon")}
    </Link>
  </li>
  <li>
    <Link href="/#hizmetler" className="hover:text-white transition">
      {safeT(t, "home.services.title", "Hizmetlerimiz")}
    </Link>
  </li>
  <li>
    <Link href="/#filo" className="hover:text-white transition">
      {safeT(t, "home.fleet.title", "Araç Filomuz")}
    </Link>
  </li>
  <li>
    <Link href="/about" className="hover:text-white transition">
      {safeT(t, "nav.about", "Hakkımızda")}
    </Link>
  </li>
  <li>
    <Link href="/faq" className="hover:text-white transition">
      {safeT(t, "nav.faq", "SSS")}
    </Link>
  </li>
  <li>
    <Link href="/policies/cancellation" className="hover:text-white transition">
      {safeT(t, "nav.cancelPolicy", "İptal Politikası")}
    </Link>
  </li>
  <li>
    <Link href="/policies/privacy" className="hover:text-white transition">
      {safeT(t, "nav.privacy", "KVKK / Gizlilik")}
    </Link>
  </li>
  <li>
    <Link href="/impressum" className="hover:text-white transition">Impressum</Link>
  </li>
  <li>
    <Link href="/agb" className="hover:text-white transition">AGB</Link>
  </li>
  <li>
    <Link href="/datenschutz" className="hover:text-white transition">Datenschutz</Link>
  </li>
</ul>

          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white/90 font-semibold">Transfer</div>
            <ul className="space-y-2 text-sm text-white/70">
              <li><Link href="/antalya-havalimani-transfer" className="hover:text-white transition">Antalya Airport</Link></li>
              <li><Link href="/belek-transfer" className="hover:text-white transition">Belek</Link></li>
              <li><Link href="/lara-transfer" className="hover:text-white transition">Lara / Kundu</Link></li>
              <li><Link href="/kemer-transfer" className="hover:text-white transition">Kemer</Link></li>
              <li><Link href="/side-transfer" className="hover:text-white transition">Side / Manavgat</Link></li>
              <li><Link href="/alanya-transfer" className="hover:text-white transition">Alanya</Link></li>
              <li><Link href="/vip-transfer-antalya" className="hover:text-white transition">Antalya City</Link></li>
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
