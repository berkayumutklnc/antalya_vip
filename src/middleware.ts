import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // http -> https
  // Production'da (VERCEL veya NODE_ENV=production) http isteklerini https'ye yönlendir
  const isProd = process.env.NEXT_PUBLIC_VERCEL === "1" || process.env.NODE_ENV === "production";
  if (isProd && req.headers.get("x-forwarded-proto") === "http") {
    return NextResponse.redirect(`https://${req.headers.get("host")}${req.nextUrl.pathname}${req.nextUrl.search}`, 301);
  }
  // trailing slash kaldır
  const url = req.nextUrl;
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}