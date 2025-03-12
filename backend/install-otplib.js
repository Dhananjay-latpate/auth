const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Installing otplib package for improved TOTP verification...");

try {
  // Install otplib
  execSync("npm install otplib --save", { stdio: "inherit" });

  console.log("\nSuccessfully installed otplib!");
  console.log(
    "This package provides better compatibility with various authenticator apps."
  );

  // Check if twoFactorImproved.js already exists
  const improvedFilePath = path.join(
    __dirname,
    "utils",
    "twoFactorImproved.js"
  );
  if (!fs.existsSync(improvedFilePath)) {
    console.log("\nRun these commands to complete setup:");
    console.log("1. First install the package:");
    console.log("   npm install otplib --save");
    console.log("\n2. Then modify your auth controller:");
    console.log("   Open controllers/auth.js and change:");
    console.log('   const twoFactor = require("../utils/twoFactor");');
    console.log("   to:");
    console.log('   const twoFactor = require("../utils/twoFactorImproved");');
  }

  console.log("\nYou can now start the server with: npm run dev");
} catch (error) {
  console.error(`\nError during installation: ${error.message}`);
  process.exit(1);
}
