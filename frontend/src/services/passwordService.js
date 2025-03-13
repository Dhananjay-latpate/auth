import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Request password reset
export const forgotPassword = async (email) => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/forgotpassword`, {
      email,
    });
    return res.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    // Always return a consistent message to prevent user enumeration
    const message =
      error.response?.status === 429
        ? "Too many reset attempts. Please try again later."
        : "If a user with that email exists, a reset link has been sent.";

    return { success: false, message };
  }
};

// Reset password using token
export const resetPassword = async (token, password, confirmPassword) => {
  try {
    const res = await axios.put(
      `${API_URL}/api/v1/auth/resetpassword/${token}`,
      { password, confirmPassword }
    );
    return res.data;
  } catch (error) {
    console.error("Reset password error:", error);
    throw error;
  }
};

// Verify reset password token
export const verifyResetToken = async (token) => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/verifytoken/${token}`);
    return res.data;
  } catch (error) {
    console.error("Verify token error:", error);
    return { success: false, error: "Invalid or expired token" };
  }
};

// Update password for logged in user
export const updatePassword = async (currentPassword, newPassword) => {
  try {
    const res = await axios.put(`${API_URL}/api/v1/auth/updatepassword`, {
      currentPassword,
      newPassword,
    });
    return res.data;
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};
