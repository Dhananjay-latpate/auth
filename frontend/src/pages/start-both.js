const { spawn } = require("child_process");
const path = require("path");

console.log("Starting both frontend and backend servers...");

// Start the backend server
const backendProcess = spawn("node", ["run.js"], {
  cwd: path.join(__dirname, "backend"),
  stdio: "inherit",
});

console.log("Backend server starting...");

// Wait for backend to initialize
setTimeout(() => {
  // Start the frontend server
  const frontendProcess = spawn("node", ["run.js"], {
    cwd: path.join(__dirname, "frontend"),
    stdio: "inherit",
  });

  console.log("Frontend server starting...");

  // Handle interruption
  process.on("SIGINT", () => {
    console.log("Stopping all servers...");
    backendProcess.kill();
    frontendProcess.kill();
    process.exit();
  });
}, 3000); // Give backend 3 seconds to start up
