const User = require("../../models/User");
const Session = require("../../models/Session");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const sessionService = require("../../services/sessionService");

// @desc      Get all user sessions
// @route     GET /api/v1/auth/sessions
// @access    Private
exports.getSessions = asyncHandler(async (req, res, next) => {
  try {
    // Get all active sessions for the user
    const sessions = await sessionService.getUserSessions(req.user.id);

    // Map to a safe response format (exclude token)
    const sessionData = sessions.map((session) => ({
      id: session._id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      lastActive: session.lastActive,
      isCurrentSession: session.isCurrentSession,
      location: session.location,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    }));

    res.status(200).json({
      success: true,
      count: sessionData.length,
      data: sessionData,
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    return next(new ErrorResponse("Error retrieving sessions", 500));
  }
});

// @desc      Revoke a user session or all sessions
// @route     DELETE /api/v1/auth/sessions/:sessionId
// @route     DELETE /api/v1/auth/sessions (all=true)
// @access    Private
exports.revokeSession = asyncHandler(async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { all } = req.body || req.query || {};
    const userId = req.user.id;

    // If all=true, revoke all sessions except current one
    if (all || req.path === "/sessions") {
      // First identify the current session
      const currentSession = await Session.findOne({
        user: userId,
        isCurrentSession: true,
      });

      if (!currentSession) {
        return next(new ErrorResponse("Current session not found", 404));
      }

      // Revoke all other sessions
      const revokedCount = await sessionService.revokeAllOtherSessions(
        userId,
        currentSession._id
      );

      return res.status(200).json({
        success: true,
        message: `${revokedCount} other sessions have been revoked`,
        data: {},
      });
    }

    // Otherwise, revoke a specific session
    if (!sessionId) {
      return next(new ErrorResponse("Session ID is required", 400));
    }

    // Check if the session belongs to this user
    const session = await Session.findOne({
      _id: sessionId,
      user: userId,
    });

    if (!session) {
      return next(new ErrorResponse("Session not found", 404));
    }

    // Don't allow revoking the current session this way
    if (session.isCurrentSession) {
      return next(
        new ErrorResponse(
          "Cannot revoke your current session this way. Use logout instead.",
          400
        )
      );
    }

    // Revoke the session
    await sessionService.revokeSession(sessionId, userId);

    res.status(200).json({
      success: true,
      message: "Session revoked successfully",
      data: {},
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    return next(new ErrorResponse("Error revoking session", 500));
  }
});
