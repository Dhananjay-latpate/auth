const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

console.log("Starting the Secure Authentication System frontend server...");

// Function to check environment configuration
function checkEnvConfig() {
  const envPath = path.join(__dirname, ".env.local");

  // Check if .env.local exists, create it if it doesn't
  if (!fs.existsSync(envPath)) {
    console.log("Creating default .env.local file...");

    const envContent = `NEXT_PUBLIC_API_URL=http://localhost:5000
# Change this to match your backend server URL
`;

    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(".env.local created successfully");
  } else {
    console.log(".env.local configuration found");
  }
}

// Function to check if all dependencies are installed
function checkDependencies() {
  try {
    // Check if node_modules exists
    if (!fs.existsSync(path.join(__dirname, "node_modules"))) {
      console.log("Installing dependencies...");
      execSync("npm install", { stdio: "inherit", cwd: __dirname });
      console.log("Dependencies installed successfully");
    } else {
      console.log("Dependencies already installed");
    }
  } catch (error) {
    console.error("Error installing dependencies:", error.message);
    process.exit(1);
  }
}

// Function to start development server
function startDevServer() {
  console.log("Starting development server...");

  const port = process.env.PORT || 3000;

  // Check if the port is available
  try {
    execSync(`lsof -i:${port} -t`, { stdio: "pipe" });
    console.log(
      `Warning: Port ${port} is already in use. The server might fail to start.`
    );
  } catch (error) {
    // Port is available - do nothing
  }

  // Start Next.js development server
  const serverProcess = spawn("npm", ["run", "dev"], {
    cwd: path.resolve(__dirname),
    stdio: "inherit",
  });

  serverProcess.on("close", (code) => {
    if (code !== 0) {
      console.log(`Server process exited with code ${code}`);
    }
  });

  // Handle application termination
  process.on("SIGINT", () => {
    serverProcess.kill();
    process.exit();
  });
}

// Main execution function
async function main() {
  checkEnvConfig();
  checkDependencies();
  startDevServer();
}

// Run the main function
main().catch((error) => {
  console.error("Failed to start frontend server:", error);
  process.exit(1);
});
