const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add an organization name"],
    trim: true,
    maxlength: [100, "Organization name cannot be more than 100 characters"],
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  logo: String,
  website: String,
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  settings: {
    allowPublicProjects: {
      type: Boolean,
      default: false,
    },
    requireTwoFactorAuth: {
      type: Boolean,
      default: false,
    },
    defaultUserRole: {
      type: String,
      enum: ["member", "viewer"],
      default: "member",
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate slug from name before saving
OrganizationSchema.pre("save", function (next) {
  if ((this.isModified("name") || !this.slug) && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

module.exports = mongoose.model("Organization", OrganizationSchema);
