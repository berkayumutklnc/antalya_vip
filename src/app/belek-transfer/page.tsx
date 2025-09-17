import TransferLanding, { buildMetadata } from "@/components/TransferLanding";
export const metadata = buildMetadata({
  citySlug: "belek",
  h1: "Belek VIP Transfer",
  title: "Belek Transfer | Antalya Havalimanı VIP Karşılama",
  description: "Belek'e VIP transfer. AYT havalimanından özel karşılama, 7/24 hizmet, sabit fiyat.",
  canonical: "/belek-transfer",
  distances: [
    { to: "Antalya Havalimanı", minutes: "35–45 dk" },
    { to: "Belek Otelleri", minutes: "5–10 dk" },
    { to: "Kadriye", minutes: "10–15 dk" },
  ],
});
export default function Page(){ return <TransferLanding {...(metadata as any)} />; }