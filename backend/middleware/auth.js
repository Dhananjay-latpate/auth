const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const authDebug = require("../../utils/authDebug"); // Import our debug utility

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  let tokenSource = "none";

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    // Extract token from Bearer token in header
    // Make sure we properly handle any whitespace or malformation
    const parts = req.headers.authorization.split(" ");
    if (parts.length >= 2) {
      token = parts[1].trim();
      tokenSource = "Authorization header";
      console.log("Authorization header:", req.headers.authorization);
    }
  } else if (req.cookies && req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token;
    tokenSource = "Cookie";
    console.log("Cookie token exists:", true);
  } else {
    console.log("No authorization token found");
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }

  try {
    // Ensure token is valid format
    if (token === "undefined" || token === "null") {
      return next(new ErrorResponse("Invalid token format", 401));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Log token verification
    authDebug.logTokenVerification(decoded, tokenSource);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("User not found for id:", decoded.id);
      return next(new ErrorResponse("User no longer exists", 401));
    }

    if (!user.active) {
      return next(new ErrorResponse("User account is deactivated", 401));
    }

    // Add user info to request object
    req.user = user;
    console.log(`User attached to request: ${user.name} ${user.role}`);

    // Set a flag if this is an admin creating a user
    if (
      req.originalUrl.includes("/register") &&
      ["admin", "superadmin"].includes(user.role)
    ) {
      req.isAdminCreatingUser = true;
      console.log("Admin creating user detected");
    }

    next();
  } catch (err) {
    console.error("Token verification failed:", err.message);

    // Clean up malformed tokens from cookies to prevent repeated failures
    if (err.message === "jwt malformed" && req.cookies && req.cookies.token) {
      res.clearCookie("token");
      console.log("Cleared malformed token cookie");
    }

    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
});

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Make sure req.user exists
    if (!req.user) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    // Log for debugging
    console.log(
      `Authorizing user role: ${req.user.role}, Required roles:`,
      roles
    );

    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }

    next();
  };
};

// Check for specific permissions
exports.checkPermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    // Make sure req.user exists
    if (!req.user) {
      return next(new ErrorResponse("User not authenticated", 401));
    }

    // Log for debugging
    console.log(`Checking permission: ${permission} for user:`, req.user.name);

    // Admin and superadmin have all permissions
    if (["admin", "superadmin"].includes(req.user.role)) {
      console.log("User has admin/superadmin role, granting permission");
      return next();
    }

    // Check if user has the required permission
    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      console.log("User does not have required permission");
      return next(
        new ErrorResponse(
          `User does not have the ${permission} permission to access this route`,
          403
        )
      );
    }

    // Log permission check with failure
    authDebug.logPermissionCheck(permission, req.user, false);

    console.log("Permission granted");
    next();
  });
};
