/**
 * SEO helpers — metadata builders, hreflang, canonical.
 *
 * Centralises metadata generation so individual pages
 * don't duplicate boilerplate.
 */

import type { Metadata } from "next";
import { SITE } from "@/config/site";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://zenturotravel.com";

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
