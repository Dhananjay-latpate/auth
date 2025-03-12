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
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.put("/updatepassword", protect, updatePassword);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/verifytoken/:resettoken", verifyResetToken);
router.get("/refresh-token", protect, refreshToken);

// 2FA routes
router.post("/2fa/setup", protect, setup2FA);
router.post("/2fa/enable", protect, enable2FA);
router.post("/2fa/disable", protect, disable2FA);
router.post("/2fa/verify", verify2FA);

// Recovery code routes
router.get("/2fa/recovery-codes", protect, generateRecoveryCodes);
router.post("/2fa/verify-recovery", verifyRecoveryCode);

module.exports = router;
