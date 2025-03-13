import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all active user sessions
export const getUserSessions = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/sessions`);
    return res.data;
  } catch (error) {
    console.error("Error fetching user sessions:", error);
    throw error;
  }
};

// Revoke a specific session
export const revokeSession = async (sessionId) => {
  try {
    const res = await axios.delete(
      `${API_URL}/api/v1/auth/sessions/${sessionId}`
    );
    return res.data;
  } catch (error) {
    console.error("Error revoking session:", error);
    throw error;
  }
};

// Revoke all other sessions except current one
export const revokeAllOtherSessions = async () => {
  try {
    const res = await axios.delete(`${API_URL}/api/v1/auth/sessions?all=true`);
    return res.data;
  } catch (error) {
    console.error("Error revoking all other sessions:", error);
    throw error;
  }
};

export default {
  getUserSessions,
  revokeSession,
  revokeAllOtherSessions,
};
