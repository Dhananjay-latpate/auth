import { NextResponse } from "next/server";

// Route Definitions
const protectedRoutes = ["/dashboard", "/profile", "/admin"];
const authRoutes = ["/login", "/register", "/forgot-password"];
const specialAuthRoutes = ["/login/verify-2fa", "/login/recovery"];

// Route Check Functions
const isProtectedRoute = (pathname) =>
  protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const isAuthRoute = (pathname) =>
  authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

const isSpecialAuthRoute = (pathname) =>
  specialAuthRoutes.some((route) => pathname.startsWith(route));

// Authentication Logic
const authenticate = (request) => {
  const token = request.cookies.get("token")?.value;
  return token;
};

// Improved detection of navigation source
const detectSourceRoute = (referer) => {
  if (!referer) return null;

  try {
    const refererUrl = new URL(referer);
    const path = refererUrl.pathname;

    // Check which route type the referer belongs to
    if (
      protectedRoutes.some(
        (route) => path === route || path.startsWith(`${route}/`)
      )
    ) {
      return "protected";
    }

    if (
      authRoutes.some((route) => path === route || path.startsWith(`${route}/`))
    ) {
      return "auth";
    }

    return "other";
  } catch (e) {
    console.error(`[Middleware] Error parsing referer: ${referer}`, e);
    return null;
  }
};

// Redirection Functions
const redirectToLogin = (request, pathname) => {
  console.log(
    `[Middleware] No auth token, redirecting to login from ${pathname}`
  );
  const loginUrl = new URL("/login", request.url);

  // Store the original URL as callback
  if (pathname !== "/dashboard") {
    loginUrl.searchParams.set("callbackUrl", pathname);
  }

  return NextResponse.redirect(loginUrl);
};

const redirectToDashboard = (request) => {
  console.log(`[Middleware] Already authenticated, redirecting to dashboard`);
  return NextResponse.redirect(new URL("/dashboard", request.url));
};

// Logging Function
const logMessage = (message) => {
  console.log(`[Middleware] ${message}`);
};

export function middleware(request) {
  // Get the token
  const token = authenticate(request);

  // Extract query parameters
  const url = new URL(request.url);
  const loggedOut = url.searchParams.get("logged_out") === "true";
  const loginRedirect = url.searchParams.get("login_redirect") === "true";
  const logoutIntent = url.searchParams.get("logout") === "true";
  const newAccount = url.searchParams.get("new_account") === "true";

  // Get the request's origin URL
  const origin = url.origin;

  // Get the pathname
  const pathname = request.nextUrl.pathname;

  // Gather request source info
  const referer = request.headers.get("referer") || "";
  const sourceRoute = detectSourceRoute(referer);

  // For debugging
  logMessage(
    `Path: ${pathname}, Token: ${
      token ? "exists" : "none"
    }, Logged out: ${loggedOut}, Logout Intent: ${logoutIntent}, New Account: ${newAccount}`
  );
  logMessage(`Referer: ${referer}`);
  logMessage(`Source route type: ${sourceRoute}`);

  // Check if coming from a protected route
  const comingFromProtectedRoute = sourceRoute === "protected";

  // CASE 1: No token + Protected route = Redirect to login
  if (isProtectedRoute(pathname) && !token) {
    return redirectToLogin(request, pathname);
  }

  // CASE 2: Token + Auth route with specific exceptions
  if (token && isAuthRoute(pathname) && !isSpecialAuthRoute(pathname)) {
    // Don't redirect if explicitly logged_out=true
    if (loggedOut) {
      logMessage(
        `Has token but logged_out=true, allowing access to ${pathname}`
      );
      return NextResponse.next();
    }

    // Don't redirect if it's the register page with new_account flag
    if (pathname === "/register" && newAccount) {
      logMessage(`Allowing access to register page to create new account`);
      return NextResponse.next();
    }

    // Don't redirect if coming from dashboard/protected routes or if has logout intent
    // This breaks potential redirect loops
    if (comingFromProtectedRoute || logoutIntent) {
      logMessage(
        `Allowing access to ${pathname} from protected route or with logout intent`
      );
      return NextResponse.next();
    }

    // Don't redirect if explicitly login_redirect=true
    if (loginRedirect) {
      logMessage(
        `Explicit login redirect requested, allowing access to ${pathname}`
      );
      return NextResponse.next();
    }

    // Otherwise redirect to dashboard
    return redirectToDashboard(request);
  }

  // CASE 3: Root path with token = Redirect to dashboard (with exceptions)
  if ((pathname === "/" || pathname === "/index") && token) {
    // Don't redirect if logged out or explicit logout intent
    if (loggedOut || logoutIntent) {
      return NextResponse.next();
    }

    return redirectToDashboard(request);
  }

  // Default: Allow request to proceed
  return NextResponse.next();
}

// Configure the paths that should be matched by this middleware
export const config = {
  matcher: [
    "/",
    "/index",
    "/dashboard",
    "/profile/:path*",
    "/admin/:path*",
    "/login",
    "/login/:path*",
    "/register",
    "/forgot-password",
    "/reset-password/:path*",
  ],
};
