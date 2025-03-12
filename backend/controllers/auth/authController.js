const User = require("../../models/User");
const ErrorResponse = require("../../utils/errorResponse");
const asyncHandler = require("../../middleware/async");
const crypto = require("crypto");
const { sendTokenResponse } = require("./helpers");
const twoFactor = require("../../utils/twoFactorImproved");

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide email and password", 400));
  }

  try {
    console.log(`[Auth] Login attempt for: ${email}`);

    // Find user by email and include password field
    const user = await User.findOne({ email }).select(
      "+password +twoFactorSecret +twoFactorEnabled"
    );

    // Check if user exists
    if (!user) {
      console.log(`[Auth] Login failed - user not found: ${email}`);
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Check if account is locked
    if (user.isLocked) {
      console.log(`[Auth] Login attempt for locked account: ${email}`);
      if (user.lockUntil && user.lockUntil > Date.now()) {
        return next(
          new ErrorResponse(
            `Account is temporarily locked. Try again later.`,
            403
          )
        );
      } else {
        // Reset lock status if the lock period has expired
        user.isLocked = false;
        user.lockUntil = undefined;
        user.failedLoginAttempts = 0;
        await user.save({ validateBeforeSave: false });
      }
    }

    // Check if password matches
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      console.log(`[Auth] Login failed - password mismatch: ${email}`);

      // Increment failed login attempts
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.isLocked = true;
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await user.save({ validateBeforeSave: false });
        return next(
          new ErrorResponse(
            "Account locked due to too many failed attempts. Try again in 15 minutes.",
            403
          )
        );
      }

      await user.save({ validateBeforeSave: false });
      return next(new ErrorResponse("Invalid credentials", 401));
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;

    // Check if two-factor authentication is enabled
    if (user.twoFactorEnabled) {
      console.log(`[Auth] 2FA required for: ${email}`);
      user.lastLogin = Date.now();
      await user.save({ validateBeforeSave: false });

      return res.status(200).json({
        success: true,
        requireTwoFactor: true,
        email: user.email,
      });
    }

    // Update last login time and IP address
    user.lastLogin = Date.now();
    user.lastLoginIP = req.ip;
    await user.save({ validateBeforeSave: false });

    console.log(`[Auth] Login successful for: ${email}`);

    // Get user data for the response but exclude sensitive information
    const userData = await User.findById(user.id).select(
      "-password -twoFactorSecret -recoveryCodes"
    );

    // Send token response
    sendTokenResponse(user, 200, res, userData);
  } catch (error) {
    console.error(`[Auth] Login error for ${email}:`, error);
    next(error);
  }
});

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // User is already attached to req from the protect middleware
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000), // 10 seconds
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

// @desc      Refresh JWT token
// @route     GET /api/v1/auth/refresh-token
// @access    Private
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Update last token refresh time
  user.lastTokenRefresh = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
});

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user - assign role if admin is creating the user
  const user = await User.create({
    name,
    email,
    password,
    role: req.isAdminCreatingUser ? role || "user" : "user",
    createdBy: req.isAdminCreatingUser ? req.user.id : undefined,
  });

  // Send token response
  sendTokenResponse(user, 201, res);
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Import and re-export all other authentication controllers
const passwordController = require("./passwordController");
const twoFactorController = require("./twoFactorController");
const userController = require("./userController");

// Password related endpoints
exports.forgotPassword = passwordController.forgotPassword;
exports.resetPassword = passwordController.resetPassword;
exports.updatePassword = passwordController.updatePassword;
exports.verifyResetToken = passwordController.verifyResetToken;

// Two-factor authentication endpoints
exports.setup2FA = twoFactorController.setup2FA;
exports.enable2FA = twoFactorController.enable2FA;
exports.disable2FA = twoFactorController.disable2FA;
exports.verify2FA = twoFactorController.verify2FA;
exports.generateRecoveryCodes = twoFactorController.generateRecoveryCodes;
exports.verifyRecoveryCode = twoFactorController.verifyRecoveryCode;

// User data endpoints
exports.getMe = userController.getMe;
