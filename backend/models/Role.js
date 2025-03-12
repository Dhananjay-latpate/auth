const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a role name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  permissions: [
    {
      type: String,
      enum: ["read", "write", "delete", "manage_users", "manage_roles"],
    },
  ],
  description: {
    type: String,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Role", RoleSchema);
