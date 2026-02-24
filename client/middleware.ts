import { type NextRequest, NextResponse } from "next/server";

/**
 * Paths that require the user to be authenticated.
 * Unauthenticated requests are redirected to /signin?next=<original-path>.
 */
const PROTECTED_PATHS = [
  "/profile",
  "/profile/history",
  "/events/create",
  "/organizations/create",
];

/**
 * Prefix patterns for protected dynamic routes (e.g. /events/123/edit).
 */
const PROTECTED_PREFIXES = ["/events/", "/organizations/"];

/**
 * Suffixes that make a dynamic route protected (e.g. id/edit).
 */
const PROTECTED_SUFFIXES = ["/edit"];

function isProtected(pathname: string): boolean {
  // Exact-match protected paths
  if (PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return true;
  }

  // Dynamic segments ending with /edit under events/ or organizations/
  if (
    PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) &&
    PROTECTED_SUFFIXES.some((suffix) => pathname.endsWith(suffix))
  ) {
    return true;
  }

  return false;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isProtected(pathname)) {
    return NextResponse.next();
  }

  const session = request.cookies.get("session");

  if (!session?.value) {
    const signInUrl = new URL("/signin", request.url);
    const fullPath = request.nextUrl.pathname + request.nextUrl.search;
    signInUrl.searchParams.set("next", fullPath);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all paths except:
   * - _next/static  (Next.js static assets)
   * - _next/image   (Next.js image optimisation)
   * - favicon.ico
   * - public assets (files with extensions like .png, .svg, etc.)
   */
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
