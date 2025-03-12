const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
// Use the improved TOTP implementation
const twoFactor = require("../../utils/twoFactorImproved");
const { sendTokenResponse } = require("./helpers");

// @desc      Setup 2FA
// @route     POST /api/v1/auth/2fa/setup
// @access    Private
exports.setup2FA = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Generate new secret
    const { secret, otpauth_url } = twoFactor.generateSecret(
      user.email,
      process.env.APP_NAME || "AuthApp"
    );

    // Log for debugging
    console.log(`Generated 2FA secret for user: ${user.email}`);

    // Store the secret but don't enable 2FA yet
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = false;
    await user.save({ validateBeforeSave: false });

    // Generate QR code
    const qrCodeURL = await twoFactor.generateQRCode(otpauth_url);

    // Return the full QR code data URL directly, not just the base64 part
    // This ensures the frontend can display it properly as an image source
    res.status(200).json({
      success: true,
      data: {
        secret,
        qrCode: qrCodeURL, // Changed to return the full data URL
      },
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return next(
      new ErrorResponse("Error setting up two-factor authentication", 500)
    );
  }
});

// @desc      Verify and enable 2FA
// @route     POST /api/v1/auth/2fa/enable
// @access    Private
exports.enable2FA = asyncHandler(async (req, res, next) => {
  try {
    console.log("Enable 2FA request body:", req.body);
    const { token } = req.body;

    if (!token) {
      return next(
        new ErrorResponse("Please provide a verification token", 400)
      );
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

    const isValid = twoFactor.verifyToken(token, user.twoFactorSecret);
    console.log("Token verification result:", isValid);

    if (!isValid) {
      return next(
        new ErrorResponse("Invalid verification code. Please try again.", 400)
      );
    }

    // Enable 2FA and generate recovery codes if not already present
    user.twoFactorEnabled = true;

    if (!user.recoveryCodes || user.recoveryCodes.length === 0) {
      user.recoveryCodes = twoFactor.generateRecoveryCodes();
    }

    await user.save({ validateBeforeSave: false });

    console.log("2FA successfully enabled for user:", user.email);

    res.status(200).json({
      success: true,
      message: "Two-factor authentication enabled successfully",
    });
  } catch (error) {
    console.error("Enable 2FA error:", error);
    return next(
      new ErrorResponse("Error enabling two-factor authentication", 500)
    );
  }
});

// @desc      Disable 2FA
// @route     POST /api/v1/auth/2fa/disable
// @access    Private
exports.disable2FA = asyncHandler(async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return next(
        new ErrorResponse("Please provide a verification token", 400)
      );
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Make sure 2FA is enabled
    if (!user.twoFactorEnabled) {
      return next(
        new ErrorResponse("Two-factor authentication is not enabled", 400)
      );
    }

    // Verify the token
    const isValid = twoFactor.verifyToken(token, user.twoFactorSecret);

    if (!isValid) {
      return next(new ErrorResponse("Invalid verification code", 400));
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    user.recoveryCodes = undefined;
    await user.save({ validateBeforeSave: false });

    console.log("2FA disabled for user:", user.email);

    res.status(200).json({
      success: true,
      message: "Two-factor authentication disabled successfully",
    });
  } catch (error) {
    console.error("Disable 2FA error:", error);
    return next(
      new ErrorResponse("Error disabling two-factor authentication", 500)
    );
  }
});

// @desc      Verify 2FA token during login
// @route     POST /api/v1/auth/2fa/verify
// @access    Public
exports.verify2FA = asyncHandler(async (req, res, next) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return next(
        new ErrorResponse("Please provide email and verification code", 400)
      );
    }

    const user = await User.findOne({ email }).select("+twoFactorSecret");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if 2FA is enabled for this user
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return next(
        new ErrorResponse(
          "Two-factor authentication is not enabled for this account",
          400
        )
      );
    }

    // Verify the token
    console.log("Verifying login 2FA token for user:", email);
    const isValid = twoFactor.verifyToken(token, user.twoFactorSecret);
    console.log("Token verification result:", isValid);

    if (!isValid) {
      return next(new ErrorResponse("Invalid verification code", 401));
    }

    // Update last login time
    user.lastLogin = Date.now();
    user.lastLoginIP = req.ip;
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("2FA verification error:", error);
    return next(
      new ErrorResponse("Error during two-factor authentication", 500)
    );
  }
});

// @desc      Generate recovery codes
// @route     GET /api/v1/auth/2fa/recovery-codes
// @access    Private
exports.generateRecoveryCodes = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Make sure 2FA is enabled
    if (!user.twoFactorEnabled) {
      return next(
        new ErrorResponse("Two-factor authentication is not enabled", 400)
      );
    }

    // Generate new recovery codes
    const recoveryCodes = twoFactor.generateRecoveryCodes();
    user.recoveryCodes = recoveryCodes;
    await user.save({ validateBeforeSave: false });

    console.log("Generated new recovery codes for user:", user.email);

    res.status(200).json({
      success: true,
      data: {
        recoveryCodes,
      },
    });
  } catch (error) {
    console.error("Generate recovery codes error:", error);
    return next(new ErrorResponse("Error generating recovery codes", 500));
  }
});

// @desc      Verify recovery code
// @route     POST /api/v1/auth/2fa/verify-recovery
// @access    Public
exports.verifyRecoveryCode = asyncHandler(async (req, res, next) => {
  try {
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

    // Check if 2FA is enabled and recovery codes exist
    if (
      !user.twoFactorEnabled ||
      !user.recoveryCodes ||
      user.recoveryCodes.length === 0
    ) {
      return next(new ErrorResponse("Recovery code verification failed", 401));
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

    // Update last login time
    user.lastLogin = Date.now();
    user.lastLoginIP = req.ip;

    await user.save({ validateBeforeSave: false });

    console.log("User logged in via recovery code:", user.email);

    // Send token response
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Recovery code verification error:", error);
    return next(
      new ErrorResponse("Error during recovery code verification", 500)
    );
  }
});
