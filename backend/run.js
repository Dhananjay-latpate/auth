const { spawn, execSync } = require("child_process");
const path = require("path");
const readline = require("readline");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Get port from environment or use default
const PORT = process.env.PORT || 5000;

console.log("Starting the Secure Authentication System backend server...");
console.log("Please make sure MongoDB is running on localhost:27017");

// Function to check if port is in use
function isPortInUse() {
  try {
    // Try to find process using the port
    execSync(`lsof -i:${PORT} -t`, { stdio: "pipe" });
    return true;
  } catch (error) {
    return false;
  }
}

// Function to find and kill process using the port
function killProcessOnPort() {
  try {
    const pid = execSync(`lsof -i:${PORT} -t`).toString().trim();
    if (pid) {
      console.log(`Found process ${pid} using port ${PORT}`);

      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      return new Promise((resolve) => {
        rl.question(`Do you want to kill this process? (y/n): `, (answer) => {
          rl.close();
          if (answer.toLowerCase() === "y") {
            try {
              execSync(`kill -9 ${pid}`);
              console.log(
                `Successfully killed process ${pid} using port ${PORT}`
              );
              resolve(true);
            } catch (killError) {
              console.error(
                `Failed to kill process. You might need sudo: sudo kill -9 ${pid}`
              );
              resolve(false);
            }
          } else {
            console.log("Process not killed. Server will not start.");
            resolve(false);
          }
        });
      });
    }
  } catch (error) {
    return false;
  }
}

// Start server function
function startServer() {
  // Start the server with nodemon for development
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

// Check and start server
(async function () {
  if (isPortInUse()) {
    console.log(`Port ${PORT} is already in use.`);

    // Ask user to kill existing process
    const killed = await killProcessOnPort();

    // If process was killed, start the server
    if (killed) {
      // Wait a bit for the port to be freed
      setTimeout(() => {
        startServer();
      }, 1000);
    } else {
      console.log(
        `Please free up port ${PORT} or change the port in your .env file.`
      );
      process.exit(1);
    }
  } else {
    startServer();
  }
})();
