import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "lara",
  h1: "Lara VIP Transfer",
  title: "Lara Transfer | Antalya Havalimanı VIP Karşılama",
  description: "Lara'ya VIP transfer. AYT havalimanından özel karşılama, 7/24 hizmet, sabit fiyat.",
  canonical: "/lara-transfer",
  distances: [
    { to: "Antalya Havalimanı", minutes: "20–30 dk" },
    { to: "Lara Otelleri", minutes: "5–10 dk" },
    { to: "Kundu", minutes: "10–15 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }