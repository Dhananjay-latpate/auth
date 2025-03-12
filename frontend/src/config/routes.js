export const ROUTES = {
  protected: ["/dashboard", "/profile", "/admin"],
  auth: ["/login", "/register", "/forgot-password"],
  special: ["/login/verify-2fa", "/login/recovery"],
  public: ["/", "/index"],
};

export const PERMISSIONS = {
  admin: ["manage_users", "manage_roles"],
  moderator: ["manage_content"],
  user: ["read_content"],
};

export const isProtectedRoute = (pathname) =>
  ROUTES.protected.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

export const isAuthRoute = (pathname) =>
  ROUTES.auth.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

export const isSpecialAuthRoute = (pathname) =>
  ROUTES.special.some((route) => pathname.startsWith(route));
