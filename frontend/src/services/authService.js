import axios from "axios";
import { storeAuthToken, getAuthToken } from "../utils/tokenUtils";
import { cacheUserData } from "../utils/userDataCache";
import { createAuthenticatedRequest } from "../utils/axiosUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Register a new user
export const registerUser = async (userData) => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/register`, userData, {
      withCredentials: true,
    });

    if (res.data.success && res.data.token) {
      storeAuthToken(res.data.token);
    }

    return res.data;
  } catch (error) {
    console.error("Registration error:", error);
    handleAuthError(error, "Registration failed. Please try again later.");
    throw error;
  }
};

// Login user
export const loginUser = async ({ email, password }) => {
  try {
    console.log(`[Auth] Login attempt for: ${email}`);

    const res = await axios.post(`${API_URL}/api/v1/auth/login`, {
      email,
      password,
    });

    if (res.data.success) {
      // Check if two-factor auth is required
      if (res.data.requireTwoFactor) {
        console.log("[Auth] 2FA required for login");
        return {
          requireTwoFactor: true,
          email: res.data.email,
        };
      }

      console.log("[Auth] Login successful, setting token");
      const token = res.data.token;

      if (!token) {
        console.error("[Auth] No token received in successful login response");
        throw new Error("No authentication token received");
      }

      storeAuthToken(token);

      // Use response data if available
      if (res.data.data) {
        cacheUserData(res.data.data);
      }

      return res.data;
    }

    throw new Error(res.data.error || "Login failed");
  } catch (error) {
    console.error("Login error:", error);
    let errorMessage = "Login failed. Please check your credentials.";

    if (error.response) {
      if (error.response.status === 429) {
        errorMessage = "Too many login attempts. Please try again later.";
      } else if (error.response.data?.error) {
        errorMessage = error.response.data.error;
      }
    }

    throw { ...error, message: errorMessage };
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    // Call logout API (non-blocking)
    const token = getAuthToken();
    if (token) {
      try {
        await axios.get(`${API_URL}/api/v1/auth/logout`);
        console.log("[Auth] Logout API call successful");
      } catch (error) {
        console.error("[Auth] Logout API call error:", error);
        // Continue with client-side logout even if API call fails
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false, error };
  }
};

// Get current user data
export const fetchUserData = async () => {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const authRequest = createAuthenticatedRequest(token);

    // Generate a unique cache-busting parameter
    const cacheBuster = `t=${Date.now()}`;

    const res = await authRequest.get(
      `${API_URL}/api/v1/auth/me?${cacheBuster}`,
      {
        timeout: 10000,
      }
    );

    if (res.data.success) {
      console.log("[Auth] Successfully fetched user data");
      return res.data.data;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Helper for handling errors
const handleAuthError = (error, defaultMessage) => {
  let errorMessage = defaultMessage;

  if (error.response) {
    const { status, data } = error.response;

    if (status === 409 || data?.code === 11000) {
      errorMessage = data?.error || "This email is already registered";
    } else if (data?.validationError) {
      errorMessage = data.error || "Please check your information";
    } else if (data?.error) {
      errorMessage = data.error;
    } else if (status === 400) {
      errorMessage = "Invalid input. Please check your information";
    } else if (status === 429) {
      errorMessage = "Too many attempts. Please try again later";
    } else if (status === 500) {
      errorMessage = "Server error. Please try again later";
    }
  }

  return errorMessage;
};
