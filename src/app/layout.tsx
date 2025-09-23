import "./globals.css";
import type { Metadata } from "next";
import GA from "@/components/analytics/GA";
import { I18nPublicProvider } from "@/lib/i18n-public";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://sonnenlichttransfer.com"),
  title: {
    default: "Antalya VIP Transfer | Sonnenlicht",
    template: "%s | Sonnenlicht",
  },
  description:
    "Antalya Havalimanı (AYT) → otel/şehir içi VIP transfer. 7/24 karşılama, uçuş takibi, çocuk koltuğu, sabit fiyat.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Sonnenlicht VIP Transfer",
    title: "Antalya VIP Transfer",
    description:
      "AYT’den otele VIP transfer ve şehir içi özel taşımacılık. 7/24 karşılama, uçuş takibi.",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Sonnenlicht VIP Transfer" }],
  },
  twitter: { card: "summary_large_image", title: "Antalya VIP Transfer", description: "AYT → Otel VIP transfer" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <I18nPublicProvider>
          <GA />
          {children}
        </I18nPublicProvider>
      </body>
    </html>
  );
}
