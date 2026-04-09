import Link from "next/link";
import { TRANSFER_ROUTES } from "@/content/transfers";

const HEADING: Record<string, string> = {
  tr: "Diğer Transfer Rotaları",
  de: "Weitere Transfer-Routen",
  en: "Other Transfer Routes",
  ru: "Другие направления",
};

export default function RelatedTransfers({
  slugs,
  currentSlug,
  lang,
}: {
  slugs: string[];
  currentSlug: string;
  lang: string;
}) {
  const related = slugs
    .filter((s) => s !== currentSlug)
    .map((s) => TRANSFER_ROUTES.find((r) => r.slug === s))
    .filter(Boolean);

  if (!related.length) return null;

  const validLang = (["tr", "de", "en", "ru"] as const).includes(lang as "tr")
    ? (lang as "tr" | "de" | "en" | "ru")
    : "tr";

  return (
    <section>
      <h2 className="text-xl font-bold mb-4">{HEADING[lang] || HEADING.en}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((route) => {
          if (!route) return null;
          const c = route.content[validLang];
          return (
            <Link
              key={route.slug}
              href={`/${route.slug}`}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-4 hover:bg-white/[0.05] transition-colors"
            >
              <div className="font-medium text-white">{c.h1}</div>
              <div className="mt-1 text-sm text-white/50">
                {route.distanceKm > 0 ? `~${route.distanceKm} km • ${route.durationMin}` : c.metaDescription.slice(0, 80)}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
