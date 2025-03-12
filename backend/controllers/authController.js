// ... existing imports ...

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide all required fields",
      });
    }

    // Check if user already exists - case insensitive search to prevent duplicates with different case
    const existingUser = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
    });
    if (existingUser) {
      console.log(`Registration attempted with existing email: ${email}`);
      return res.status(409).json({
        success: false,
        error: "This email address is already registered",
        code: 11000,
        field: "email",
      });
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      role: "user", // Default role
    });

    // Generate and send token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Handle MongoDB duplicate key error - this is a fallback if the initial check misses
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const value = error.keyValue[field];

      return res.status(409).json({
        success: false,
        error: `An account with this ${field} (${value}) already exists`,
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
    res.status(500).json({
      success: false,
      error: "Server error during registration",
    });
  }
};

// ... existing code ...
