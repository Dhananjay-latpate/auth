const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} = require("../controllers/users");

// Import profile controllers
const { getUserProfile, updateUserProfile } = require("../controllers/profile");

// Import middleware
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");

const router = express.Router({ mergeParams: true });

// Public routes - none

// Profile routes - Any authenticated user can access their own profile
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin", "superadmin"));

// Routes with advanced results
router.route("/").get(advancedResults(User), getUsers).post(createUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);

// Add the route for updating user role
router.route("/:id/role").put(updateUserRole);

module.exports = router;
