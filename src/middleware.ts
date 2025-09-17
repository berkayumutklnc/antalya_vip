import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  // http -> https
  if (req.headers.get("x-forwarded-proto") === "http") {
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