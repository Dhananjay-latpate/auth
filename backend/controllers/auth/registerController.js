const User = require("../../models/User");
const asyncHandler = require("../../middleware/async");
const ErrorResponse = require("../../utils/errorResponse");
const {
  sendTokenResponse,
  isValidEmail,
  isStrongPassword,
  sanitizeInput,
} = require("./helpers");

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  let { name, email, password, role, createdByAdmin } = req.body;

  // Sanitize inputs to prevent injection attacks
  name = sanitizeInput(name);
  email = sanitizeInput(email)?.toLowerCase();

  // Enhanced input validation
  if (!name || !email || !password) {
    return next(new ErrorResponse("Please provide all required fields", 400));
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return next(new ErrorResponse("Please provide a valid email address", 400));
  }

  // Validate password strength
  if (!isStrongPassword(password)) {
    return next(
      new ErrorResponse(
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        400
      )
    );
  }

  try {
    // Check if user already exists - case insensitive search to prevent duplicates with different case
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });

    if (existingUser) {
      // Don't reveal if the account exists for security reasons
      console.log(`Registration attempted with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        error: "This email address is already registered",
        code: 11000,
        field: "email",
      });
    }

    // Check if this registration is being done by an admin
    let userRole = "user"; // Default role

    // If this is an admin-created user and the requester is an admin
    if (
      createdByAdmin &&
      req.user &&
      ["admin", "superadmin"].includes(req.user.role)
    ) {
      // Allow role specification for admin-created users
      userRole = role || "user";

      // Validate that the role is one of the allowed roles
      const allowedRoles = ["user", "editor", "admin"];
      if (!allowedRoles.includes(userRole)) {
        userRole = "user"; // Default to user if invalid role is provided
      }

      console.log(
        `Admin ${req.user.name} is creating a new user with role: ${userRole}`
      );
    }

    // Create user with appropriate role
    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      createdBy: req.user ? req.user._id : null, // Track who created this user
      ipAddress: req.ip, // Store IP address for security tracking
      userAgent: req.headers["user-agent"], // Store user agent for security
    });

    // Log successful registration
    console.log(`User registered successfully: ${email}, role: ${userRole}`);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error - this is a fallback if the initial check misses
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        error: `An account with this ${field} already exists`,
        code: 11000,
        field: field,
      });
    }

    // Handle validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
        validationError: true,
      });
    }

    // Handle other errors
    return next(new ErrorResponse("Server error during registration", 500));
  }
});
