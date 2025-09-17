import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "alanya",
  h1: "Alanya VIP Transfer",
  title: "Alanya Transfer | Antalya Havalimanı VIP Karşılama",
  description: "Alanya'ya VIP transfer. AYT havalimanından özel karşılama, 7/24 hizmet, sabit fiyat.",
  canonical: "/alanya-transfer",
  distances: [
    { to: "Antalya Havalimanı", minutes: "120–140 dk" },
    { to: "Alanya Merkez", minutes: "5–10 dk" },
    { to: "Mahmutlar", minutes: "15–20 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }