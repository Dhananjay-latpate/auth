const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const twoFactor = require("../utils/twoFactorImproved");

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

module.exports = mongoose.model("User", UserSchema);
