import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "antalya",
  h1: "VIP Transfer Antalya",
  title: "VIP Transfer Antalya | Özel Şoför & Havalimanı Karşılama",
  description: "Antalya'da VIP transfer hizmetleri. Havalimanı karşılama, şehir içi taşımacılık, 7/24 hizmet, sabit fiyat.",
  canonical: "/vip-transfer-antalya",
  distances: [
    { to: "Antalya Havalimanı", minutes: "20–30 dk" },
    { to: "Lara/Kundu", minutes: "15–25 dk" },
    { to: "Belek", minutes: "30–40 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }