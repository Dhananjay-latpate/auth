const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Installing dependencies for the Secure Auth System backend...");

try {
  // Make sure we're in the backend directory
  const currentDir = process.cwd();
  if (!currentDir.endsWith("backend")) {
    console.log("Changing directory to /home/redlight/auth/backend");
    process.chdir(path.join(__dirname));
  }

  // Check if package.json exists
  if (!fs.existsSync("package.json")) {
    console.error("Error: package.json not found in current directory");
    process.exit(1);
  }

  // Install dependencies
  console.log("Running npm install...");
  execSync("npm install", { stdio: "inherit" });

  console.log("\nDependencies installed successfully!");
  console.log("\nYou can now run the setup script:");
  console.log("node setup.js");
} catch (error) {
  console.error(`\nError during installation: ${error.message}`);
  process.exit(1);
}
