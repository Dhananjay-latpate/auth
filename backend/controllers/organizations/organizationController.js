const mongoose = require("mongoose");
const Organization = require("../../models/Organization");
const User = require("../../models/User");
const AuditLog = require("../../models/AuditLog");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");

// @desc      Create new organization
// @route     POST /api/v1/organizations
// @access    Private
exports.createOrganization = asyncHandler(async (req, res, next) => {
  // Add the user ID as the owner
  req.body.ownerId = req.user.id;

  // Generate a slug if not provided
  if (!req.body.slug) {
    req.body.slug = req.body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Create the organization
  const organization = await Organization.create(req.body);

  // Update the user's organizations array
  await User.findByIdAndUpdate(req.user.id, {
    $push: {
      organizations: {
        organization: organization._id,
        role: "owner",
        joinedAt: Date.now(),
      },
    },
  });

  // Log this event
  if (AuditLog) {
    await AuditLog.logEvent({
      userId: req.user.id,
      action: "organization_created",
      organizationId: organization._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: {
        name: organization.name,
      },
    });
  }

  res.status(201).json({
    success: true,
    data: organization,
  });
});

// @desc      Get organizations for current user
// @route     GET /api/v1/organizations/me
// @access    Private
exports.getUserOrganizations = asyncHandler(async (req, res, next) => {
  // Find the user and populate their organizations
  const user = await User.findById(req.user.id)
    .select("organizations")
    .populate({
      path: "organizations.organization",
      select: "name slug logo description",
    });

  if (!user) {
    return next(new ErrorResponse("User not found", 404));
  }

  res.status(200).json({
    success: true,
    count: user.organizations.length,
    data: user.organizations,
  });
});

// @desc      Get single organization
// @route     GET /api/v1/organizations/:id
// @access    Private
exports.getOrganization = asyncHandler(async (req, res, next) => {
  // Check if ID is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(
      new ErrorResponse(`Invalid Organization ID: ${req.params.id}`, 400)
    );
  }

  const organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(
      new ErrorResponse(
        `Organization not found with ID of ${req.params.id}`,
        404
      )
    );
  }

  // Check if user belongs to the organization
  const user = await User.findOne({
    _id: req.user.id,
    "organizations.organization": organization._id,
  });

  if (!user) {
    return next(
      new ErrorResponse(`Not authorized to access this organization`, 403)
    );
  }

  res.status(200).json({
    success: true,
    data: organization,
  });
});

// @desc      Update organization
// @route     PUT /api/v1/organizations/:id
// @access    Private (owners and admins)
exports.updateOrganization = asyncHandler(async (req, res, next) => {
  // Find the organization
  let organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(
      new ErrorResponse(
        `Organization not found with ID of ${req.params.id}`,
        404
      )
    );
  }

  // Check if user has permission to update (must be owner or admin)
  const user = await User.findOne({
    _id: req.user.id,
    "organizations.organization": organization._id,
    "organizations.role": { $in: ["owner", "admin"] },
  });

  if (!user) {
    return next(
      new ErrorResponse(`Not authorized to update this organization`, 403)
    );
  }

  // Don't allow changing the owner directly
  if (req.body.ownerId) {
    delete req.body.ownerId;
  }

  // Update the organization
  organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Log this event
  if (AuditLog) {
    await AuditLog.logEvent({
      userId: req.user.id,
      action: "organization_updated",
      organizationId: organization._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: req.body,
    });
  }

  res.status(200).json({
    success: true,
    data: organization,
  });
});

// @desc      Get organization members
// @route     GET /api/v1/organizations/:id/members
// @access    Private (organization members)
exports.getOrganizationMembers = asyncHandler(async (req, res, next) => {
  // Check if organization exists
  const organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(
      new ErrorResponse(
        `Organization not found with ID of ${req.params.id}`,
        404
      )
    );
  }

  // Check if user belongs to the organization
  const userMembership = await User.findOne({
    _id: req.user.id,
    "organizations.organization": organization._id,
  });

  if (!userMembership) {
    return next(
      new ErrorResponse(`Not authorized to access this organization`, 403)
    );
  }

  // Find all users who are members of this organization
  const members = await User.find({
    "organizations.organization": organization._id,
  }).select("name email profile.avatar organizations");

  // Map the results to include just the relevant organization role
  const formattedMembers = members.map((member) => {
    const orgMembership = member.organizations.find(
      (org) => org.organization.toString() === req.params.id
    );

    return {
      id: member._id,
      name: member.name,
      email: member.email,
      avatar: member.profile?.avatar || null,
      role: orgMembership?.role || "member",
      joinedAt: orgMembership?.joinedAt,
    };
  });

  res.status(200).json({
    success: true,
    count: formattedMembers.length,
    data: formattedMembers,
  });
});

