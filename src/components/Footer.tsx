"use client";

import Link from "next/link";
import { SITE } from "@/config/site";
import { useI18nPublic } from "@/lib/i18n-public";

function safeT(t: (k: string) => string, key: string, fallback: string) {
  const s = t(key);
  if (!s || s === key || s.startsWith(key.split(".")[0] + ".")) return fallback;
  return s;
}

function PhoneIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M22 16.92v2a2 2 0 0 1-2.18 2 19.78 19.78 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.78 19.78 0 0 1 2.92 4.2 2 2 0 0 1 4.92 2h2a2 2 0 0 1 2 1.72c.12.9.34 1.78.66 2.62a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.46-1.04a2 2 0 0 1 2.11-.45c.84.32 1.72.54 2.62.66A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}
function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        d="m22 6-10 7L2 6" />
    </svg>
  );
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="text-lg font-semibold text-white">{SITE.name}</div>
            {SITE.address ? (
              <p className="mt-3 text-sm leading-relaxed text-white/70">{SITE.address}</p>
            ) : null}
          </div>
          <div className="rounded-2xl bg-white/[0.02] ring-1 ring-white/10 p-5">
            <div className="mb-3 text-white/90 font-semibold">{contactTitle}</div>
            <ul className="space-y-2 text-sm">
              {SITE.phone ? (
                <li>
                  <a href={phoneHref} className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition">
                    <PhoneIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                    {SITE.phone}
                  </a>
                </li>
              ) : null}
              {SITE.email ? (
                <li>
                  <a href={`mailto:${SITE.email}`} className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition">
                    <MailIcon className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                    {SITE.email}
                  </a>
                </li>
              ) : null}
              {SITE.whatsapp ? (
                <li>
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 text-white/70 hover:text-white transition">
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
