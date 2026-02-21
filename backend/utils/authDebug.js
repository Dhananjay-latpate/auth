/**
 * Debugging utility for authentication flow
 * Provides structured debug information for auth-related operations
 */
const authDebug = {
  /**
   * Log token verification details
   * @param {Object} token - The decoded token
   * @param {string} source - Where the token came from (header, cookie, etc)
   */
  logTokenVerification: (token, source) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `Token from ${source} decoded successfully:`,
        token
          ? {
              id: token.id,
              role: token.role,
              name: token.name,
              email: token.email,
              iat: token.iat,
              exp: token.exp,
            }
          : "Invalid token"
      );
    }
  },

  /**
   * Log permission check
   * @param {string} permission - The permission being checked
   * @param {Object} user - The user object
   * @param {boolean} result - Whether permission was granted
   */
  logPermissionCheck: (permission, user, result) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`Checking permission: ${permission} for user: ${user?.name}`);
      if (result) {
        if (["admin", "superadmin"].includes(user?.role)) {
          console.log(`User has admin/superadmin role, granting permission`);
        } else {
          console.log(`User has explicit permission: ${permission}`);
        }
      } else {
        console.log(`Permission denied: ${permission}`);
      }
    }
  },

  /**
   * Log middleware decision
   * @param {string} path - The current path
   * @param {boolean} isProtected - Whether the route is protected
   * @param {boolean} hasToken - Whether the user has a valid token
   * @param {string} action - The action taken (redirect, allow, etc)
   */
  logMiddlewareDecision: (path, isProtected, hasToken, action) => {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[Middleware] Path: ${path}, Auth: ${isProtected}`);

      if (action === "bypass") {
        console.log(
          "[Middleware] Bypass flag detected, skipping redirect checks"
        );
      } else if (isProtected && !hasToken) {
        console.log("[Middleware] Protected route without token -> login");
      } else if (!isProtected && hasToken) {
        console.log("[Middleware] Auth route with token -> dashboard");
      } else if (action === "loop") {
        console.log("[Middleware] Rapid redirects detected - breaking cycle");
      }
    }
  },
};

module.exports = authDebug;
