import { NextResponse } from "next/server";

const FALLBACK_COOKIE_NAMES = [
  "token",
  "ds_admin_token",
  "admin_token",
  "accessToken",
  "jwt",
];

function getAuthCookieName() {
  return process.env.ADMIN_AUTH_COOKIE;
}

function hasAuthCookie(request) {
  const explicit = getAuthCookieName();
  if (explicit) return Boolean(request.cookies.get(explicit)?.value);
  return FALLBACK_COOKIE_NAMES.some((name) => Boolean(request.cookies.get(name)?.value));
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const tokenPresent = hasAuthCookie(request);

  if (pathname === "/login") {
    if (tokenPresent) {
      const url = request.nextUrl.clone();
      url.pathname =
        request.nextUrl.searchParams.get("next") || "/admin/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!tokenPresent) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", `${pathname}${request.nextUrl.search || ""}`);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
