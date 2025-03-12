const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Dependency lists
const backendDependencies = [
  "bcryptjs",
  "colors",
  "cookie-parser",
  "cors",
  "dotenv",
  "express",
  "express-mongo-sanitize",
  "express-rate-limit",
  "helmet",
  "hi-base32",
  "jsonwebtoken",
  "mongoose",
  "nodemailer",
  "qrcode",
  "validator",
  "xss-clean",
];

const backendDevDependencies = ["jest", "nodemon"];

// Read and update backend package.json
console.log("Checking backend dependencies...");
const backendPackageJsonPath = path.join(__dirname, "backend", "package.json");

if (fs.existsSync(backendPackageJsonPath)) {
  const backendPackageJson = JSON.parse(
    fs.readFileSync(backendPackageJsonPath, "utf8")
  );

  // Check missing dependencies
  const missingDependencies = backendDependencies.filter(
    (dep) =>
      !backendPackageJson.dependencies || !backendPackageJson.dependencies[dep]
  );
  const missingDevDependencies = backendDevDependencies.filter(
    (dep) =>
      !backendPackageJson.devDependencies ||
      !backendPackageJson.devDependencies[dep]
  );

  if (missingDependencies.length > 0) {
    console.log(
      `Installing missing dependencies: ${missingDependencies.join(", ")}`
    );
    try {
      execSync(
        `cd ${path.join(
          __dirname,
          "backend"
        )} && npm install ${missingDependencies.join(" ")} --save`,
        { stdio: "inherit" }
      );
    } catch (error) {
      console.error("Error installing dependencies:", error.message);
    }
  }

  if (missingDevDependencies.length > 0) {
    console.log(
      `Installing missing dev dependencies: ${missingDevDependencies.join(
        ", "
      )}`
    );
    try {
      execSync(
        `cd ${path.join(
          __dirname,
          "backend"
        )} && npm install ${missingDevDependencies.join(" ")} --save-dev`,
        { stdio: "inherit" }
      );
    } catch (error) {
      console.error("Error installing dev dependencies:", error.message);
    }
  }
} else {
  console.log("Backend package.json not found");
}

console.log("Dependency check completed!");
