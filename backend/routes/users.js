const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
} = require("../controllers/users");

const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

const router = express.Router();

const { protect, authorize, checkPermission } = require("../middleware/auth");

router.use(protect);

// Routes restricted to admin and those with manage_users permission
router
  .route("/")
  .get(authorize("admin", "superadmin"), advancedResults(User), getUsers)
  .post(authorize("admin", "superadmin"), createUser);

router
  .route("/:id")
  .get(checkPermission("manage_users"), getUser)
  .put(checkPermission("manage_users"), updateUser)
  .delete(authorize("admin", "superadmin"), deleteUser);

router.route("/:id/role").put(authorize("admin", "superadmin"), updateUserRole);

module.exports = router;
