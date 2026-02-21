const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const morgan = require("morgan");
const logger = require("./middleware/logger");
const { apiLimiter } = require("./middleware/rateLimit");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const passport = require("./config/passport");
const appLogger = require("./utils/logger");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require("./routes/auth");
const users = require("./routes/users");
const roles = require("./routes/roles");
const organizations = require("./routes/organizations");
const oauth = require("./routes/oauth");

const app = express();

// Body parser
app.use(express.json());

// File upload middleware
app.use(
  fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    createParentPath: true,
    abortOnLimit: true,
  })
);

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

// Configure CORS to allow both development ports and for static files
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

// Initialize Passport for OAuth
app.use(passport.initialize());

// Use auth logger middleware
app.use(logger);

// Serve static files
app.use(express.static("public"));

// Add specific CORS handling for static files
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // Allow any origin for images
    res.header("Access-Control-Allow-Methods", "GET");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "public", "uploads"))
);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     description: Returns the health status of the API service, including uptime and database connectivity.
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *       503:
 *         description: Service is unhealthy
 */
app.get("/health", (req, res) => {
  const mongoose = require("mongoose");
  const dbState = mongoose.connection.readyState;
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  const dbStatus = dbState === 1 ? "connected" : "disconnected";
  const healthy = dbState === 1;

  res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "degraded",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    database: dbStatus,
  });
});

// Swagger API documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Rauth API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

// Serve OpenAPI spec as JSON
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Mount routers
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/roles", roles);
app.use("/api/v1/organizations", organizations);
app.use("/api/v1/auth/oauth", oauth);

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  appLogger.info(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  appLogger.info(
    `API Documentation available at http://localhost:${PORT}/api-docs`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  appLogger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
