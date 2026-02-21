const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
const User = require("../models/User");
const logger = require("../utils/logger");

/**
 * Finds or creates a user from an OAuth profile.
 * @param {string} provider - OAuth provider name (e.g., 'google', 'github')
 * @param {string} providerId - The user's ID from the OAuth provider
 * @param {string} email - User's email
 * @param {string} name - User's display name
 * @param {string} [avatar] - URL to the user's avatar
 * @returns {Promise<User>} - The found or created user
 */
const findOrCreateOAuthUser = async (
  provider,
  providerId,
  email,
  name,
  avatar
) => {
  // Try to find existing user by provider ID
  let user = await User.findOne({
    [`oauthProviders.${provider}.id`]: providerId,
  });

  if (user) {
    return user;
  }

  // Try to find by email (link accounts)
  if (email) {
    user = await User.findOne({ email });
    if (user) {
      // Link this OAuth provider to the existing account
      user.oauthProviders = user.oauthProviders || {};
      user.oauthProviders[provider] = { id: providerId };
      if (avatar && !user.profile?.avatar) {
        user.profile = user.profile || {};
        user.profile.avatar = avatar;
      }
      await user.save({ validateBeforeSave: false });
      return user;
    }
  }

  // Create new user
  const newUser = await User.create({
    name: name || `${provider} User`,
    email: email || `${provider}_${providerId}@oauth.local`,
    // Set a random password since OAuth users won't use password login
    password:
      require("crypto").randomBytes(32).toString("hex") + "Aa1!",
    role: "user",
    oauthProviders: {
      [provider]: { id: providerId },
    },
    profile: {
      avatar: avatar || undefined,
    },
  });

  return newUser;
};

// Configure Google OAuth strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:5000"}/api/v1/auth/oauth/google/callback`,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          const avatar =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          const user = await findOrCreateOAuthUser(
            "google",
            profile.id,
            email,
            profile.displayName,
            avatar
          );

          logger.info(`Google OAuth login: ${user.email}`);
          return done(null, user);
        } catch (error) {
          logger.error("Google OAuth error:", { error: error.message });
          return done(error, null);
        }
      }
    )
  );
} else {
  logger.warn(
    "Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable."
  );
}

// Configure GitHub OAuth strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL || "http://localhost:5000"}/api/v1/auth/oauth/github/callback`,
        scope: ["user:email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email =
            profile.emails && profile.emails[0]
              ? profile.emails[0].value
              : null;
          const avatar =
            profile.photos && profile.photos[0]
              ? profile.photos[0].value
              : null;

          const user = await findOrCreateOAuthUser(
            "github",
            profile.id,
            email,
            profile.displayName || profile.username,
            avatar
          );

          logger.info(`GitHub OAuth login: ${user.email}`);
          return done(null, user);
        } catch (error) {
          logger.error("GitHub OAuth error:", { error: error.message });
          return done(error, null);
        }
      }
    )
  );
} else {
  logger.warn(
    "GitHub OAuth not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET to enable."
  );
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
