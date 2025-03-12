import { NextResponse } from "next/server";
import { getCookie } from "cookies-next";

// This function can be marked `async` if using `await` inside
export function middleware(request) {
  // Admin routes middleware
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const token = getCookie("token");
    // If no token, redirect to login
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/admin/:path*", "/profile/:path*", "/dashboard"],
};
