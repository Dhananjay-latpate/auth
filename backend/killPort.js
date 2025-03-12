const { execSync } = require("child_process");
const readline = require("readline");

const PORT = process.env.PORT || 5000;

console.log(`Looking for processes using port ${PORT}...`);

try {
  // Find the process ID using the port
  const findProcessCmd = `lsof -i:${PORT} -t`;
  let pid;

  try {
    pid = execSync(findProcessCmd).toString().trim();
  } catch (error) {
    console.log(`No process found using port ${PORT}.`);
    process.exit(0);
  }

  if (!pid) {
    console.log(`No process found using port ${PORT}.`);
    process.exit(0);
  }

  console.log(`Process found with PID: ${pid}`);

  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `Do you want to kill the process using port ${PORT}? (y/n) `,
    (answer) => {
      if (answer.toLowerCase() === "y") {
        try {
          execSync(`kill -9 ${pid}`);
          console.log(`Successfully killed process ${pid} using port ${PORT}.`);
        } catch (error) {
          console.error(
            `Failed to kill process. You might need sudo: sudo kill -9 ${pid}`
          );
        }
      } else {
        console.log(
          "Process not killed. Please free up the port manually or use a different port."
        );
      }
      rl.close();
    }
  );
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
