const User = require("../models/User");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc      Get logged in user profile
// @route     GET /api/v1/users/profile
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
// @route     PUT /api/v1/users/profile
// @access    Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  // Fields to update
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    (key) => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  // Don't allow user to change their role or other sensitive fields
  if (req.body.role) delete req.body.role;
  if (req.body.password) delete req.body.password;

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});
