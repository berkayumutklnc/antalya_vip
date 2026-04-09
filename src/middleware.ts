import { NextResponse, type NextRequest } from "next/server";

const SUPPORTED_LANGS = ["de", "en", "tr", "ru"];
const DEFAULT_LANG = "de";

function detectLang(req: NextRequest): string {
  // 1. ?lang= query param (highest priority)
  const qLang = req.nextUrl.searchParams.get("lang")?.toLowerCase();
  if (qLang && SUPPORTED_LANGS.includes(qLang)) return qLang;

  // 2. Existing cookie
  const cookieLang = req.cookies.get("lang_public")?.value?.toLowerCase();
  if (cookieLang && SUPPORTED_LANGS.includes(cookieLang)) return cookieLang;

  // 3. Accept-Language header
  const accept = req.headers.get("accept-language") || "";
  for (const part of accept.split(",")) {
    const code = part.trim().split(";")[0].split("-")[0].toLowerCase();
    if (SUPPORTED_LANGS.includes(code)) return code;
  }

  return DEFAULT_LANG;
}

export function middleware(req: NextRequest) {
  const isProd = process.env.NEXT_PUBLIC_VERCEL === "1" || process.env.NODE_ENV === "production";
  if (isProd && req.headers.get("x-forwarded-proto") === "http") {
    return NextResponse.redirect(`https://${req.headers.get("host")}${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }
  const url = req.nextUrl;
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }

  const lang = detectLang(req);
  const res = NextResponse.next();
  // Set cookie so client & server share the same language
  res.cookies.set("lang_public", lang, { path: "/", maxAge: 31536000 });
  // Pass lang to server components via header
  res.headers.set("x-lang", lang);
  return res;
}