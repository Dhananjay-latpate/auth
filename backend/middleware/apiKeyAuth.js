const ApiKey = require("../models/ApiKey");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("./async");

/**
 * Middleware to authenticate requests using API keys
 */
exports.apiKeyAuth = asyncHandler(async (req, res, next) => {
  let apiKey;

  // Extract API key from header or query parameter
  if (req.headers["x-api-key"]) {
    apiKey = req.headers["x-api-key"];
  } else if (req.query.apiKey) {
    apiKey = req.query.apiKey;
  }

  // Check if API key is provided
  if (!apiKey) {
    return next(new ErrorResponse("API key is required", 401));
  }

  try {
    // Verify the API key
    const verifiedKey = await ApiKey.verifyKey(apiKey);

    if (!verifiedKey) {
      return next(new ErrorResponse("Invalid API key", 401));
    }

    // Check if the key is expired
    if (verifiedKey.expiresAt < Date.now()) {
      return next(new ErrorResponse("API key has expired", 401));
    }

    // Check IP restrictions if defined
    if (verifiedKey.ipAllowList && verifiedKey.ipAllowList.length > 0) {
      const clientIp = req.ip || req.connection.remoteAddress;
      if (!verifiedKey.ipAllowList.includes(clientIp)) {
        return next(
          new ErrorResponse("IP address not allowed for this API key", 403)
        );
      }
    }

    // Find the user that owns this key
    const user = await User.findById(verifiedKey.user);

    if (!user || !user.active) {
      return next(
        new ErrorResponse(
          "User associated with this API key not found or inactive",
          401
        )
      );
    }

    // Attach API key and user info to the request
    req.apiKey = verifiedKey;
    req.user = user;

    // Log API key usage (optional)
    console.log(`API key used: ${verifiedKey.name} by user: ${user.email}`);

    next();
  } catch (error) {
    console.error("API key authentication error:", error);
    return next(new ErrorResponse("API key authentication failed", 401));
  }
});

/**
 * Middleware to check API key permissions
 */
exports.requireApiKeyPermission = (permission) => {
  return (req, res, next) => {
    // Make sure req.apiKey exists
    if (!req.apiKey) {
      return next(new ErrorResponse("No API key found in request", 401));
    }

    // Check if the API key has the required permission
    if (!req.apiKey.hasPermission(permission)) {
      return next(
        new ErrorResponse(
          `API key doesn't have '${permission}' permission`,
          403
        )
      );
    }

    next();
  };
};
