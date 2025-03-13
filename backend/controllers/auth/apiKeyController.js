const User = require("../../models/User");
const ApiKey = require("../../models/ApiKey");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const AuditLog = require("../../models/AuditLog");

// @desc      Generate a new API key
// @route     POST /api/v1/auth/apikeys
// @access    Private
exports.generateApiKey = asyncHandler(async (req, res, next) => {
  try {
    const { name, permissions, expiryDays } = req.body;

    if (!name) {
      return next(new ErrorResponse("API key name is required", 400));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found", 404));
    }

    // Generate the API key through the user model method
    const apiKey = await user.generateApiKey(
      name,
      permissions || ["read"],
      expiryDays || 365
    );

    // Log this security event
    if (AuditLog) {
      await AuditLog.logEvent({
        userId: user._id,
        action: "api_key_created",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: {
          name,
          permissions: permissions || ["read"],
          expiryDays: expiryDays || 365,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "API key generated successfully",
      data: {
        key: apiKey, // The full key is returned only once
        name,
        permissions: permissions || ["read"],
        expiryDays: expiryDays || 365,
      },
    });
  } catch (error) {
    console.error("API key generation error:", error);
    return next(
      new ErrorResponse(error.message || "Error generating API key", 500)
    );
  }
});

// @desc      List all API keys
// @route     GET /api/v1/auth/apikeys
// @access    Private
exports.listApiKeys = asyncHandler(async (req, res, next) => {
  try {
    // Find all active API keys for this user
    const apiKeys = await ApiKey.find({
      user: req.user.id,
      isRevoked: false,
    }).select("-key");

    res.status(200).json({
      success: true,
      count: apiKeys.length,
      data: apiKeys,
    });
  } catch (error) {
    console.error("List API keys error:", error);
    return next(new ErrorResponse("Error retrieving API keys", 500));
  }
});

// @desc      Revoke an API key
// @route     DELETE /api/v1/auth/apikeys/:keyId
// @access    Private
exports.revokeApiKey = asyncHandler(async (req, res, next) => {
  try {
    const { keyId } = req.params;

    if (!keyId) {
      return next(new ErrorResponse("API key ID is required", 400));
    }

    // Find the key and make sure it belongs to the user
    const apiKey = await ApiKey.findOne({
      _id: keyId,
      user: req.user.id,
    });

    if (!apiKey) {
      return next(new ErrorResponse("API key not found", 404));
    }

    // Mark as revoked rather than deleting
    apiKey.isRevoked = true;
    apiKey.revokedAt = new Date();
    await apiKey.save();

    // Log this security event
    if (AuditLog) {
      await AuditLog.logEvent({
        userId: req.user.id,
        action: "api_key_deleted",
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: {
          keyId,
          name: apiKey.name,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: "API key revoked successfully",
      data: {},
    });
  } catch (error) {
    console.error("Revoke API key error:", error);
    return next(new ErrorResponse("Error revoking API key", 500));
  }
});
