const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    select: false, // Don't return the token by default for security
  },
  deviceInfo: {
    type: String,
    required: true,
  },
  ipAddress: String,
  lastActive: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  isCurrentSession: {
    type: Boolean,
    default: false,
  },
  location: {
    country: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  userAgent: {
    browser: String,
    os: String,
    device: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries and expired session cleanup
SessionSchema.index({ user: 1, lastActive: -1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiration

// Method to update session activity
SessionSchema.methods.updateActivity = async function () {
  this.lastActive = Date.now();
  return this.save();
};

// Static method to find active sessions for a user
SessionSchema.statics.findUserActiveSessions = async function (userId) {
  return this.find({
    user: userId,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActive: -1 });
};

// Method to check if session is expired
SessionSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

// Middleware to extract user agent details before saving
SessionSchema.pre("save", function (next) {
  if (this.isModified("deviceInfo") && !this.userAgent.browser) {
    try {
      // Simple parsing of user agent string
      const ua = this.deviceInfo.toLowerCase();

      // Extract basic browser info
      if (ua.includes("chrome")) this.userAgent.browser = "Chrome";
      else if (ua.includes("firefox")) this.userAgent.browser = "Firefox";
      else if (ua.includes("safari")) this.userAgent.browser = "Safari";
      else if (ua.includes("edge")) this.userAgent.browser = "Edge";
      else if (ua.includes("opera")) this.userAgent.browser = "Opera";
      else this.userAgent.browser = "Other";

      // Extract basic OS info
      if (ua.includes("windows")) this.userAgent.os = "Windows";
      else if (ua.includes("mac")) this.userAgent.os = "MacOS";
      else if (ua.includes("android")) this.userAgent.os = "Android";
      else if (ua.includes("ios") || ua.includes("iphone"))
        this.userAgent.os = "iOS";
      else if (ua.includes("linux")) this.userAgent.os = "Linux";
      else this.userAgent.os = "Other";

      // Extract device type
      if (ua.includes("mobile")) this.userAgent.device = "Mobile";
      else if (ua.includes("tablet")) this.userAgent.device = "Tablet";
      else this.userAgent.device = "Desktop";
    } catch (err) {
      console.error("Error parsing user agent:", err);
    }
  }
  next();
});

module.exports = mongoose.model("Session", SessionSchema);
