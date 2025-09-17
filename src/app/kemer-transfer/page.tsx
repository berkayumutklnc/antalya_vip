import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "kemer",
  h1: "Kemer VIP Transfer",
  title: "Kemer Transfer | Antalya Havalimanı VIP Karşılama",
  description: "Kemer'e VIP transfer. AYT havalimanından özel karşılama, 7/24 hizmet, sabit fiyat.",
  canonical: "/kemer-transfer",
  distances: [
    { to: "Antalya Havalimanı", minutes: "55–70 dk" },
    { to: "Kemer Merkez", minutes: "5–10 dk" },
    { to: "Beldibi", minutes: "10–15 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }