import { buildLocalizedPageMetadata } from "@/lib/seo";
import { getServerLang } from "@/lib/i18n";
import HomePageClient from "./HomePageClient";

const HOME_META: Record<"de" | "en" | "tr" | "ru", { title: string; description: string }> = {
  de: {
    title: "Antalya VIP Transfer | Transparentes Angebot ohne Online-Zahlung",
    description:
      "VIP-Transfer ab Antalya (AYT) mit transparenter Preislogik nach Service-Typ und Paket. Angebotsanfrage online, Zahlung bei Bestätigung.",
  },
  en: {
    title: "Antalya VIP Transfer | Transparent Quote, No Online Payment",
    description:
      "VIP transfers from Antalya Airport with service type and package based quoting. Request a quote online and reserve now; payment after confirmation.",
  },
  tr: {
    title: "Antalya VIP Transfer | Şeffaf Teklif, Online Ödeme Yok",
    description:
      "Antalya Havalimanı çıkışlı VIP transferlerde fiyatlar servis tipi ve paket seçimine göre net şekilde sunulur. Online teklif alın, rezervasyon talebi gönderin.",
  },
  ru: {
    title: "VIP трансфер Анталья | Прозрачный расчёт без онлайн-оплаты",
    description:
      "VIP-трансферы из аэропорта Антальи с прозрачной ценой по типу сервиса и пакету. Оставьте заявку на бронь онлайн, оплата после подтверждения.",
  },
};

export async function generateMetadata() {
  const lang = await getServerLang();
  return buildLocalizedPageMetadata({
    canonical: "/",
    lang,
    localized: HOME_META,
  });
}

export default function HomePage() {
  return <HomePageClient />;
}
