const express = require("express");
const {
  createOrganization,
  getUserOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationMembers,
  inviteToOrganization,
  removeFromOrganization,
  leaveOrganization,
} = require("../controllers/organizations/organizationController");

const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  apiKeyAuth,
  requireApiKeyPermission,
} = require("../middleware/apiKeyAuth");

// Apply authentication middleware to all routes
router.use(protect);

// Routes for the logged-in user's organizations
router.route("/me").get(getUserOrganizations);

// Organization CRUD routes
router.route("/").post(createOrganization);

router
  .route("/:id")
  .get(getOrganization)
  .put(updateOrganization)
  .delete(deleteOrganization);

// Organization members management
router.route("/:id/members").get(getOrganizationMembers);

router.route("/:id/invite").post(inviteToOrganization);

router.route("/:id/members/:userId").delete(removeFromOrganization);

router.route("/:id/members/me").delete(leaveOrganization);

module.exports = router;
