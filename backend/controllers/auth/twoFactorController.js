const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
// Change this import to use the improved TOTP implementation
const twoFactor = require("../../utils/twoFactorImproved");
const { sendTokenResponse } = require("./helpers");

// @desc      Setup 2FA
// @route     POST /api/v1/auth/2fa/setup
// @access    Private
exports.setup2FA = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Generate new secret
  const { secret, otpauth_url } = twoFactor.generateSecret(user.email);

  // Log for debugging
  console.log("Generated 2FA secret for user:", user.email);

  // Store the secret but don't enable 2FA yet
  user.twoFactorSecret = secret;
  user.twoFactorEnabled = false;

  await user.save();

  // Generate QR code
  const qrCode = await twoFactor.generateQRCode(otpauth_url);

  res.status(200).json({
    success: true,
    data: {
      secret,
      qrCode,
    },
  });
});

// @desc      Verify and enable 2FA
// @route     POST /api/v1/auth/2fa/enable
// @access    Private
exports.enable2FA = asyncHandler(async (req, res, next) => {
  console.log("Enable 2FA request body:", req.body);
  const { token } = req.body;

  if (!token) {
    return next(new ErrorResponse("Please provide a verification token", 400));
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Verify the token against user's secret
  if (!user.twoFactorSecret) {
    return next(
      new ErrorResponse(
        "Two-factor authentication not set up. Please complete setup first.",
        400
      )
    );
  }

  console.log(`Attempting to verify token: ${token} for user: ${user.email}`);
  console.log(`User's 2FA secret: ${user.twoFactorSecret}`);

  const isValid = twoFactor.verifyToken(token, user.twoFactorSecret);
  console.log("Token verification result:", isValid);

  if (!isValid) {
    return next(
      new ErrorResponse("Invalid verification code. Please try again.", 400)
    );
  }

  // Enable 2FA
  user.twoFactorEnabled = true;
  await user.save();

  console.log("2FA successfully enabled for user:", user.email);

  res.status(200).json({
    success: true,
    message: "Two-factor authentication enabled successfully",
  });
});

// @desc      Disable 2FA
// @route     POST /api/v1/auth/2fa/disable
// @access    Private
exports.disable2FA = asyncHandler(async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return next(new ErrorResponse("Please provide a token", 400));
  }

  const user = await User.findById(req.user.id);

  // Make sure 2FA is enabled
  if (!user.twoFactorEnabled) {
    return next(
      new ErrorResponse("Two-factor authentication is not enabled", 400)
    );
  }

  // Verify the token
  const isValid = twoFactor.verifyToken(token, user.twoFactorSecret);

  if (!isValid) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Disable 2FA
  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Two-factor authentication disabled successfully",
  });
});

// @desc      Verify 2FA token during login
// @route     POST /api/v1/auth/2fa/verify
// @access    Public
exports.verify2FA = asyncHandler(async (req, res, next) => {
  const { email, token } = req.body;

  if (!email || !token) {
    return next(new ErrorResponse("Please provide email and token", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Verify the token
  console.log("Verifying login 2FA token for user:", email);
  const isValid = twoFactor.verifyToken(token, user.twoFactorSecret);
  console.log("Token verification result:", isValid);

  if (!isValid) {
    return next(new ErrorResponse("Invalid verification code", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Generate recovery codes
// @route     GET /api/v1/auth/2fa/recovery-codes
// @access    Private
exports.generateRecoveryCodes = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // Make sure 2FA is enabled
  if (!user.twoFactorEnabled) {
    return next(
      new ErrorResponse("Two-factor authentication is not enabled", 400)
    );
  }

  // Generate new recovery codes
  const recoveryCodes = user.generateRecoveryCodes();
  await user.save();

  res.status(200).json({
    success: true,
    data: {
      recoveryCodes,
    },
  });
});

// @desc      Verify recovery code
// @route     POST /api/v1/auth/2fa/verify-recovery
// @access    Public
exports.verifyRecoveryCode = asyncHandler(async (req, res, next) => {
  const { email, recoveryCode } = req.body;

  if (!email || !recoveryCode) {
    return next(
      new ErrorResponse("Please provide email and recovery code", 400)
    );
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if the provided code matches any of the recovery codes
  const validRecoveryCode = user.recoveryCodes.includes(recoveryCode);

  if (!validRecoveryCode) {
    return next(new ErrorResponse("Invalid recovery code", 401));
  }

  // Remove the used recovery code
  user.recoveryCodes = user.recoveryCodes.filter(
    (code) => code !== recoveryCode
  );
  await user.save();

  // Send token response
  sendTokenResponse(user, 200, res);
});
