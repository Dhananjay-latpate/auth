/**
 * Custom middleware for logging API requests
 */

const logger = (req, res, next) => {
  // Log basic request information
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${
      req.ip
    }`
  );

  // Log user ID if authenticated
  if (req.user) {
    console.log(`  User: ${req.user.id} (${req.user.email})`);
  }

  // Log request body for certain endpoints while hiding sensitive data
  if (req.body && Object.keys(req.body).length > 0) {
    // Create a sanitized copy of the request body for logging
    const sanitizedBody = { ...req.body };

    // Remove sensitive fields
    if (sanitizedBody.password) sanitizedBody.password = "[REDACTED]";
    if (sanitizedBody.token) sanitizedBody.token = "[REDACTED]";
    if (sanitizedBody.apiKey) sanitizedBody.apiKey = "[REDACTED]";

    console.log(`  Body: ${JSON.stringify(sanitizedBody)}`);
  }

  // Track response time
  const start = Date.now();

  // Listen for the response finish event to log the result
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${
        req.originalUrl
      } completed with status ${res.statusCode} in ${duration}ms`
    );
  });

  next();
};

module.exports = logger;
