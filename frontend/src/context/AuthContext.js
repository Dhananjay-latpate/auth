import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { throttle } from "../utils/throttle";

// Create context
const AuthContext = createContext(null);

// Setup axios defaults and interceptors to handle auth
const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Update token storage to use only cookies
const storeAuthToken = (token) => {
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

const clearAuthToken = () => {
  deleteCookie("token", { path: "/" });
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
  }
  delete axios.defaults.headers.common["Authorization"];
};

// Create a more resilient user data cache
const USER_CACHE_KEY = "user_data";
const USER_CACHE_TIMESTAMP_KEY = "user_data_timestamp";
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

const cacheUserData = (userData) => {
  if (typeof window !== "undefined" && userData) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_CACHE_TIMESTAMP_KEY, Date.now().toString());
  }
};

const getCachedUserData = () => {
  if (typeof window === "undefined") return null;

  try {
    const cachedData = localStorage.getItem(USER_CACHE_KEY);
    const timestamp = localStorage.getItem(USER_CACHE_TIMESTAMP_KEY);

    if (!cachedData || !timestamp) return null;

    // Check if cache is still valid
    const now = Date.now();
    const cacheAge = now - parseInt(timestamp);

    if (cacheAge > CACHE_MAX_AGE) {
      // Cache expired
      return null;
    }

    return JSON.parse(cachedData);
  } catch (error) {
    console.error("Error reading cached user data:", error);
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(USER_CACHE_TIMESTAMP_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [rateLimited, setRateLimited] = useState(false);

  const router = useRouter();

  // Use refs for concurrency and interval management
  const authPromiseRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);
  const apiRetryTimeoutRef = useRef(null);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Try to load cached user data immediately to avoid initial loading state
        const cachedUser = getCachedUserData();
        if (cachedUser) {
          setUser(cachedUser);
          setLoading(false);
        }

        // Get token from localStorage or cookie
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("auth_token") || getCookie("token")
            : null;

        if (token) {
          // Set default authorization header
          setupAxiosDefaults(token.trim());
          await checkUserLoggedIn();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
      }
    };

    initAuth();

    // Cleanup the token refresh interval on unmount
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
      if (apiRetryTimeoutRef.current) {
        clearTimeout(apiRetryTimeoutRef.current);
      }
    };
  }, []);

  // Throttled version of checkUserLoggedIn to prevent too many calls
  const throttledCheckUserLoggedIn = throttle(checkUserLoggedIn, 2000);

  // Setup a token refresh mechanism
  const setupTokenRefresh = () => {
    // Clear any existing interval
    if (tokenRefreshIntervalRef.current) {
      clearInterval(tokenRefreshIntervalRef.current);
    }

    // Refresh token every 55 minutes (just before standard 1-hour expiration)
    tokenRefreshIntervalRef.current = setInterval(async () => {
      try {
        const token = getCookie("token");
        if (token) {
          const refreshRes = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
            {
              headers: {
                Authorization: `Bearer ${token.trim()}`,
              },
            }
          );

          if (refreshRes.data.success) {
            const newToken = refreshRes.data.token.trim();
            setCookie("token", newToken, {
              maxAge: 30 * 24 * 60 * 60, // 30 days
              path: "/",
            });
            // Update axios default header with the new token
            setupAxiosDefaults(newToken);
          }
        }
      } catch (error) {
        console.error("Token refresh failed", error);
        // If refresh fails, log the user out
        logout();
      }
    }, 55 * 60 * 1000);
  };

  // Register user with improved error handling
  const register = async (userData) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register`,
        userData,
        { withCredentials: true }
      );

      if (res.data.success) {
        setCookie("token", res.data.token.trim(), {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });
        await checkUserLoggedIn(); // Fetch user data
        setupTokenRefresh();
        router.push("/dashboard");
      }

      return res.data;
    } catch (error) {
      console.error("Registration error:", error);

      // Format meaningful error message based on error type
      let errorMessage = "Registration failed. Please try again later.";

      // Handle specific error types
      if (error.response) {
        const { status, data } = error.response;

        // Handle duplicate email (409 Conflict or code 11000)
        if (status === 409 || data?.code === 11000) {
          errorMessage =
            data?.error ||
            "This email is already registered. Please try logging in instead.";
        }
        // Handle validation errors
        else if (data?.validationError) {
          errorMessage =
            data.error || "Please check your information and try again.";
        }
        // Handle other API errors with messages
        else if (data?.error) {
          errorMessage = data.error;
        }
        // Handle other status codes
        else if (status === 400) {
          errorMessage =
            "Invalid input. Please check your information and try again.";
        } else if (status === 429) {
          errorMessage = "Too many attempts. Please try again later.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      // Update global error state
      setError(errorMessage);

      // Clear error after timeout
      setTimeout(() => setError(null), 5000);

      // Re-throw for component-level handling
      throw error;
    }
  };

  // Login user
  const login = async ({ email, password }) => {
    try {
      // Clear any existing auth state
      clearAuthToken();
      localStorage.removeItem("auth_token");
      sessionStorage.clear();

      console.log(`[Auth] Login attempt for: ${email}`);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        { email, password }
      );

      if (res.data.success) {
        // Check if two-factor auth is required
        if (res.data.requireTwoFactor) {
          console.log("[Auth] 2FA required for login");
          setRequiresTwoFactor(true);
          setTwoFactorEmail(res.data.email);
          return { requireTwoFactor: true, email: res.data.email };
        }

        console.log("[Auth] Login successful, setting token");
        const token = res.data.token;

        if (!token) {
          console.error(
            "[Auth] No token received in successful login response"
          );
          throw new Error("No authentication token received");
        }

        storeAuthToken(token);

        // Use a simpler approach - set the user from response data if available
        if (res.data.data) {
          setUser(res.data.data);
          cacheUserData(res.data.data);
          setupTokenRefresh();

          // Redirect to dashboard with flag to prevent redirect loops
          console.log("[Auth] Redirecting to dashboard after login");
          window.location.href = "/dashboard?no_redirect=true";
          return res.data;
        }

        // Fetch user data if not included in response
        try {
          const userData = await fetchUserData(token);
          if (userData) {
            setUser(userData);
            cacheUserData(userData);
            setupTokenRefresh();
          }

          // Redirect to dashboard with flag to prevent redirect loops
          console.log("[Auth] Redirecting to dashboard after login");
          window.location.href = "/dashboard?no_redirect=true";
          return res.data;
        } catch (err) {
          console.error("Error fetching initial user data:", err);
          // Still redirect even if we can't get user data - the token is valid
          window.location.href = "/dashboard?no_redirect=true";
          return res.data;
        }
      } else {
        console.error("[Auth] Login failed but no error returned from server");
        throw new Error(res.data.error || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";

      if (error.response) {
        // Handle rate limiting
        if (error.response.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        }
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Helper function to fetch user data with a specific token
  const fetchUserData = async (token) => {
    try {
      // Set up headers with the provided token
      const headers = { Authorization: `Bearer ${token.trim()}` };

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
        {
          headers,
          timeout: 10000,
          // Add cache-busting query param
          params: { t: Date.now() },
        }
      );

      if (res.data.success) {
        return res.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error fetching specific user data:", error);
      throw error;
    }
  };

  // Verify two-factor authentication
  const verifyTwoFactor = async (token) => {
    try {
      if (!twoFactorEmail) {
        throw new Error("No email provided for 2FA verification");
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/verify`,
        { email: twoFactorEmail, token }
      );

      if (res.data.success) {
        // Reset 2FA state
        setRequiresTwoFactor(false);
        setTwoFactorEmail("");

        // Store token and redirect
        storeAuthToken(res.data.token);
        window.location.replace("/dashboard?no_redirect=true");
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("2FA verification error:", error);
      setError(error.response?.data?.error || "Invalid verification code");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Verify recovery code for 2FA
  const verifyRecoveryCode = async (recoveryCode) => {
    try {
      if (!twoFactorEmail) {
        throw new Error("No email provided for recovery code verification");
      }

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/verify-recovery`,
        { email: twoFactorEmail, recoveryCode }
      );

      if (res.data.success) {
        // Reset 2FA state
        setRequiresTwoFactor(false);
        setTwoFactorEmail("");

        // Store token and redirect
        storeAuthToken(res.data.token);
        window.location.replace("/dashboard?no_redirect=true");
        return res.data;
      }
      return null;
    } catch (error) {
      console.error("Recovery code verification error:", error);
      setError(error.response?.data?.error || "Invalid recovery code");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Update logout function
  const logout = async () => {
    try {
      const token = getCookie("token");

      // Immediately clear local auth state first
      clearAuthToken();
      setUser(null);
      localStorage.removeItem(USER_CACHE_KEY);
      localStorage.removeItem(USER_CACHE_TIMESTAMP_KEY);

      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      // Call logout API (non-blocking)
      if (token) {
        try {
          await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`
          );
          console.log("[Auth] Logout API call successful");
        } catch (error) {
          console.error("[Auth] Logout API call error:", error);
          // Continue with client-side logout even if API call fails
        }
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Add a small delay to ensure state updates before redirect
      setTimeout(() => {
        window.location.href = "/login?logged_out=true";
      }, 100);
    }
  };

  // Check if user is logged in with concurrency handling using a stored promise
  // Apply improvements to handle rate limiting
  async function checkUserLoggedIn() {
    console.log("[Auth] Checking login state");

    if (authPromiseRef.current) {
      console.log("[Auth] Auth check already in progress");
      return authPromiseRef.current;
    }

    if (rateLimited) {
      console.log("[Auth] Rate limited, using cached data");
      return user; // Return current user state if rate limited
    }

    // If we have recent cached user data (< 30 seconds old), use it without API call
    const cachedUser = getCachedUserData();
    const now = Date.now();
    const cacheTimestamp = parseInt(
      localStorage.getItem(USER_CACHE_TIMESTAMP_KEY) || "0"
    );
    const cacheAge = now - cacheTimestamp;

    if (cachedUser && cacheAge < 30000) {
      // 30 seconds
      console.log("[Auth] Using very recent cached data, skipping API call");
      setUser(cachedUser);
      return cachedUser;
    }

    authPromiseRef.current = (async () => {
      try {
        // Always try to use cached data first
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Retrieve token from cookie or localStorage
        let token =
          getCookie("token") ||
          (typeof window !== "undefined" && localStorage.getItem("auth_token"));

        if (!token) {
          setUser(null);
          localStorage.removeItem(USER_CACHE_KEY);
          localStorage.removeItem(USER_CACHE_TIMESTAMP_KEY);
          return null;
        }

        token = token.trim();
        setupAxiosDefaults(token);

        // If token exists in localStorage but not in cookie, restore it
        if (!getCookie("token") && typeof window !== "undefined") {
          setCookie("token", token, {
            maxAge: 30 * 24 * 60 * 60,
            path: "/",
          });
        }

        // Add delay between API calls to reduce load
        if (cachedUser) {
          // If we have cached data already, delay new API call slightly
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Fetch fresh user data from the API
        console.log("Fetching user data from API");

        // Generate a unique cache-busting parameter
        const cacheBuster = `t=${Date.now()}`;

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me?${cacheBuster}`,
          {
            headers: {
              "Cache-Control": "no-cache",
              Authorization: `Bearer ${token.trim()}`,
            },
            timeout: 10000,
          }
        );

        if (res.data.success) {
          console.log("[Auth] Successfully fetched user data");
          setUser(res.data.data);
          cacheUserData(res.data.data);
          setupTokenRefresh();
          return res.data.data;
        }

        return null;
      } catch (error) {
        console.error("Error fetching user:", error);

        // Handle rate limiting specifically
        if (error.response?.status === 429) {
          console.warn("Rate limited when fetching user data");
          setRateLimited(true);

          // Use cached data when rate limited
          const cachedUser = getCachedUserData();
          if (cachedUser) {
            console.log("Using cached user data during rate limiting");
            setUser(cachedUser);
          }

          // Schedule retry after the rate limit window
          const retryAfter = error.response?.data?.retryAfter || 60; // Default to 60 seconds
          console.log(`Will retry after ${retryAfter} seconds`);

          if (apiRetryTimeoutRef.current) {
            clearTimeout(apiRetryTimeoutRef.current);
          }

          apiRetryTimeoutRef.current = setTimeout(() => {
            console.log(
              "Rate limit period expired, resetting rate limited state"
            );
            setRateLimited(false);
            apiRetryTimeoutRef.current = null;
          }, retryAfter * 1000);

          return cachedUser;
        }

        if (error.response && error.response.status === 401) {
          console.log("Unauthorized access - clearing tokens");
          setUser(null);
          deleteCookie("token", { path: "/" });
          localStorage.removeItem("auth_token");
          localStorage.removeItem(USER_CACHE_KEY);
          localStorage.removeItem(USER_CACHE_TIMESTAMP_KEY);
          delete axios.defaults.headers.common["Authorization"];
        }
      } finally {
        setLoading(false);
        authPromiseRef.current = null;
      }
      return null;
    })();

    return authPromiseRef.current;
  }

  // Setup Two-Factor Authentication
  const setup2FA = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/setup`
      );

      return res.data;
    } catch (error) {
      console.error("2FA setup error:", error);
      setError(error.response?.data?.error || "Failed to setup 2FA");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Enable Two-Factor Authentication
  const enable2FA = async (token) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/enable`,
        { token }
      );

      // Refresh user data to reflect 2FA status
      await checkUserLoggedIn();
      return res.data;
    } catch (error) {
      console.error("Enable 2FA error:", error);
      setError(error.response?.data?.error || "Failed to enable 2FA");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Disable Two-Factor Authentication
  const disable2FA = async (token) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/disable`,
        { token }
      );

      // Refresh user data to reflect 2FA status
      await checkUserLoggedIn();
      return res.data;
    } catch (error) {
      console.error("Disable 2FA error:", error);
      setError(error.response?.data?.error || "Failed to disable 2FA");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Generate recovery codes for 2FA
  const generateRecoveryCodes = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/2fa/recovery-codes`
      );
      return res.data;
    } catch (error) {
      console.error("Generate recovery codes error:", error);
      setError(
        error.response?.data?.error || "Failed to generate recovery codes"
      );
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Request password reset
  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/forgotpassword`,
        { email }
      );
      return res.data;
    } catch (error) {
      console.error("Forgot password error:", error);
      // Always return a consistent message to prevent user enumeration
      const message =
        error.response?.status === 429
          ? "Too many reset attempts. Please try again later."
          : "If a user with that email exists, a reset link has been sent.";

      setError(message);
      setTimeout(() => setError(null), 5000);
      return { success: false, message };
    }
  };

  // Reset password using token
  const resetPassword = async (token, password, confirmPassword) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/resetpassword/${token}`,
        { password, confirmPassword }
      );

      if (res.data.success) {
        return res.data;
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError(
        error.response?.data?.error ||
          "Failed to reset password. Please try again."
      );
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Verify reset password token
  const verifyResetToken = async (token) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/verifytoken/${token}`
      );
      return res.data;
    } catch (error) {
      console.error("Verify token error:", error);
      return { success: false, error: "Invalid or expired token" };
    }
  };

  // Update password
  const updatePassword = async (currentPassword, newPassword) => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/updatepassword`,
        { currentPassword, newPassword }
      );
      return res.data;
    } catch (error) {
      console.error("Update password error:", error);
      setError(
        error.response?.data?.error ||
          "Failed to update password. Please try again."
      );
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Check if user has specified permission
  const hasPermission = (permission) => {
    if (!user) return false;
    if (["admin", "superadmin"].includes(user.role)) {
      return true;
    }
    return user.permissions && user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        requiresTwoFactor,
        twoFactorEmail,
        rateLimited,
        register,
        login,
        logout,
        verifyTwoFactor,
        verifyRecoveryCode,
        hasPermission,
        checkUserLoggedIn: throttledCheckUserLoggedIn, // Use the throttled version
        setup2FA,
        enable2FA,
        disable2FA,
        generateRecoveryCodes,
        forgotPassword,
        resetPassword,
        verifyResetToken,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
