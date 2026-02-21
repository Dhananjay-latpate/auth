const express = require("express");
const passport = require("../config/passport");
const { sendTokenResponse } = require("../controllers/auth/helpers");
const ErrorResponse = require("../utils/errorResponse");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

/**
 * @swagger
 * /auth/oauth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [OAuth]
 *     description: Redirects the user to Google for authentication. Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env vars.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 *       501:
 *         description: Google OAuth not configured
 */
router.get("/google", (req, res, next) => {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET
  ) {
    return next(
      new ErrorResponse(
        "Google OAuth is not configured on this server",
        501
      )
    );
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(
    req,
    res,
    next
  );
});

/**
 * @swagger
 * /auth/oauth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     tags: [OAuth]
 *     description: Callback URL for Google OAuth. Redirects to frontend with token on success.
 *     responses:
 *       302:
 *         description: Redirect to frontend dashboard with token
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const token = req.user.getSignedJwtToken();
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

/**
 * @swagger
 * /auth/oauth/github:
 *   get:
 *     summary: Initiate GitHub OAuth login
 *     tags: [OAuth]
 *     description: Redirects the user to GitHub for authentication. Requires GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET env vars.
 *     responses:
 *       302:
 *         description: Redirect to GitHub OAuth
 *       501:
 *         description: GitHub OAuth not configured
 */
router.get("/github", (req, res, next) => {
  if (
    !process.env.GITHUB_CLIENT_ID ||
    !process.env.GITHUB_CLIENT_SECRET
  ) {
    return next(
      new ErrorResponse(
        "GitHub OAuth is not configured on this server",
        501
      )
    );
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

/**
 * @swagger
 * /auth/oauth/github/callback:
 *   get:
 *     summary: GitHub OAuth callback
 *     tags: [OAuth]
 *     description: Callback URL for GitHub OAuth. Redirects to frontend with token on success.
 *     responses:
 *       302:
 *         description: Redirect to frontend dashboard with token
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/login?error=oauth_failed`,
  }),
  async (req, res) => {
    try {
      const token = req.user.getSignedJwtToken();
      res.redirect(`${FRONTEND_URL}/oauth/callback?token=${token}`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/login?error=oauth_failed`);
    }
  }
);

module.exports = router;
