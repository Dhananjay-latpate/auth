const rateLimit = require("express-rate-limit");

// Create a store to track API limits
const apiLimits = {};

// Function to create a rate limiter with configurable options
const createRateLimiter = ({
  windowMs = 15 * 60 * 1000, // 15 minutes by default
  max = 100, // Max 100 requests per window by default
  message = "Too many requests, please try again later.",
  path = "*",
  skipSuccessfulRequests = false, // Count all requests by default
}) => {
  // Create a unique key for the path
  const limitKey = `limit_${path.replace(/\//g, "_")}`;

  // Create the limiter if it doesn't exist
  if (!apiLimits[limitKey]) {
    apiLimits[limitKey] = rateLimit({
      windowMs,
      max,
      message: { success: false, error: message },
      skipSuccessfulRequests,
      // Add custom key generator to handle both IP and user ID
      keyGenerator: (req) => {
        // Use user ID if authenticated, otherwise use IP
        return req.user ? `user_${req.user.id}` : req.ip;
      },
      // Add custom handler to log rate limiting events
      handler: (req, res, next, options) => {
        console.log(
          `[Rate Limit] Path: ${req.path}, IP: ${req.ip}, Exceeded: ${
            options.max
          } requests per ${options.windowMs / 60000} minutes`
        );

        // Return more detailed information for client-side handling
        res.status(options.statusCode).json({
          success: false,
          error: options.message.error,
          retryAfter: Math.ceil(options.windowMs / 1000),
          path: req.path,
        });
      },
      // Skip these types of requests from rate limiting
      skip: (req, res) => {
        // Skip OPTIONS requests (for CORS preflight)
        if (req.method === "OPTIONS") return true;

        // Skip if user is authenticated with valid token - we'll still have per-user limits
        if (req.user && req.path === "/api/v1/auth/me") {
          return true; // Skip the general rate limit for authenticated /me requests
        }

        return false;
      },
    });
  }

  return apiLimits[limitKey];
};

module.exports = {
  createRateLimiter,
  // Predefined limiters for common routes

  // General API limiter - more generous
  apiLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Increased from 200 to 300 requests per window
    message: "Too many API requests, please try again later",
  }),

  // Auth limiter - more restrictive for security
  authLimiter: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, // Increased from 50 to 60 requests per 15-minute window
    message: "Too many authentication attempts, please try again later",
    skipSuccessfulRequests: true, // Don't count successful logins against the limit
  }),

  // User profile limiter
  userLimiter: createRateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // Increased from 50 to 100 requests per window
    message: "Too many user profile requests, please try again later",
  }),

  // Special limiter for /me endpoint that frequently gets called
  userMeLimiter: createRateLimiter({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200, // Increased from 120 to 200 requests per minute (much more generous)
    message: "Too many user information requests, please try again later",
    path: "/api/v1/auth/me",
    skipSuccessfulRequests: true, // Don't count successful requests against the limit
  }),
};
