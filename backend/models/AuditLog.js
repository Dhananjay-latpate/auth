const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  action: {
    type: String,
    required: true,
    enum: [
      "login",
      "logout",
      "failed_login",
      "password_reset",
      "password_change",
      "two_factor_enabled",
      "two_factor_disabled",
      "account_locked",
      "role_change",
      "permission_change",
      "api_key_created",
      "api_key_deleted",
      "user_created",
      "user_deleted",
      "session_revoked",
      "organization_joined",
      // Add organization-related actions
      "organization_created",
      "organization_updated",
      "organization_deleted",
      "organization_member_invited",
      "organization_member_removed",
      "organization_left",
    ],
  },
  ipAddress: String,
  userAgent: String,
  details: mongoose.Schema.Types.Mixed,
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
AuditLogSchema.index({ user: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, timestamp: -1 });
AuditLogSchema.index({ organization: 1, timestamp: -1 });

// Method to create a standardized log entry
AuditLogSchema.statics.logEvent = async function (data) {
  return await this.create({
    user: data.userId,
    action: data.action,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    details: data.details || {},
    organization: data.organizationId,
    timestamp: Date.now(),
  });
};

module.exports = mongoose.model("AuditLog", AuditLogSchema);
