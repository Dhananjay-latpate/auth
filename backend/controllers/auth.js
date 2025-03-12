const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const crypto = require("crypto");
// Change this import to use the improved TOTP implementation
const twoFactor = require("../utils/twoFactorImproved");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields",
      });
    }

    // Check if user already exists - case insensitive search to prevent duplicates with different case
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingUser) {
      console.log(`Registration attempted with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        error: "This email address is already registered",
        code: 11000,
        field: "email",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: "user", // Default role
    });

    // Generate and send token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error - this is a fallback if the initial check misses
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        error: `An account with this ${field} (${value}) already exists`,
        code: 11000,
        field: field,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
        validationError: true,
      });
    }

    // Handle other errors
    res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  try {
    // Use either the model method or the fallback function
    const token = user.getSignedJwtToken?.() || generateToken(user);

    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(statusCode)
      .cookie("token", token, options)
      .json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          permissions: user.permissions || [],
        },
      });
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({
      success: false,
      error: "Error generating authentication token",
    });
  }
};

// Modify login handler to prevent multiple token generations
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(
        new ErrorResponse("Please provide an email and password", 400)
      );
    }

    // Find user and include the password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // If 2FA is enabled, check if we need to verify
    if (user.twoFactorEnabled) {
      return res.status(200).json({
        success: true,
        requireTwoFactor: true,
        email: user.email,
      });
    }

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
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // User is already set in req from the protect middleware
  console.log("Getting user data for:", req.user.name);

  // Fetch fresh user data with role information
  const user = await User.findById(req.user.id).populate({
    path: "role",
    select: "name permissions",
  });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  // If we're in frontend development mode, use the frontend URL
  const frontendUrl = process.env.FRONTEND_URL || `http://localhost:3000`;
  const frontendResetUrl = `${frontendUrl}/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please visit: \n\n ${frontendResetUrl}`;

  const html = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because you (or someone else) has requested the reset of a password.</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${frontendResetUrl}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
    <p>This link is valid for 10 minutes.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
      html,
    });

    res.status(200).json({
      success: true,
      data: "Email sent",
    });
  } catch (err) {
    console.error(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Verify password reset token
// @route     GET /api/v1/auth/verifytoken/:resettoken
// @access    Public
exports.verifyResetToken = asyncHandler(async (req, res, next) => {
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
    return next(new ErrorResponse("Invalid token", 400));
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

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

// @desc      Refresh user token
// @route     GET /api/v1/auth/refresh-token
// @access    Private
exports.refreshToken = asyncHandler(async (req, res, next) => {
  // User is already available from the protect middleware
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Generate a new token and send it
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

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, createdByAdmin } = req.body;

  // Check if this registration is being done by an admin
  let userRole = "user"; // Default role

  // If this is an admin-created user and the requester is an admin
  if (
    createdByAdmin &&
    req.user &&
    ["admin", "superadmin"].includes(req.user.role)
  ) {
    // Allow role specification for admin-created users
    userRole = role || "user";
    console.log(
      `Admin ${req.user.name} is creating a new user with role: ${userRole}`
    );
  }

  // Create user with appropriate role
  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
    createdBy: req.user ? req.user._id : null, // Track who created this user
  });

  sendTokenResponse(user, 200, res);
});
