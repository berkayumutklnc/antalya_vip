import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "side",
  h1: "Side VIP Transfer",
  title: "Side Transfer | Antalya Havalimanı VIP Karşılama",
  description: "Side'ye VIP transfer. AYT havalimanından özel karşılama, 7/24 hizmet, sabit fiyat.",
  canonical: "/side-transfer",
  distances: [
    { to: "Antalya Havalimanı", minutes: "50–65 dk" },
    { to: "Side Merkez", minutes: "5–10 dk" },
    { to: "Manavgat", minutes: "15–20 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }