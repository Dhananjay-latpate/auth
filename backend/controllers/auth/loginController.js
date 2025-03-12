const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const { sendTokenResponse, sanitizeInput } = require("./helpers");

// Simple in-memory rate limiting (in production, use Redis or a proper rate limiting library)
const loginAttempts = new Map();

const isRateLimited = (ip) => {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];

  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter((time) => now - time < 15 * 60 * 1000);

  // Rate limit: 5 attempts per 15 minutes
  return recentAttempts.length >= 5;
};

const recordLoginAttempt = (ip) => {
  const now = Date.now();
  const attempts = loginAttempts.get(ip) || [];

  // Remove attempts older than 15 minutes
  const recentAttempts = attempts
    .filter((time) => now - time < 15 * 60 * 1000)
    .concat(now);

  loginAttempts.set(ip, recentAttempts);
};

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const clientIp = req.ip || "0.0.0.0";

    // Check if the client is rate limited
    if (isRateLimited(clientIp)) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return next(
        new ErrorResponse(
          "Too many login attempts. Please try again later.",
          429
        )
      );
    }

    let { email, password } = req.body;

    // Sanitize inputs
    email = sanitizeInput(email)?.toLowerCase();

    // Validate email & password
    if (!email || !password) {
      recordLoginAttempt(clientIp);
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    // Find user and include the password field
    const user = await User.findOne({ email }).select("+password");

    // Use consistent error message to prevent user enumeration
    if (!user) {
      recordLoginAttempt(clientIp);
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check for account lock due to too many failed attempts
    if (user.isLocked && user.lockUntil && user.lockUntil > Date.now()) {
      return next(
        new ErrorResponse(
          "Account is temporarily locked. Please try again later or reset your password.",
          401
        )
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Record failed attempts on the user object
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 consecutive failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        await user.save();

        console.log(
          `Account locked for user: ${email} due to too many failed login attempts`
        );
        return next(
          new ErrorResponse(
            "Too many failed login attempts. Account temporarily locked for 30 minutes.",
            401
          )
        );
      }

      await user.save();
      recordLoginAttempt(clientIp);
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.isLocked = false;
    user.lockUntil = null;
    await user.save();

    // If 2FA is enabled, check if we need to verify
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requireTwoFactor: true,
        email: user.email,
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    user.lastLoginIP = clientIp;
    await user.save({ validateBeforeSave: false });

    console.log(`User logged in: ${user.name}, role: ${user.role}`);

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    return next(new ErrorResponse("Error during login process", 500));
  }
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  try {
    // Extra security: invalidate the token in database or blacklist
    // (would require additional implementation)

    res.cookie("token", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error("Logout error:", error);
    next(new ErrorResponse("Error during logout", 500));
  }
});

// @desc      Refresh user token
// @route     GET /api/v1/auth/refresh-token
// @access    Private
exports.refreshToken = asyncHandler(async (req, res, next) => {
  try {
    // User is already available from the protect middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Security check: Has user's role changed or been revoked?
    if (user.active === false) {
      return next(new ErrorResponse("Account has been deactivated", 401));
    }

    // Update last token refresh time for audit purposes
    user.lastTokenRefresh = Date.now();
    await user.save({ validateBeforeSave: false });

    // Generate a new token and send it
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Token refresh error:", error);
    return next(new ErrorResponse("Error refreshing token", 500));
  }
});
