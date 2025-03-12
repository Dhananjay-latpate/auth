const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const logger = require("../middleware/logger"); // Import our new logger
const { apiLimiter } = require("./middleware/rateLimit"); // Import rate limiter

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require("./routes/auth");
const users = require("./routes/users");
const roles = require("./routes/roles"); // Add roles routes

const app = express();

// Body parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Cookie parser
app.use(cookieParser());

// Security middleware
app.use(helmet()); // Set security headers
app.use(xss()); // Prevent XSS attacks
app.use(mongoSanitize()); // Prevent NoSQL injection

// Configure CORS to allow both development ports
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests from these origins
      const allowedOrigins = [
        "http://localhost:3000",
        "http://localhost:3001",
        process.env.FRONTEND_URL,
      ];

      // Allow requests with no origin (like mobile apps, curl requests, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 mins
  max: 100, // 100 requests per 10 mins
});
app.use("/api/", limiter);

// Apply rate limiter to all requests
app.use(apiLimiter);

// Use auth logger middleware
app.use(logger);

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/roles", roles); // Mount roles router

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
