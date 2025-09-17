import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "ayt",
  h1: "Antalya Havalimanı VIP Transfer",
  title: "Antalya Havalimanı Transfer | VIP Karşılama & Özel Şoför",
  description: "AYT’den otele özel karşılama. Uçuş takibi, 7/24 hizmet, sabit fiyat. Lara, Kundu, Belek, Side, Alanya, Kemer.",
  canonical: "/antalya-havalimani-transfer",
  distances: [
    { to: "Lara/Kundu", minutes: "20–30 dk" },
    { to: "Belek", minutes: "35–45 dk" },
    { to: "Kemer", minutes: "55–70 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }