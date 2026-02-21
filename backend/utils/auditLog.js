const AuditLog = require("../models/AuditLog");
const logger = require("./logger");

/**
 * Log an audit event asynchronously. Failures are logged but do not throw.
 * @param {Object} params
 * @param {string} params.action - Action type (must match AuditLog enum)
 * @param {string|null} params.userId - User performing the action
 * @param {string} [params.ipAddress] - Client IP address
 * @param {string} [params.userAgent] - Client user-agent string
 * @param {Object} [params.details] - Additional details
 * @param {string|null} [params.organizationId] - Related organization
 */
const logAuditEvent = async ({
  action,
  userId,
  ipAddress,
  userAgent,
  details = {},
  organizationId,
}) => {
  try {
    await AuditLog.logEvent({
      action,
      userId,
      ipAddress,
      userAgent,
      details,
      organizationId,
    });
  } catch (error) {
    // Audit logging should never break the main flow
    logger.error("Failed to write audit log", {
      action,
      userId,
      error: error.message,
    });
  }
};

/**
 * Express middleware helper to extract common request metadata.
 * @param {import('express').Request} req
 * @returns {{ ipAddress: string, userAgent: string }}
 */
const getRequestMeta = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress || "unknown",
  userAgent: req.headers?.["user-agent"] || "unknown",
});

module.exports = { logAuditEvent, getRequestMeta };
