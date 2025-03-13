import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all API keys for the logged in user
export const getUserApiKeys = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/apikeys`);
    return res.data;
  } catch (error) {
    console.error("Error fetching API keys:", error);
    throw error;
  }
};

// Generate a new API key
export const generateApiKey = async (keyData) => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/apikeys`, keyData);
    return res.data;
  } catch (error) {
    console.error("Error generating API key:", error);
    throw error;
  }
};

// Revoke an API key
export const revokeApiKey = async (keyId) => {
  try {
    const res = await axios.delete(`${API_URL}/api/v1/auth/apikeys/${keyId}`);
    return res.data;
  } catch (error) {
    console.error("Error revoking API key:", error);
    throw error;
  }
};

export default {
  getUserApiKeys,
  generateApiKey,
  revokeApiKey,
};
