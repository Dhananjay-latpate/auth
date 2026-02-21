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

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/register", authLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful or 2FA required
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/AuthResponse'
 *                 - type: object
 *                   properties:
 *                     success: { type: boolean }
 *                     requireTwoFactor: { type: boolean }
 *                     email: { type: string }
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, login);

/**
 * @swagger
 * /auth/logout:
 *   get:
 *     summary: Logout the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.get("/logout", logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
 */
router.get("/me", protect, userMeLimiter, getMe);

/**
 * @swagger
 * /auth/updatepassword:
 *   put:
 *     summary: Update current user's password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password updated
 *       401:
 *         description: Current password incorrect
 */
router.put("/updatepassword", authLimiter, protect, updatePassword);

/**
 * @swagger
 * /auth/forgotpassword:
 *   post:
 *     summary: Send password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Reset email sent (always returns success to prevent enumeration)
 */
router.post("/forgotpassword", authLimiter, forgotPassword);

/**
 * @swagger
 * /auth/resetpassword/{resettoken}:
 *   put:
 *     summary: Reset password using token from email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: resettoken
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [password, confirmPassword]
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.put("/resetpassword/:resettoken", authLimiter, resetPassword);
router.get("/verifytoken/:resettoken", verifyResetToken);
router.get("/refresh-token", protect, refreshToken);

/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     summary: Set up two-factor authentication
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns QR code and secret for 2FA setup
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     secret: { type: string }
 *                     qrCode: { type: string, description: "Data URL for QR code image" }
 */
router.post("/2fa/setup", protect, setup2FA);

/**
 * @swagger
 * /auth/2fa/enable:
 *   post:
 *     summary: Enable 2FA after verifying setup token
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code from authenticator app
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 */
router.post("/2fa/enable", protect, enable2FA);

/**
 * @swagger
 * /auth/2fa/disable:
 *   post:
 *     summary: Disable two-factor authentication
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit TOTP code to confirm disable
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 */
router.post("/2fa/disable", protect, disable2FA);

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     summary: Verify 2FA token during login
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token]
 *             properties:
 *               email: { type: string, format: email }
 *               token: { type: string, description: "6-digit TOTP code" }
 *     responses:
 *       200:
 *         description: Verification successful, returns JWT
 *       401:
 *         description: Invalid code
 */
router.post("/2fa/verify", authLimiter, verify2FA);

/**
 * @swagger
 * /auth/2fa/recovery-codes:
 *   get:
 *     summary: Generate new recovery codes
 *     tags: [2FA]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: New recovery codes generated
 */
router.get("/2fa/recovery-codes", protect, generateRecoveryCodes);

/**
 * @swagger
 * /auth/2fa/verify-recovery:
 *   post:
 *     summary: Login using a recovery code
 *     tags: [2FA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, recoveryCode]
 *             properties:
 *               email: { type: string, format: email }
 *               recoveryCode: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid recovery code
 */
router.post("/2fa/verify-recovery", authLimiter, verifyRecoveryCode);

// User profile routes - using the profile controller
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/profile/avatar", protect, uploadAvatar);
router.put("/profile/preferences", protect, updatePreferences);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: Get all active sessions for the current user
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of active sessions
 */
router.get("/sessions", protect, getSessions);

/**
 * @swagger
 * /auth/sessions/{sessionId}:
 *   delete:
 *     summary: Revoke a specific session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session revoked
 */
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

/**
 * @swagger
 * /auth/apikeys:
 *   post:
 *     summary: Generate a new API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, description: "Descriptive name for the key" }
 *               permissions: { type: array, items: { type: string } }
 *               expiryDays: { type: number, default: 365 }
 *     responses:
 *       201:
 *         description: API key created (shown only once)
 *   get:
 *     summary: List all API keys for the current user
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of API keys
 */
router.post("/apikeys", protect, generateApiKey);
router.get("/apikeys", protect, listApiKeys);

/**
 * @swagger
 * /auth/apikeys/{keyId}:
 *   delete:
 *     summary: Revoke an API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: keyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API key revoked
 */
router.delete("/apikeys/:keyId", protect, revokeApiKey);

module.exports = router;
