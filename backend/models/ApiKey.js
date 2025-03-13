const mongoose = require("mongoose");
const crypto = require("crypto");

const ApiKeySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: [true, "API key name is required"],
    trim: true,
  },
  key: {
    type: String,
    required: true,
    select: false, // Don't return the hashed key by default
  },
  prefix: {
    type: String,
    required: true,
  },
  permissions: [
    {
      type: String,
      enum: ["read", "write", "delete", "admin"],
    },
  ],
  expiresAt: {
    type: Date,
    default: function () {
      // Default expiry of 1 year
      return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    },
  },
  lastUsed: Date,
  ipAllowList: [String], // Optional IP restriction
  rateLimit: {
    requestsPerMinute: {
      type: Number,
      default: 60,
    },
    burstLimit: {
      type: Number,
      default: 100,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: Date,
  isRevoked: {
    type: Boolean,
    default: false,
  },
});

// Indexes for performance
ApiKeySchema.index({ user: 1, prefix: 1 });
ApiKeySchema.index({ prefix: 1 });
ApiKeySchema.index({ expiresAt: 1 });

// Generate a new API key
ApiKeySchema.statics.generateKey = function () {
  const apiKey = crypto.randomBytes(32).toString("hex");
  const prefix = crypto.randomBytes(3).toString("hex");
  const hashedKey = crypto.createHash("sha256").update(apiKey).digest("hex");

  return {
    apiKey,
    prefix,
    hashedKey,
  };
};

// Verify an API key
ApiKeySchema.statics.verifyKey = async function (fullKey) {
  if (!fullKey || !fullKey.includes(".")) {
    return null;
  }

  const [prefix, providedKey] = fullKey.split(".");

  if (!prefix || !providedKey) {
    return null;
  }

  // Find the key by prefix
  const apiKey = await this.findOne({
    prefix: prefix,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  }).select("+key");

  if (!apiKey) {
    return null;
  }

  // Hash the provided key and compare
  const hashedProvidedKey = crypto
    .createHash("sha256")
    .update(providedKey)
    .digest("hex");

  if (hashedProvidedKey !== apiKey.key) {
    return null;
  }

  // Update last used time
  apiKey.lastUsed = new Date();
  await apiKey.save();

  return apiKey;
};

// Check if key has specific permission
ApiKeySchema.methods.hasPermission = function (permission) {
  return (
    this.permissions.includes(permission) || this.permissions.includes("admin")
  );
};

// Revoke this API key
ApiKeySchema.methods.revoke = async function () {
  this.isRevoked = true;
  this.revokedAt = new Date();
  return await this.save();
};

module.exports = mongoose.model("ApiKey", ApiKeySchema);
