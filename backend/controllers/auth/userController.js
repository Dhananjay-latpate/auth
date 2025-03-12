const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");

// @desc      Get current logged in user
// @route     GET /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  // User is already set in req from the protect middleware
  console.log("Getting user data for:", req.user.name);

  // Use cached user data if it's recent (within last 5 minutes)
  // to reduce database load
  if (
    req.user._lastFetchedAt &&
    Date.now() - req.user._lastFetchedAt < 5 * 60 * 1000
  ) {
    return res.status(200).json({
      success: true,
      data: req.user,
      cached: true,
    });
  }

  // Fetch fresh user data with role information
  const user = await User.findById(req.user.id).populate({
    path: "role",
    select: "name permissions",
  });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  // Mark the time we fetched the data
  user._lastFetchedAt = Date.now();

  // Set response headers for caching
  res.set("Cache-Control", "private, max-age=300"); // 5 minutes

  res.status(200).json({
    success: true,
    data: user,
  });
});
