import "./globals.css";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import GA from "@/components/analytics/GA";
import ConsentBanner from "@/components/ConsentBanner";
import WhatsAppFab from "@/components/WhatsAppFab";
import { I18nPublicProvider } from "@/lib/i18n-public";
import { SITE } from "@/config/site";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerLang } from "@/lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://zenturotravel.com"),
  title: {
    default: `Antalya VIP Transfer | ${SITE.shortName}`,
    template: `%s | ${SITE.shortName}`,
  },
  description:
    "Antalya Airport (AYT) → hotel / city VIP transfer. 24/7 meet & greet, flight tracking, child seat, fixed price.",
  alternates: {
    canonical: "/",
    languages: {
      de: "/?lang=de",
      en: "/?lang=en",
      tr: "/?lang=tr",
      ru: "/?lang=ru",
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: `Antalya VIP Transfer | ${SITE.shortName}`,
    description:
      "VIP transfer from AYT to hotels & cities. 24/7 meet & greet, flight tracking.",
  },
  twitter: { card: "summary_large_image", title: `Antalya VIP Transfer | ${SITE.shortName}`, description: "AYT → Hotel VIP Transfer" },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/apple-touch-icon.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getServerLang();
  return (
    <html lang={lang}>
      <body>
        <I18nPublicProvider>
          <GA />
          <Header />
          {children}
          <Footer />
          <WhatsAppFab />
          <ConsentBanner />
          <Analytics />
        </I18nPublicProvider>
      </body>
    </html>
  );
}
