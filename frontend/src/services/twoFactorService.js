import axios from "axios";
import { storeAuthToken } from "../utils/tokenUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Verify two-factor authentication code
export const verifyTwoFactor = async (email, token) => {
  try {
    if (!email) {
      throw new Error("No email provided for 2FA verification");
    }

    const res = await axios.post(`${API_URL}/api/v1/auth/2fa/verify`, {
      email,
      token,
    });

    if (res.data.success) {
      storeAuthToken(res.data.token);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("2FA verification error:", error);
    throw error;
  }
};

// Verify recovery code for 2FA
export const verifyRecoveryCode = async (email, recoveryCode) => {
  try {
    if (!email) {
      throw new Error("No email provided for recovery code verification");
    }

    const res = await axios.post(`${API_URL}/api/v1/auth/2fa/verify-recovery`, {
      email,
      recoveryCode,
    });

    if (res.data.success) {
      storeAuthToken(res.data.token);
      return res.data;
    }
    return null;
  } catch (error) {
    console.error("Recovery code verification error:", error);
    throw error;
  }
};

// Setup Two-Factor Authentication
export const setup2FA = async () => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/2fa/setup`);
    return res.data;
  } catch (error) {
    console.error("2FA setup error:", error);
    throw error;
  }
};

// Enable Two-Factor Authentication
export const enable2FA = async (token) => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/2fa/enable`, {
      token,
    });
    return res.data;
  } catch (error) {
    console.error("Enable 2FA error:", error);
    throw error;
  }
};

// Disable Two-Factor Authentication
export const disable2FA = async (token) => {
  try {
    const res = await axios.post(`${API_URL}/api/v1/auth/2fa/disable`, {
      token,
    });
    return res.data;
  } catch (error) {
    console.error("Disable 2FA error:", error);
    throw error;
  }
};

// Generate recovery codes for 2FA
export const generateRecoveryCodes = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/v1/auth/2fa/recovery-codes`);
    return res.data;
  } catch (error) {
    console.error("Generate recovery codes error:", error);
    throw error;
  }
};
