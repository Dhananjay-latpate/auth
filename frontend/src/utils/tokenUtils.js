import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { setupAxiosDefaults } from "./axiosUtils";

// Store authentication token in cookies and localStorage
export const storeAuthToken = (token) => {
  if (!token) {
    console.error("[Auth] Attempted to store empty token");
    return;
  }

  try {
    // Clean the token to remove any whitespace
    const cleanToken = token.trim();
    console.log("[Auth] Storing authentication token");

    // Store in cookie
    setCookie("token", cleanToken, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // Also save to localStorage for backup
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", cleanToken);
    }

    // Set default authorization header
    setupAxiosDefaults(cleanToken);

    console.log("[Auth] Token stored successfully");
    return true;
  } catch (error) {
    console.error("[Auth] Error storing token:", error);
    return false;
  }
};

// Clear authentication token from all storage
export const clearAuthToken = () => {
  deleteCookie("token", { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
  setupAxiosDefaults(null);
};

// Get the authentication token from storage
export const getAuthToken = () => {
  return (
    getCookie("token") ||
    (typeof window !== "undefined" && localStorage.getItem("auth_token"))
  );
};

// Ensure token is stored in all places
export const syncToken = (token) => {
  if (!token) return;

  token = token.trim();

  // If token exists in localStorage but not in cookie, restore it
  if (!getCookie("token") && typeof window !== "undefined") {
    setCookie("token", token, {
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
  }
};
