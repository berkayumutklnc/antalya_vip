"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import LanguageSwitchPublic from "@/components/public/LanguageSwitchPublic";
import { useI18nPublic } from "@/lib/i18n-public";
import { SITE } from "@/config/site";

function safeT(t: (k: string) => string, key: string, fallback: string) {
  const s = t(key);
  if (!s || s === key) return fallback;
  return s;
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const { t } = useI18nPublic();

  const telHref = SITE.phone?.startsWith("+")
    ? `tel:${SITE.phone}`
    : `tel:+${(SITE.phone || "").replace(/\D/g, "")}`;
  const waHref = `https://wa.me/${(SITE.whatsapp || "").replace(/\D/g, "")}`;

  const Nav = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
      <Link href="/#hizmetler" onClick={onClick} className="text-white/70 hover:text-white">
        {safeT(t, "header.links.services", "Hizmetlerimiz")}
      </Link>
      <Link href="/#filo" onClick={onClick} className="text-white/70 hover:text-white">
        {safeT(t, "header.links.fleet", "Araç Filomuz")}
      </Link>
      <Link href="/about" onClick={onClick} className="text-white/70 hover:text-white">
        {safeT(t, "header.links.about", "Hakkımızda")}
      </Link>
      <Link href="/faq" onClick={onClick} className="text-white/70 hover:text-white">
        {safeT(t, "header.links.faq", "SSS")}
      </Link>
      <Link href="/rezervasyonumu-gor" onClick={onClick} className="text-white/70 hover:text-white">
        {safeT(t, "header.links.myReservation", "Rezervasyonumu Gör")}
      </Link>
      <a href={telHref} onClick={onClick} className="text-white/70 hover:text-white">
        {safeT(t, "header.links.contact", "İletişim")}
      </a>

      <a
        href={waHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 font-semibold text-white md:hidden"
        onClick={() => { onClick?.(); (window as any).gtag?.("event","whatsapp_click",{location:"header"}); }}
      >
        {safeT(t, "header.cta.whatsapp", "WhatsApp")}
      </a>

      <LanguageSwitchPublic />
    </nav>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt={SITE.name} width={160} height={40} priority className="h-10 w-auto" />
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Nav />
          <Link
            href="/#rezervasyon"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
          >
            {safeT(t, "header.cta.book", "Şimdi Rezervasyon")}
          </Link>
        </div>

        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded border border-white/15 md:hidden"
          onClick={() => setOpen((s) => !s)}
          aria-label="Menu"
        >
          ☰
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-black px-4 pb-4 md:hidden">
          <div className="py-3">
            <Nav onClick={() => setOpen(false)} />
          </div>
          <Link
            href="/#rezervasyon"
            onClick={() => setOpen(false)}
            className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white"
          >
            {safeT(t, "header.cta.book", "Şimdi Rezervasyon")}
          </Link>
        </div>
      )}
    </header>
  );
}
