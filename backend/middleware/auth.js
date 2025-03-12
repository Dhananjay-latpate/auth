const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const authDebug = require("../../utils/authDebug"); // Import our debug utility

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;
  let tokenSource = "none";

  console.log("[Auth] User: Not authenticated, Path:", req.path);

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
    console.log("Token from Authorization header:", token);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(
      "Token from Authorization header decoded successfully:",
      decoded
    );

    // Log token verification
    authDebug.logTokenVerification(decoded, tokenSource);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("User not found for id:", decoded.id);
      return next(new ErrorResponse("User no longer exists", 401));
    }

    // If token is older than password update, invalidate it
    if (
      user.passwordUpdatedAt &&
      decoded.iat < user.passwordUpdatedAt.getTime() / 1000
    ) {
      return next(
        new ErrorResponse("Password has been changed, please log in again", 401)
      );
    }

    // If user is locked, deny access
    if (user.isLocked) {
      return next(
        new ErrorResponse("Account locked. Please contact support.", 403)
      );
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

    // For /me endpoint, get the full user data
    if (req.path === "/api/v1/auth/me" || req.path === "/me") {
      console.log("Getting user data for:", user.name);
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

// Check if user has specific permission
exports.hasPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }

    // Super admin and admin have all permissions
    if (["superadmin", "admin"].includes(req.user.role)) {
      return next();
    }

    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      return next(
        new ErrorResponse(
          `User doesn't have permission to perform this action`,
          403
        )
      );
    }
    next();
  };
};
