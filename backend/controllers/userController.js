const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

// @desc      Get all users
// @route     GET /api/v1/users
// @access    Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get single user
// @route     GET /api/v1/users/:id
// @access    Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorResponse(`No user found with id ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Create user
// @route     POST /api/v1/users
// @access    Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  // Add the creator's ID to track who created the user
  req.body.createdBy = req.user.id;

  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user,
  });
});

// @desc      Update user
// @route     PUT /api/v1/users/:id
// @access    Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Don't allow role change for superadmin users unless the requester is also a superadmin
  const userToUpdate = await User.findById(req.params.id);

  if (!userToUpdate) {
    return next(
      new ErrorResponse(`No user found with id ${req.params.id}`, 404)
    );
  }

  // Check if trying to modify a superadmin
  if (userToUpdate.role === "superadmin" && req.user.role !== "superadmin") {
    return next(
      new ErrorResponse(`Not authorized to modify a superadmin account`, 403)
    );
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Delete user
// @route     DELETE /api/v1/users/:id
// @access    Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userToDelete = await User.findById(req.params.id);

  if (!userToDelete) {
    return next(
      new ErrorResponse(`No user found with id ${req.params.id}`, 404)
    );
  }

  // Prevent deletion of superadmin accounts by non-superadmins
  if (userToDelete.role === "superadmin" && req.user.role !== "superadmin") {
    return next(
      new ErrorResponse(`Not authorized to delete a superadmin account`, 403)
    );
  }

  // Don't allow self-deletion
  if (userToDelete.id === req.user.id) {
    return next(new ErrorResponse(`Cannot delete your own account`, 400));
  }

  await userToDelete.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get current user's profile
// @route     GET /api/v1/users/profile
// @access    Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
  // User is already available in req.user from the protect middleware
  const user = req.user;

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update current user's profile
// @route     PUT /api/v1/users/profile
// @access    Private
exports.updateUserProfile = asyncHandler(async (req, res, next) => {
  // Only allow certain fields to be updated through this route
  const fieldsToUpdate = {
    name: req.body.name,
    // Add other permitted fields as needed
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
