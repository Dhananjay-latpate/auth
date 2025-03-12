const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const crypto = require("crypto");
const sendEmail = require("../../utils/sendEmail");
const {
  sendTokenResponse,
  isStrongPassword,
  sanitizeInput,
} = require("./helpers");

// Simple in-memory rate limiting for password reset requests
const resetAttempts = new Map();

const isResetRateLimited = (email) => {
  const now = Date.now();
  const attempts = resetAttempts.get(email) || [];

  // Remove attempts older than 15 minutes
  const recentAttempts = attempts.filter((time) => now - time < 15 * 60 * 1000);

  // Rate limit: 3 attempts per 15 minutes
  return recentAttempts.length >= 3;
};

const recordResetAttempt = (email) => {
  const now = Date.now();
  const attempts = resetAttempts.get(email) || [];

  // Remove attempts older than 15 minutes
  const recentAttempts = attempts
    .filter((time) => now - time < 15 * 60 * 1000)
    .concat(now);

  resetAttempts.set(email, recentAttempts);
};

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      // Security: increment failed attempts
      user.passwordUpdateFailures = (user.passwordUpdateFailures || 0) + 1;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Current password is incorrect", 401));
    }

    const { newPassword } = req.body;

    // Validate password strength
    if (!isStrongPassword(newPassword)) {
      return next(
        new ErrorResponse(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
          400
        )
      );
    }

    // Check that new password is different from old password
    if (await user.matchPassword(newPassword)) {
      return next(
        new ErrorResponse(
          "New password cannot be the same as current password",
          400
        )
      );
    }

    user.password = newPassword;
    user.passwordUpdatedAt = Date.now();
    user.passwordUpdateFailures = 0; // Reset failed attempts counter

    await user.save();

    // Security: Log this important security action
    console.log(`Password updated for user: ${user.email}`);

    // Optionally send email notification of password change
    try {
      await sendEmail({
        email: user.email,
        subject: "Your password has been changed",
        message:
          "Your password has been changed successfully. If you didn't make this change, please contact support immediately.",
      });
    } catch (emailError) {
      console.error(
        "Failed to send password change notification email",
        emailError
      );
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Password update error:", error);
    return next(new ErrorResponse("Error updating password", 500));
  }
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  try {
    let { email } = req.body;

    if (!email) {
      return next(new ErrorResponse("Please provide an email address", 400));
    }

    email = sanitizeInput(email)?.toLowerCase();

    // Rate limiting
    if (isResetRateLimited(email)) {
      console.log(`Password reset rate limit exceeded for: ${email}`);
      return next(
        new ErrorResponse(
          "Too many reset attempts. Please try again later.",
          429
        )
      );
    }

    recordResetAttempt(email);

    const user = await User.findOne({ email });

    // Don't reveal if the account exists or not for security
    if (!user) {
      // Security: Send a success response even if user doesn't exist
      // This prevents user enumeration
      return res.status(200).json({
        success: true,
        message: "If a user with that email exists, a reset link has been sent",
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // If we're in frontend development mode, use the frontend URL
    const frontendUrl = process.env.FRONTEND_URL || `http://localhost:3000`;
    const frontendResetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit: \n\n ${frontendResetUrl}\n\nThis link is valid for 10 minutes.`;

    const html = `
      <h1>Password Reset Request</h1>
      <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${frontendResetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p>This link is valid for 10 minutes.</p>
      <p>IP Address of requestor: ${req.ip || "Unknown"}</p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message,
        html,
      });

      // Log the action for security audit
      console.log(
        `Password reset email sent to: ${user.email}, IP: ${
          req.ip || "Unknown"
        }`
      );

      res.status(200).json({
        success: true,
        message: "If a user with that email exists, a reset link has been sent",
      });
    } catch (err) {
      console.error("Failed to send password reset email:", err);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse("Email could not be sent", 500));
    }
  } catch (error) {
    console.error("Forgot password error:", error);
    return next(new ErrorResponse("Error processing request", 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    const { password, confirmPassword } = req.body;

    // Validate password strength
    if (!isStrongPassword(password)) {
      return next(
        new ErrorResponse(
          "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
          400
        )
      );
    }

    // Ensure passwords match
    if (password !== confirmPassword) {
      return next(new ErrorResponse("Passwords do not match", 400));
    }

    // Check that new password is different from old one
    if (user.password && (await user.matchPassword(password))) {
      return next(
        new ErrorResponse(
          "New password cannot be the same as current password",
          400
        )
      );
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordUpdatedAt = Date.now();

    await user.save();

    // Log this security action
    console.log(
      `Password reset completed for user: ${user.email}, IP: ${
        req.ip || "Unknown"
      }`
    );

    // Optionally send confirmation email
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Completed",
        message: `Your password has been reset successfully. If you didn't make this change, please contact support immediately.`,
      });
    } catch (emailError) {
      console.error(
        "Failed to send password reset confirmation email",
        emailError
      );
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Password reset error:", error);
    return next(new ErrorResponse("Error resetting password", 500));
  }
});

// @desc      Verify password reset token
// @route     GET /api/v1/auth/verifytoken/:resettoken
// @access    Public
exports.verifyResetToken = asyncHandler(async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse("Invalid or expired token", 400));
    }

    res.status(200).json({
      success: true,
      data: {},
      message: "Token is valid",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return next(new ErrorResponse("Error verifying token", 500));
  }
});
