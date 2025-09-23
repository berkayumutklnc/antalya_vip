import type { Metadata } from "next";

export type LandingProps = {
  citySlug: string;
  h1: string;
  title: string;
  description: string;
  distances?: Array<{ to: string; minutes: string }>;
  canonical: string;
};

export function buildMetadata({ title, description, canonical }: LandingProps): Metadata {
  return { title, description, alternates: { canonical } };
}

import WhatsAppReserveButton from "@/components/WhatsAppReserveButton";

export default function TransferLanding(props: LandingProps) {
  return (
    <main className="prose prose-invert mx-auto max-w-3xl px-4 py-10">
      <h1>{props.h1}</h1>
      <p>{props.description}</p>

      {props.distances?.length ? (
        <>
          <h2>Popüler Rotalar</h2>
          <ul>
            {props.distances.map((d) => (
              <li key={d.to}>{d.to}: {d.minutes}</li>
            ))}
          </ul>
        </>
      ) : null}

      <h2>Niçin Sonnenlicht VIP?</h2>
      <ul>
        <li>Uçuş takibi ile kapıda karşılama</li>
        <li>Deneyimli şoförler, sigortalı taşımacılık</li>
        <li>Ücretsiz çocuk koltuğu, Wi-Fi, soğuk içecek</li>
        <li>7/24 sabit fiyat, gizli ücret yok</li>
      </ul>

      <h2>Sık Sorulanlar</h2>
      <details><summary>Karşılama noktası neresi?</summary><p>Terminal çıkışında isim panosu ile karşılanırsınız.</p></details>
      <details><summary>Gece/erken saatlerde çalışıyor musunuz?</summary><p>Evet, 7/24 hizmet.</p></details>

      <p>
        <WhatsAppReserveButton city={props.citySlug} />
      </p>
    </main>
  );
}