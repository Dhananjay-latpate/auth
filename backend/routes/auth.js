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
} = require("../controllers/auth/authController");

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

module.exports = router;
