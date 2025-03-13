const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const twoFactor = require("../utils/twoFactorImproved");
const Session = require("./Session");
const ApiKey = require("./ApiKey");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "editor", "admin", "superadmin"],
    default: "user",
  },
  permissions: [
    {
      type: String,
      enum: ["read", "write", "delete", "manage_users", "manage_roles"],
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  twoFactorSecret: {
    type: String,
    select: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0,
  },
  locked: {
    type: Boolean,
    default: false,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  recoveryCodes: {
    type: [String],
    select: false,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockUntil: Date,
  lastLoginIP: String,
  lastTokenRefresh: Date,
  passwordUpdateFailures: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ipAddress: String,
  userAgent: String,

  // Enhanced profile information
  profile: {
    avatar: String,
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    location: String,
    phoneNumber: String,
    title: String,
    socialLinks: {
      twitter: String,
      linkedin: String,
      github: String,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      twoFactorMethod: {
        type: String,
        enum: ["app", "email", "sms"],
        default: "app",
      },
    },
  },

  // Organization memberships
  organizations: [
    {
      organization: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Organization",
      },
      role: {
        type: String,
        enum: ["owner", "admin", "member"],
        default: "member",
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  // Additional security options
  securitySettings: {
    passwordExpiryDays: {
      type: Number,
      default: 90, // Password expires after 90 days
    },
    requireStrongPassword: {
      type: Boolean,
      default: true,
    },
    allowedIpAddresses: [String], // IP whitelist
  },

  // Virtual fields for related data
  // These aren't stored in the database but provide convenient access
  currentSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      // Include basic user info in the token
      name: this.name,
      email: this.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "30d",
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Check if user has specific permission
UserSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

// Generate recovery codes for 2FA
UserSchema.methods.generateRecoveryCodes = function () {
  const recoveryCodes = [];

  // Generate 10 random recovery codes
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(10).toString("hex");
    recoveryCodes.push(code);
  }

  this.recoveryCodes = recoveryCodes;
  return recoveryCodes;
};

// Middleware to populate permissions from role before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("role")) {
    return next();
  }

  try {
    // Find the role to get the associated permissions
    const mongoose = require("mongoose");
    const Role = mongoose.model("Role");

    const role = await Role.findOne({ name: this.role });

    if (role && role.permissions) {
      this.permissions = role.permissions;
    }

    next();
  } catch (err) {
    next(err);
  }
});

// Register new session - updated to use the Session model
UserSchema.methods.registerSession = async function (
  token,
  deviceInfo,
  ipAddress
) {
  try {
    // Parse token to get expiration time
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    // Create a new session using the Session model
    const session = new Session({
      user: this._id,
      token,
      deviceInfo,
      ipAddress,
      expiresAt,
      isCurrentSession: true,
      userAgent: {},
    });

    // Save the new session
    await session.save();

    // Set all other sessions as not current
    await Session.updateMany(
      { user: this._id, _id: { $ne: session._id } },
      { $set: { isCurrentSession: false } }
    );

    // Set this as the current session
    this.currentSession = session._id;

    // Clean up old sessions - keep only the latest 5
    const sessions = await Session.find({ user: this._id })
      .sort({ createdAt: -1 })
      .select("_id");

    if (sessions.length > 5) {
      const sessionsToKeep = sessions.slice(0, 5).map((s) => s._id);
      await Session.deleteMany({
        user: this._id,
        _id: { $nin: sessionsToKeep },
      });
    }

    return session;
  } catch (error) {
    console.error("Error registering session:", error);
    throw error;
  }
};

// Generate API key for user - updated to use ApiKey model
UserSchema.methods.generateApiKey = async function (
  name,
  permissions = [],
  expiryDays = 365
) {
  try {
    // Check if the user already has too many API keys
    const keyCount = await ApiKey.countDocuments({
      user: this._id,
      isRevoked: false,
    });
    if (keyCount >= 10) {
      throw new Error(
        "Maximum API key limit reached. Please revoke an existing key first."
      );
    }

    // Generate new API key
    const { apiKey, prefix, hashedKey } = ApiKey.generateKey();

    // Create new API key document
    const newKey = new ApiKey({
      user: this._id,
      name,
      key: hashedKey,
      prefix,
      permissions,
      expiresAt: expiryDays
        ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000)
        : null,
    });

    await newKey.save();

    // Return the full key only this once (it won't be retrievable again)
    return `${prefix}.${apiKey}`;
  } catch (error) {
    console.error("Error generating API key:", error);
    throw error;
  }
};

// Static method to get user with active sessions
UserSchema.statics.getUserWithActiveSessions = async function (userId) {
  const user = await this.findById(userId);
  if (!user) return null;

  const sessions = await Session.findUserActiveSessions(userId);

  return { user, sessions };
};

module.exports = mongoose.model("User", UserSchema);
