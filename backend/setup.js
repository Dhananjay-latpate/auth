require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");
const Role = require("./models/Role");
const colors = require("colors");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected".green.bold))
  .catch((err) => {
    console.error(`Error: ${err.message}`.red);
    process.exit(1);
  });

// Define default roles
const defaultRoles = [
  {
    name: "user",
    permissions: ["read"],
    description: "Regular user with basic access",
  },
  {
    name: "moderator",
    permissions: ["read", "write"],
    description: "Moderator with content management permissions",
  },
  {
    name: "admin",
    permissions: ["read", "write", "delete", "manage_users"],
    description: "Administrator with user management permissions",
  },
  {
    name: "superadmin",
    permissions: ["read", "write", "delete", "manage_users", "manage_roles"],
    description: "Super Admin with full system access",
  },
];

// Define default admin user
const adminUser = {
  name: "Admin User",
  email: "admin@example.com",
  password: "Admin@123456",
  role: "superadmin",
};

// Setup function
const setupSystem = async () => {
  try {
    // Create roles
    console.log("Setting up default roles...".yellow);
    for (const role of defaultRoles) {
      const existingRole = await Role.findOne({ name: role.name });
      if (!existingRole) {
        await Role.create(role);
        console.log(`Role created: ${role.name}`.green);
      } else {
        console.log(`Role already exists: ${role.name}`.cyan);
      }
    }

    // Create admin user
    console.log("\nSetting up default admin user...".yellow);
    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (!existingAdmin) {
      await User.create(adminUser);
      console.log(`Admin user created: ${adminUser.email}`.green);
      console.log(
        `Default password: ${adminUser.password}`.red +
          " (Please change this immediately)".yellow
      );
    } else {
      console.log(`Admin user already exists: ${adminUser.email}`.cyan);
    }

    console.log("\nSetup completed successfully!".green.bold);
    console.log("\nYou can now start the server with:".cyan);
    console.log("npm run dev".white.bold);

    process.exit(0);
  } catch (error) {
    console.error(`Error during setup: ${error.message}`.red.bold);
    process.exit(1);
  }
};

setupSystem();