// @desc      Invite a user to an organization
// @route     POST /api/v1/organizations/:id/invite
// @access    Private (owners and admins)
exports.inviteToOrganization = asyncHandler(async (req, res, next) => {
  const { email, role = "member" } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please provide an email address", 400));
  }

  // Validate the role
  if (!["admin", "member"].includes(role)) {
    return next(
      new ErrorResponse("Invalid role. Must be either admin or member", 400)
    );
  }

  // Find the organization
  const organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(
      new ErrorResponse(
        `Organization not found with ID of ${req.params.id}`,
        404
      )
    );
  }

  // Check if user has permission to invite (must be owner or admin)
  const inviter = await User.findOne({
    _id: req.user.id,
    "organizations.organization": organization._id,
    "organizations.role": { $in: ["owner", "admin"] },
  });

  if (!inviter) {
    return next(
      new ErrorResponse(
        `Not authorized to invite users to this organization`,
        403
      )
    );
  }

  // Find the user to invite
  const userToInvite = await User.findOne({ email });

  if (!userToInvite) {
    return next(
      new ErrorResponse(`No user found with the email ${email}`, 404)
    );
  }

  // Check if user is already a member
  const alreadyMember = userToInvite.organizations.some(
    (org) => org.organization.toString() === req.params.id
  );

  if (alreadyMember) {
    return next(
      new ErrorResponse(`User is already a member of this organization`, 400)
    );
  }

  // Add user to organization
  await User.findByIdAndUpdate(userToInvite._id, {
    $push: {
      organizations: {
        organization: organization._id,
        role: role,
        joinedAt: Date.now(),
      },
    },
  });

  // Log this event
  if (AuditLog) {
    await AuditLog.logEvent({
      userId: req.user.id,
      action: "organization_member_invited",
      organizationId: organization._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: {
        invitedUserId: userToInvite._id,
        invitedUserEmail: email,
        role,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {
      message: `User ${email} has been added to the organization as ${role}`,
      organization: {
        id: organization._id,
        name: organization.name,
      },
      user: {
        id: userToInvite._id,
        name: userToInvite.name,
        email: userToInvite.email,
        role,
      },
    },
  });
});

// @desc      Remove user from organization
// @route     DELETE /api/v1/organizations/:id/members/:userId
// @access    Private (owners and admins)
exports.removeFromOrganization = asyncHandler(async (req, res, next) => {
  const { id, userId } = req.params;

  // Find the organization
  const organization = await Organization.findById(id);

  if (!organization) {
    return next(
      new ErrorResponse(`Organization not found with ID of ${id}`, 404)
    );
  }

  // Check if user has permission to remove members
  const remover = await User.findOne({
    _id: req.user.id,
    "organizations.organization": organization._id,
    "organizations.role": { $in: ["owner", "admin"] },
  });

  if (!remover) {
    return next(
      new ErrorResponse(
        `Not authorized to remove users from this organization`,
        403
      )
    );
  }

  // Find the user to remove
  const userToRemove = await User.findById(userId);

  if (!userToRemove) {
    return next(new ErrorResponse(`User not found with ID of ${userId}`, 404));
  }

  // Check if target user is the owner
  if (organization.ownerId.toString() === userId) {
    return next(new ErrorResponse(`Cannot remove the organization owner`, 400));
  }

  // Check if the user removing is an admin and target is also an admin or owner
  const targetMembership = userToRemove.organizations.find(
    (org) => org.organization.toString() === id
  );

  const removerMembership = remover.organizations.find(
    (org) => org.organization.toString() === id
  );

  if (removerMembership.role === "admin" && targetMembership.role === "admin") {
    return next(new ErrorResponse(`Admins cannot remove other admins`, 403));
  }

  // Remove the user from the organization
  await User.findByIdAndUpdate(userId, {
    $pull: {
      organizations: {
        organization: organization._id,
      },
    },
  });

  // Log this event
  if (AuditLog) {
    await AuditLog.logEvent({
      userId: req.user.id,
      action: "organization_member_removed",
      organizationId: organization._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: {
        removedUserId: userToRemove._id,
        removedUserEmail: userToRemove.email,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Leave organization
// @route     DELETE /api/v1/organizations/:id/members/me
// @access    Private
exports.leaveOrganization = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  // Find the organization
  const organization = await Organization.findById(id);

  if (!organization) {
    return next(
      new ErrorResponse(`Organization not found with ID of ${id}`, 404)
    );
  }

  // Check if user is in the organization
  const user = await User.findOne({
    _id: req.user.id,
    "organizations.organization": organization._id,
  });

  if (!user) {
    return next(
      new ErrorResponse(`You are not a member of this organization`, 400)
    );
  }

  // Check if user is the owner
  if (organization.ownerId.toString() === req.user.id) {
    return next(
      new ErrorResponse(
        `Organization owner cannot leave. Transfer ownership first.`,
        400
      )
    );
  }

  // Remove user from organization
  await User.findByIdAndUpdate(req.user.id, {
    $pull: {
      organizations: {
        organization: organization._id,
      },
    },
  });

  // Log this event
  if (AuditLog) {
    await AuditLog.logEvent({
      userId: req.user.id,
      action: "organization_left",
      organizationId: organization._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Delete organization
// @route     DELETE /api/v1/organizations/:id
// @access    Private (owner only)
exports.deleteOrganization = asyncHandler(async (req, res, next) => {
  const organization = await Organization.findById(req.params.id);

  if (!organization) {
    return next(
      new ErrorResponse(
        `Organization not found with ID of ${req.params.id}`,
        404
      )
    );
  }

  // Check if user is the owner
  if (organization.ownerId.toString() !== req.user.id) {
    return next(
      new ErrorResponse(`Only the organization owner can delete it`, 403)
    );
  }

  // Find all users in the organization
  const users = await User.find({
    "organizations.organization": organization._id,
  });

  // Remove the organization from all users
  const updatePromises = users.map((user) => {
    return User.findByIdAndUpdate(user._id, {
      $pull: {
        organizations: {
          organization: organization._id,
        },
      },
    });
  });

  await Promise.all(updatePromises);

  // Delete the organization
  await organization.remove();

  // Log this event
  if (AuditLog) {
    await AuditLog.logEvent({
      userId: req.user.id,
      action: "organization_deleted",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      details: {
        organizationName: organization.name,
        organizationId: organization._id,
      },
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
