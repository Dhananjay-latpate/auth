/**
 * Logger middleware for authentication and authorization events
 * Creates a structured format for authentication-related logs
 */
const logger = (req, res, next) => {
  // Log authentication-related data and actions
  const originalLog = console.log;

  // Enhanced logging for authentication events
  const authLog = (message, data = {}) => {
    if (process.env.NODE_ENV !== "production") {
      if (data && Object.keys(data).length > 0) {
        originalLog(`[Auth] ${message}`, data);
      } else {
        originalLog(`[Auth] ${message}`);
      }
    }
  };

  // Attach logger to req object for use in route handlers
  req.authLog = authLog;

  // Log request path and auth status
  if (
    req.path &&
    req.path !== "/_next/static" &&
    !req.path.includes("/_next/")
  ) {
    const user = req.user
      ? `${req.user.name}, role: ${req.user.role}`
      : "Not authenticated";
    authLog(`User: ${user}, Path: ${req.path}`);
  }

  next();
};

module.exports = logger;
