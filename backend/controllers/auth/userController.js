const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");

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
