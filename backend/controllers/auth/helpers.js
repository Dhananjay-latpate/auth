const jwt = require("jsonwebtoken");

// Generate JWT token with enhanced security
const generateToken = (userId) => {
  try {
    if (!userId) throw new Error("User ID is required for token generation");

    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "30d",
      audience: process.env.JWT_AUDIENCE || "auth-api",
      issuer: process.env.JWT_ISSUER || "auth-service",
    });
  } catch (error) {
    console.error("Token generation error:", error);
    throw new Error("Failed to generate authentication token");
  }
};

/**
 * Get JWT token, create cookie, and send response
 * @param {Object} user - User object
 * @param {number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {Object} [userData] - Optional user data to send in response
 */
const sendTokenResponse = async (user, statusCode, res, userData = null) => {
  // Create token
  const token = user.getSignedJwtToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // Set secure flag in production
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // Register this session in the user's sessions array using the session service
  try {
    const deviceInfo = res.req.headers["user-agent"] || "Unknown device";
    const ipAddress = res.req.ip || res.req.connection.remoteAddress;

    // Import the session service
    const sessionService = require("../../services/sessionService");

    // Create a new session
    const session = await sessionService.createSession(
      user,
      token,
      deviceInfo,
      ipAddress
    );

    // Set this as the current session in the user model
    user.currentSession = session._id;
    await user.save({ validateBeforeSave: false });
  } catch (error) {
    console.error("Error registering session:", error);
    // Continue anyway, don't fail the login just because session tracking failed
  }

  const responseBody = {
    success: true,
    token,
  };

  // Add user data to response if provided
  if (userData) {
    responseBody.data = userData;
  }

  res.status(statusCode).cookie("token", token, options).json(responseBody);
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex && emailRegex.test(email);
};

// Validate password strength
const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;

  // Check for at least one uppercase, one lowercase, one number, and one special character
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Sanitize input to prevent injection attacks
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, "") // Prevent basic HTML injection
    .trim(); // Remove leading/trailing whitespace
};

module.exports = {
  generateToken,
  sendTokenResponse,
  isValidEmail,
  isStrongPassword,
  sanitizeInput,
};
