/**
 * SEO helpers — metadata builders, hreflang, canonical.
 *
 * Centralises metadata generation so individual pages
 * don't duplicate boilerplate.
 */

import type { Metadata } from "next";
import { SITE } from "@/config/site";
import type { TransferRoute } from "@/content/transfers";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.zenturotravel.com.tr";

// ---------------------------------------------------------------------------
// Transfer page metadata builder
// ---------------------------------------------------------------------------

export interface TransferMetaInput {
  title: string;
  description: string;
  canonical: string;
  /** All supported locales' paths for hreflang (same path, different ?lang=) */
  locales?: Array<{ lang: string; href: string }>;
}

export function buildTransferMetadata(input: TransferMetaInput): Metadata {
  const url = `${BASE_URL}${input.canonical}`;

  const alternates: Metadata["alternates"] = {
    canonical: input.canonical,
    languages: {} as Record<string, string>,
  };

  // Add hreflang alternates for all supported languages
  for (const locale of SITE.supportedLangs) {
    (alternates.languages as Record<string, string>)[locale] =
      `${url}?lang=${locale}`;
  }

  return {
    title: input.title,
    description: input.description,
    alternates,
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title: input.title,
      description: input.description,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
  };
}

// ---------------------------------------------------------------------------
// Generic page metadata builder (for info/legal pages)
// ---------------------------------------------------------------------------

/**
 * Lang-aware metadata generator for transfer pages.
 * Reads ?lang= from searchParams and picks the matching content.
 */
export function generateTransferMeta(
  route: TransferRoute,
  searchParams: { lang?: string },
): Metadata {
  const lang = (SITE.supportedLangs as readonly string[]).includes(searchParams.lang ?? "")
    ? (searchParams.lang as "de" | "en" | "tr" | "ru")
    : "de";
  const c = route.content[lang];
  return buildTransferMetadata({
    title: c.metaTitle,
    description: c.metaDescription,
    canonical: `/${route.slug}`,
  });
}

// ---------------------------------------------------------------------------

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  canonical: string;
  noindex?: boolean;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.canonical },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      url: `${BASE_URL}${opts.canonical}`,
      siteName: SITE.name,
      title: opts.title,
      description: opts.description,
    },
  };
}

export function buildLocalizedPageMetadata(opts: {
  canonical: string;
  lang: "de" | "en" | "tr" | "ru";
  localized: Record<"de" | "en" | "tr" | "ru", { title: string; description: string }>;
  noindex?: boolean;
}): Metadata {
  const current = opts.localized[opts.lang] ?? opts.localized.de;
  const canonicalUrl = `${BASE_URL}${opts.canonical}`;

  return {
    title: current.title,
    description: current.description,
    alternates: {
      canonical: opts.canonical,
      languages: {
        de: `${canonicalUrl}?lang=de`,
        en: `${canonicalUrl}?lang=en`,
        tr: `${canonicalUrl}?lang=tr`,
        ru: `${canonicalUrl}?lang=ru`,
      },
    },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "website",
      url: canonicalUrl,
      siteName: SITE.name,
      title: current.title,
      description: current.description,
    },
    twitter: {
      card: "summary_large_image",
      title: current.title,
      description: current.description,
    },
  };
}
