const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const ensureUploadsDirectoryExists = () => {
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("Created avatars upload directory:", uploadsDir);
  }
};

// Create upload directories on module load
ensureUploadsDirectoryExists();

// @desc      Get logged in user profile
// @route     GET /api/v1/auth/profile
// @access    Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  // User is already available from the auth middleware
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update logged in user profile
// @route     PUT /api/v1/auth/profile
// @access    Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  // Extract basic fields that are allowed to be updated
  const { name } = req.body;

  // Create update object with basic fields
  const fieldsToUpdate = {
    name: name || req.user.name,
  };

  // Handle profile object if provided
  if (req.body.profile) {
    fieldsToUpdate.profile = {
      // Merge with existing profile data if it exists
      ...(req.user.profile || {}),
      ...req.body.profile,
    };

    // Handle nested objects within profile
    if (req.body.profile.socialLinks) {
      fieldsToUpdate.profile.socialLinks = {
        ...(req.user.profile?.socialLinks || {}),
        ...req.body.profile.socialLinks,
      };
    }

    if (req.body.profile.preferences) {
      fieldsToUpdate.profile.preferences = {
        ...(req.user.profile?.preferences || {}),
        ...req.body.profile.preferences,
      };
    }
  }

  // Don't allow user to change sensitive fields
  if (req.body.role) delete req.body.role;
  if (req.body.password) delete req.body.password;
  if (req.body.email) delete req.body.email; // Email changes should be handled separately with verification

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Upload user avatar
// @route     POST /api/v1/auth/profile/avatar
// @access    Private
exports.uploadAvatar = asyncHandler(async (req, res, next) => {
  // Make sure the uploads directory exists
  ensureUploadsDirectoryExists();

  // Check if file is uploaded
  if (!req.files || !req.files.avatar) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.avatar;

  // Debug information
  console.log(
    "File received:",
    file.name,
    "Size:",
    file.size,
    "Type:",
    file.mimetype
  );

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check file size (limit to 2MB)
  if (file.size > 2 * 1024 * 1024) {
    return next(new ErrorResponse(`Image size should not exceed 2MB`, 400));
  }

  // Create custom filename
  const filename = `avatar-${req.user.id}-${Date.now()}${
    path.parse(file.name).ext
  }`;

  // Path where file will be uploaded
  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  const filePath = path.join(uploadsDir, filename);

  console.log("Saving file to:", filePath);

  // Move file to the upload path
  file.mv(filePath, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return next(
        new ErrorResponse(`Problem with file upload: ${err.message}`, 500)
      );
    }

    // Build the public URL for the avatar - fix the path to avoid double "uploads"
    const avatarUrl = `/avatars/${filename}`;

    // Update user profile with avatar URL
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { "profile.avatar": avatarUrl }, // Store just the path, not the full URL
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: {
        avatar: avatarUrl,
        user,
      },
    });
  });
});

// @desc      Update user preferences
// @route     PUT /api/v1/auth/profile/preferences
// @access    Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  // Create a preferences object with valid fields only
  const preferences = {};

  // Extract valid preference fields
  if (req.body.theme && ["light", "dark", "system"].includes(req.body.theme)) {
    preferences.theme = req.body.theme;
  }

  if (typeof req.body.emailNotifications === "boolean") {
    preferences.emailNotifications = req.body.emailNotifications;
  }

  if (
    req.body.twoFactorMethod &&
    ["app", "email", "sms"].includes(req.body.twoFactorMethod)
  ) {
    preferences.twoFactorMethod = req.body.twoFactorMethod;
  }

  // Update user with the new preferences
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { "profile.preferences": preferences },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: user.profile.preferences,
  });
});
