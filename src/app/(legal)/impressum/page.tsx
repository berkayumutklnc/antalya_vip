import { SITE } from "@/config/site";

export default function ImpressumPage() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4 text-white/80">
      <h1 className="text-2xl font-semibold text-white">Impressum</h1>

      <h2 className="text-lg font-semibold text-white">Angaben gemäß § 5 TMG</h2>
      <p>{SITE.name}</p>
      <p>{SITE.address}</p>

      <h2 className="text-lg font-semibold text-white">Kontakt</h2>
      <p>Telefon: {SITE.phone}</p>
      <p>E-Mail: {SITE.email}</p>

      <h2 className="text-lg font-semibold text-white">Haftungsausschluss</h2>
      <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>

      <h2 className="text-lg font-semibold text-white">Urheberrecht</h2>
      <p>Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem türkischen Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet.</p>
    </main>
  );
}