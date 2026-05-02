import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_LANDING_PATH, AUTH_PROTECTED_PREFIX } from "@/lib/authPaths";

export function middleware(request: NextRequest) {
  const AUTH_COOKIE = "sb-access-token";
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith(AUTH_PROTECTED_PREFIX)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL(AUTH_LANDING_PATH, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/register",
  ],
};
