const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController");

// Import middleware
const { protect, authorize, hasPermission } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const User = require("../models/User");

const router = express.Router({ mergeParams: true });

// Public routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin", "superadmin"));

// Routes with advanced results and permission checks
router
  .route("/")
  .get(advancedResults(User), hasPermission("manage_users"), getUsers)
  .post(hasPermission("manage_users"), createUser);

router
  .route("/:id")
  .get(hasPermission("manage_users"), getUser)
  .put(hasPermission("manage_users"), updateUser)
  .delete(hasPermission("manage_users"), deleteUser);

module.exports = router;
