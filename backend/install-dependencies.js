const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("Installing missing dependencies for two-factor authentication...");

try {
  // Install hi-base32
  console.log("Installing hi-base32...");
  execSync("npm install hi-base32 --save", { stdio: "inherit" });

  // Check if other optional dependencies exist
  try {
    require.resolve("qrcode");
  } catch (e) {
    console.log("Installing qrcode...");
    execSync("npm install qrcode --save", { stdio: "inherit" });
  }

  console.log("\nAll dependencies installed successfully!");
  console.log("You can now start the server with: npm run dev");
} catch (error) {
  console.error(`\nError during installation: ${error.message}`);
  process.exit(1);
}
