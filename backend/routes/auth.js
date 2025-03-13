const express = require("express");
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  verifyResetToken,
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  generateRecoveryCodes,
  verifyRecoveryCode,
  refreshToken,
  getSessions,
  revokeSession,
  generateApiKey,
  listApiKeys,
  revokeApiKey,
} = require("../controllers/auth/authController");

// Import profile controller functions
const {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  updatePreferences,
} = require("../controllers/profile");

const router = express.Router();

const { protect } = require("../middleware/auth");
const { authLimiter, userMeLimiter } = require("../middleware/rateLimit");

// Apply rate limiters to auth routes
router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/logout", logout);

// Special case for /me endpoint - protect first, THEN apply the rate limiter
// This way authenticated users are identified before rate limiting
router.get("/me", protect, userMeLimiter, getMe);

router.put("/updatepassword", authLimiter, protect, updatePassword);
router.post("/forgotpassword", authLimiter, forgotPassword);
router.put("/resetpassword/:resettoken", authLimiter, resetPassword);
router.get("/verifytoken/:resettoken", verifyResetToken);
router.get("/refresh-token", protect, refreshToken);

// 2FA routes
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);
router.post("/2fa/verify", authLimiter, verify2FA);

// Recovery code routes
router.get("/2fa/recovery-codes", protect, generateRecoveryCodes);
router.post("/2fa/verify-recovery", authLimiter, verifyRecoveryCode);

// User profile routes - using the profile controller
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/profile/avatar", protect, uploadAvatar); // Add avatar upload route
router.put("/profile/preferences", protect, updatePreferences); // Add preferences route

// Session management routes
router.get("/sessions", protect, getSessions);
router.delete("/sessions/:sessionId", protect, revokeSession);
// Fix this route - the problem is here
router.delete("/sessions", protect, async (req, res, next) => {
  try {
    // Pass the request options but not a callback
    await revokeSession(req, res, next);
  } catch (error) {
    next(error);
  }
});

// API key management routes
router.post("/apikeys", protect, generateApiKey);
router.get("/apikeys", protect, listApiKeys);
router.delete("/apikeys/:keyId", protect, revokeApiKey);

module.exports = router;
