import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get("token");
  const url = request.nextUrl.clone();

  // More detailed logging
  console.log(`[Middleware] Path: ${pathname}, Auth: ${token ? "yes" : "no"}`);

  // Check for no_redirect or debug query param to break redirect loops
  const searchParams = request.nextUrl.searchParams;
  const bypassRedirect =
    searchParams.has("no_redirect") || searchParams.has("debug");

  if (bypassRedirect) {
    console.log("[Middleware] Bypass flag detected, skipping redirect checks");
    return NextResponse.next();
  }

  // Auth routes - redirect to dashboard if already logged in
  const authRoutes = ["/login", "/register", "/forgot-password"];
  const isAuthRoute = authRoutes.some(
    (route) => pathname.startsWith(route) || pathname === route
  );

  // Only redirect if the token is actually valid (not just present)
  if (isAuthRoute && token && token.value && token.value.length > 20) {
    console.log("[Middleware] Auth route with valid token -> dashboard");
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Protected routes - redirect to login if not logged in
  const protectedRoutes = ["/dashboard", "/profile", "/settings", "/admin"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && (!token || !token.value)) {
    console.log("[Middleware] Protected route without token -> login");
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);

    // Use timestamp to prevent caching issues and loops
    url.searchParams.set("t", Date.now().toString());
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};
