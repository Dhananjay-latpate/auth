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

// Send token response with enhanced security and sanitized user data
const sendTokenResponse = (user, statusCode, res) => {
  try {
    if (!user || !user._id) {
      throw new Error("Invalid user data for token generation");
    }

    // Use either the model method or the fallback function
    const token = user.getSignedJwtToken?.() || generateToken(user._id);

    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    };

    // Sanitize user data before sending in response
    const sanitizedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    // Remove any sensitive fields that might have been accidentally included
    delete sanitizedUser.password;
    delete sanitizedUser.twoFactorSecret;
    delete sanitizedUser.resetPasswordToken;
    delete sanitizedUser.resetPasswordExpire;

    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      token,
      user: sanitizedUser,
    });
  } catch (error) {
    console.error("Token response error:", error);
    res.status(500).json({
      success: false,
      error: "Error generating authentication token",
    });
  }
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
