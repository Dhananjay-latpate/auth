import { NextResponse } from "next/server";
// Remove the import that's causing the error
// import { verifyToken } from "./utils/auth";

// We need to update imports to use dynamic imports for Edge Runtime compatibility
// Import utilities as ESM for Next.js middleware
import { jwtVerify } from "jose";

// Create a simple function to verify tokens in middleware
async function verifyAuthToken(token) {
  if (!token) return null;

  try {
    // Convert JWT_SECRET to Uint8Array as required by jose
    const secretKey = new TextEncoder().encode(
      process.env.JWT_SECRET || "fallbacksecretfordevonly"
    );
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return null;
  }
}

// For middleware, we need to use direct imports rather than require
// since Next.js Edge Runtime doesn't support CommonJS require
const redirectTracker = {
  history: [],
  maxRedirects: 5,
  timeWindow: 3000, // 3 seconds

  trackRedirect(path) {
    const now = Date.now();

    // Clean up old redirects outside the time window
    this.history = this.history.filter(
      (item) => now - item.time < this.timeWindow
    );

    // Add current redirect
    this.history.push({
      path,
      time: now,
    });

    // Check if we've exceeded the maximum redirects in the time window
    if (this.history.length >= this.maxRedirects) {
      return true; // Break the redirect chain
    }

    return false;
  },
};

// Inline authDebug functions for middleware
const logMiddlewareDecision = (path, isProtected, hasToken, action) => {
  console.log(`[Middleware] Path: ${path}, Auth: ${isProtected}`);

  if (action === "bypass") {
    console.log("[Middleware] Bypass flag detected, skipping redirect checks");
  } else if (isProtected && !hasToken) {
    console.log("[Middleware] Protected route without token -> login");
  } else if (!isProtected && hasToken) {
    console.log("[Middleware] Auth route with token -> dashboard");
  } else if (action === "loop") {
    console.log("[Middleware] Rapid redirects detected - breaking cycle");
  }
};

// Auth routes - redirect to dashboard if user is logged in
const authRoutes = ["/login", "/forgot-password", "/reset-password"];

// Register route needs special handling when coming from dashboard
const registerRoute = "/register";

// Protected routes - redirect to login if user is not logged in
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin",
  "/users",
  "/roles",
  "/verify-2fa",
];

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  // Skip middleware for static assets, API routes, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for bypass flags to break redirect loops
  const hasRedirectBypass =
    search.includes("no_redirect=true") ||
    search.includes("bypass=true") ||
    search.includes("logged_out=true");

  // Check if the request is coming from dashboard - improve detection
  const isFromDashboard =
    search.includes("from=dashboard") ||
    search.includes("admin_action=true") || // Also check for admin_action parameter
    request.headers.get("referer")?.includes("/dashboard");

  if (hasRedirectBypass) {
    // Log middleware decision with bypass action
    logMiddlewareDecision(
      pathname,
      protectedRoutes.includes(pathname),
      false,
      "bypass"
    );
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get("token")?.value;
  const hasToken = !!token;
  const isAuthRoute = authRoutes.includes(pathname);
  const isRegisterRoute = pathname === registerRoute;
  const isProtectedRoute = protectedRoutes.includes(pathname);

  // Check for redirect loops
  const inLoop = redirectTracker.trackRedirect(pathname);

  if (inLoop) {
    // Log middleware decision with loop action
    logMiddlewareDecision(pathname, isProtectedRoute, hasToken, "loop");

    // Break the loop by allowing the request through without redirects
    const url = request.nextUrl.clone();
    url.searchParams.set("no_redirect", "true");
    return NextResponse.redirect(url);
  }

  // Log middleware decision for regular flow
  logMiddlewareDecision(pathname, isProtectedRoute, hasToken, "normal");

  // Special handling for register page when user is logged in
  if (isRegisterRoute && hasToken) {
    // If coming from dashboard, allow access to register page
    if (isFromDashboard) {
      console.log(
        "[Middleware] Allowing access to register page from dashboard"
      );
      return NextResponse.next();
    }

    // Otherwise redirect to dashboard as with other auth routes
    const url = new URL("/dashboard", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Regular auth route handling (excluding register with special case above)
  if (isAuthRoute && hasToken) {
    const url = new URL("/dashboard", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isProtectedRoute && !hasToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
