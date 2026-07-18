import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const { auth } = NextAuth(authConfig);

// ─── Route Groups ─────────────────────────────────────────────────────────────

const PUBLIC_ROUTES = ["/login", "/register", "/api/auth", "/api/db-push"];
const AUTH_ROUTES = ["/login", "/register"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

// ─── Middleware ───────────────────────────────────────────────────────────────

export default auth((req: NextRequest & { auth: { user?: { id: string; role: string } } | null }) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthRoute(nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect all non-public routes
  if (!isLoggedIn && !isPublicRoute(nextUrl.pathname)) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl)
    );
  }

  // Root redirect
  if (nextUrl.pathname === "/") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
