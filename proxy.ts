import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from "@/features/shared/i18n/locale";
import { NEXT_LOCALE_COOKIE } from "@/features/shared/i18n/locale-cookie";

function pickBestLocale(acceptLanguage: string): Locale | null {
  const parts = acceptLanguage.split(",");
  const candidates: { tag: string; q: number }[] = [];

  for (const part of parts) {
    const [langPart, ...params] = part.trim().split(";").map((s) => s.trim());
    if (!langPart) continue;
    let q = 1;
    for (const p of params) {
      const [k, v] = p.split("=").map((s) => s.trim());
      if (k?.toLowerCase() === "q" && v) {
        const parsed = Number.parseFloat(v);
        if (!Number.isNaN(parsed)) q = parsed;
      }
    }
    candidates.push({ tag: langPart.toLowerCase(), q });
  }

  candidates.sort((a, b) => b.q - a.q);

  for (const { tag } of candidates) {
    const base = tag.split("-")[0] ?? tag;
    if (isLocale(base)) return base;
  }

  return null;
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/");
  const first = segments[1];

  if (first && isLocale(first)) {
    return NextResponse.next();
  }

  const cookieLocale = request.cookies.get(NEXT_LOCALE_COOKIE)?.value;
  let target: Locale = DEFAULT_LOCALE;

  if (cookieLocale && isLocale(cookieLocale)) {
    target = cookieLocale;
  } else {
    const accept = request.headers.get("accept-language") ?? "";
    target = pickBestLocale(accept) ?? DEFAULT_LOCALE;
  }

  const url = request.nextUrl.clone();
  const suffix = pathname === "/" ? "" : pathname;
  url.pathname = `/${target}${suffix}`;

  const response = NextResponse.redirect(url);
  response.cookies.set(NEXT_LOCALE_COOKIE, target, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: false,
  });

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
