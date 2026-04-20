import { buildLocalizedPageMetadata } from "@/lib/seo";
import { getServerLang } from "@/lib/i18n";
import ReservationClient from "./ReservationClient";

const RESERVATION_META: Record<"de" | "en" | "tr" | "ru", { title: string; description: string }> = {
  de: {
    title: "Transfer-Angebot anfragen | Zenturo VIP Transfer",
    description:
      "Route, Service-Typ und Paket wählen. Sofort ein transparentes Angebot erhalten und Reservierungsanfrage senden. Keine Online-Zahlung.",
  },
  en: {
    title: "Request Transfer Quote | Zenturo VIP Transfer",
    description:
      "Choose route, service type and package to see your quote, then send a reservation request. No online payment is required.",
  },
  tr: {
    title: "Transfer Teklifi Al | Zenturo VIP Transfer",
    description:
      "Rota, servis tipi ve paket seçerek anlık teklifinizi görün; rezervasyon talebinizi online gönderin. Online ödeme alınmaz.",
  },
  ru: {
    title: "Запросить расчёт трансфера | Zenturo VIP Transfer",
    description:
      "Выберите маршрут, тип сервиса и пакет, чтобы увидеть стоимость и отправить заявку на бронь. Онлайн-оплата не требуется.",
  },
};

export async function generateMetadata() {
  const lang = await getServerLang();
  return buildLocalizedPageMetadata({
    canonical: "/rezervasyon",
    lang,
    localized: RESERVATION_META,
  });
}

export default function ReservationPage() {
  return <ReservationClient />;
}
