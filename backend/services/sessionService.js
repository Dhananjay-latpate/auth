const Session = require("../models/Session");
const jwt = require("jsonwebtoken");

/**
 * Service for managing user sessions
 */
class SessionService {
  /**
   * Create a new session for a user
   * @param {Object} user - User document
   * @param {String} token - JWT token
   * @param {String} deviceInfo - User agent string
   * @param {String} ipAddress - IP address
   * @returns {Promise<Object>} - Created session
   */
  async createSession(user, token, deviceInfo, ipAddress) {
    try {
      // Parse token to get expiration time
      const decoded = jwt.decode(token);
      const expiresAt = new Date(decoded.exp * 1000);

      // Create a new session
      const session = new Session({
        user: user._id,
        token,
        deviceInfo,
        ipAddress,
        expiresAt,
        isCurrentSession: true,
        location: {}, // To be populated by a geo-ip service if needed
      });

      await session.save();
      return session;
    } catch (error) {
      console.error("Error creating session:", error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user
   * @param {String} userId - User ID
   * @returns {Promise<Array>} - List of active sessions
   */
  async getUserSessions(userId) {
    return await Session.findUserActiveSessions(userId);
  }

  /**
   * Revoke a specific session
   * @param {String} sessionId - Session ID
   * @param {String} userId - User ID (for verification)
   * @returns {Promise<Boolean>} - Success status
   */
  async revokeSession(sessionId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      throw new Error("Session not found");
    }

    await Session.deleteOne({ _id: sessionId });
    return true;
  }

  /**
   * Revoke all sessions except current one
   * @param {String} userId - User ID
   * @param {String} currentSessionId - Current session ID to keep
   * @returns {Promise<Number>} - Number of sessions revoked
   */
  async revokeAllOtherSessions(userId, currentSessionId) {
    const result = await Session.deleteMany({
      user: userId,
      _id: { $ne: currentSessionId },
    });

    return result.deletedCount;
  }

  /**
   * Update session activity timestamp
   * @param {String} sessionId - Session ID
   */
  async updateSessionActivity(sessionId) {
    const session = await Session.findById(sessionId);
    if (session) {
      await session.updateActivity();
    }
  }

  /**
   * Clean up expired sessions
   * @returns {Promise<Number>} - Number of sessions cleaned up
   */
  async cleanupExpiredSessions() {
    const result = await Session.deleteMany({
      expiresAt: { $lt: new Date() },
    });

    return result.deletedCount;
  }
}

module.exports = new SessionService();
