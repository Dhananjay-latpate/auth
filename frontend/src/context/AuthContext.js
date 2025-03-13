import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import { throttle } from "../utils/throttle";

// Import utility functions
import {
  storeAuthToken,
  clearAuthToken,
  getAuthToken,
  syncToken,
} from "../utils/tokenUtils";
import { setupAxiosDefaults } from "../utils/axiosUtils";
import {
  cacheUserData,
  getCachedUserData,
  clearUserCache,
  hasRecentCache,
} from "../utils/userDataCache";

// Import services
import {
  registerUser,
  loginUser,
  logoutUser,
  fetchUserData,
} from "../services/authService";
import {
  verifyTwoFactor,
  verifyRecoveryCode,
  setup2FA,
  enable2FA,
  disable2FA,
  generateRecoveryCodes,
} from "../services/twoFactorService";
import {
  forgotPassword,
  resetPassword,
  verifyResetToken,
  updatePassword,
} from "../services/passwordService";

// Import the new services
import userService from "../services/userService";
import sessionService from "../services/sessionService";
import apiKeyService from "../services/apiKeyService";
import organizationService from "../services/organizationService";

// Create context
const AuthContext = createContext(null);

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
        const token = getAuthToken();

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

    // Cleanup intervals on unmount
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
        const token = getAuthToken();
        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`,
            {
              headers: { Authorization: `Bearer ${token.trim()}` },
            }
          );

          const data = await res.json();

          if (data.success) {
            storeAuthToken(data.token);
          }
        }
      } catch (error) {
        console.error("Token refresh failed", error);
        logout(); // If refresh fails, log the user out
      }
    }, 55 * 60 * 1000);
  };

  // Register user with improved error handling
  const register = async (userData) => {
    try {
      const data = await registerUser(userData);

      if (data.success) {
        await checkUserLoggedIn(); // Fetch user data
        setupTokenRefresh();
        router.push("/dashboard");
      }

      return data;
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Login user
  const login = async ({ email, password }) => {
    try {
      // Clear any existing auth state
      clearAuthToken();
      clearUserCache();

      const response = await loginUser({ email, password });

      // Handle 2FA requirement
      if (response.requireTwoFactor) {
        setRequiresTwoFactor(true);
        setTwoFactorEmail(response.email);
        return { requireTwoFactor: true, email: response.email };
      }

      // If we have user data in the response
      if (response.data) {
        setUser(response.data);
        cacheUserData(response.data);
        setupTokenRefresh();
      } else {
        // Otherwise fetch user data
        try {
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
            cacheUserData(userData);
            setupTokenRefresh();
          }
        } catch (err) {
          console.error("Error fetching initial user data:", err);
        }
      }

      // Redirect to dashboard with flag to prevent redirect loops
      window.location.href = "/dashboard?no_redirect=true";
      return response;
    } catch (error) {
      setError(error.message);
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Verify two-factor authentication
  const verify2FA = async (token) => {
    try {
      if (!twoFactorEmail) {
        throw new Error("No email provided for 2FA verification");
      }

      const response = await verifyTwoFactor(twoFactorEmail, token);

      if (response.success) {
        // Reset 2FA state
        setRequiresTwoFactor(false);
        setTwoFactorEmail("");
        window.location.replace("/dashboard?no_redirect=true");
      }

      return response;
    } catch (error) {
      setError(error.response?.data?.error || "Invalid verification code");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Verify recovery code
  const verifyRecovery = async (recoveryCode) => {
    try {
      if (!twoFactorEmail) {
        throw new Error("No email provided for recovery verification");
      }

      const response = await verifyRecoveryCode(twoFactorEmail, recoveryCode);

      if (response.success) {
        // Reset 2FA state
        setRequiresTwoFactor(false);
        setTwoFactorEmail("");
        window.location.replace("/dashboard?no_redirect=true");
      }

      return response;
    } catch (error) {
      setError(error.response?.data?.error || "Invalid recovery code");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Immediately clear local auth state first
      clearAuthToken();
      setUser(null);
      clearUserCache();

      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      // Call logout API (non-blocking)
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Add a small delay to ensure state updates before redirect
      setTimeout(() => {
        window.location.href = "/login?logged_out=true";
      }, 100);
    }
  };

  // Check if user is logged in with concurrency handling
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

    // Use very recent cached data without API call
    if (hasRecentCache()) {
      const cachedUser = getCachedUserData();
      console.log("[Auth] Using very recent cached data, skipping API call");
      setUser(cachedUser);
      return cachedUser;
    }

    authPromiseRef.current = (async () => {
      try {
        // Always try to use cached data first
        const cachedUser = getCachedUserData();
        if (cachedUser) {
          setUser(cachedUser);
        }

        // Get token from storage
        const token = getAuthToken();

        if (!token) {
          setUser(null);
          clearUserCache();
          return null;
        }

        // Ensure token is stored in all places
        syncToken(token);
        setupAxiosDefaults(token);

        // Add delay if we have cached data already
        if (cachedUser) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Fetch fresh user data
        console.log("Fetching user data from API");

        const userData = await fetchUserData();

        if (userData) {
          console.log("[Auth] Successfully fetched user data");
          setUser(userData);
          cacheUserData(userData);
          setupTokenRefresh();
          return userData;
        }

        return null;
      } catch (error) {
        console.error("Error fetching user:", error);

        // Handle rate limiting
        if (error.response?.status === 429) {
          console.warn("Rate limited when fetching user data");
          setRateLimited(true);

          // Use cached data when rate limited
          const cachedUser = getCachedUserData();
          if (cachedUser) {
            setUser(cachedUser);
          }

          // Schedule retry after the rate limit window
          const retryAfter = error.response?.data?.retryAfter || 60;
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
          clearAuthToken();
          clearUserCache();
        }
      } finally {
        setLoading(false);
        authPromiseRef.current = null;
      }
      return null;
    })();

    return authPromiseRef.current;
  }

  // Check if user has specified permission
  const hasPermission = (permission) => {
    if (!user) return false;
    if (["admin", "superadmin"].includes(user.role)) {
      return true;
    }
    return user.permissions && user.permissions.includes(permission);
  };

  // Create the auth context value object with all the methods
  const authContextValue = {
    user,
    loading,
    error,
    requiresTwoFactor,
    twoFactorEmail,
    rateLimited,
    register,
    login,
    logout,
    verifyTwoFactor: verify2FA,
    verifyRecoveryCode: verifyRecovery,
    hasPermission,
    checkUserLoggedIn: throttledCheckUserLoggedIn,

    // Pass through service methods with error handling
    setup2FA: async () => {
      try {
        const res = await setup2FA();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to setup 2FA");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    enable2FA: async (token) => {
      try {
        const res = await enable2FA(token);
        await checkUserLoggedIn();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to enable 2FA");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    disable2FA: async (token) => {
      try {
        const res = await disable2FA(token);
        await checkUserLoggedIn();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to disable 2FA");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    generateRecoveryCodes: async () => {
      try {
        const res = await generateRecoveryCodes();
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to generate recovery codes"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    forgotPassword: async (email) => {
      const res = await forgotPassword(email);
      if (!res.success) {
        setError(res.message);
        setTimeout(() => setError(null), 5000);
      }
      return res;
    },
    resetPassword: async (token, password, confirmPassword) => {
      try {
        const res = await resetPassword(token, password, confirmPassword);
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to reset password");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    verifyResetToken: async (token) => await verifyResetToken(token),
    updatePassword: async (currentPassword, newPassword) => {
      try {
        const res = await updatePassword(currentPassword, newPassword);
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to update password");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },

    // Add new user profile methods
    getUserProfile: async () => {
      try {
        const res = await userService.getUserProfile();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch user profile");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    updateUserProfile: async (profileData) => {
      try {
        const res = await userService.updateUserProfile(profileData);
        await checkUserLoggedIn();
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to update user profile"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    updateUserAvatar: async (imageFile) => {
      try {
        const res = await userService.updateUserAvatar(imageFile);
        await checkUserLoggedIn();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to update avatar");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },

    // Add session management methods
    getUserSessions: async () => {
      try {
        const res = await sessionService.getUserSessions();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch sessions");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    revokeSession: async (sessionId) => {
      try {
        const res = await sessionService.revokeSession(sessionId);
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to revoke session");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    revokeAllOtherSessions: async () => {
      try {
        const res = await sessionService.revokeAllOtherSessions();
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to revoke other sessions"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },

    // Add API key management methods
    getUserApiKeys: async () => {
      try {
        const res = await apiKeyService.getUserApiKeys();
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to fetch API keys");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    generateApiKey: async (keyData) => {
      try {
        const res = await apiKeyService.generateApiKey(keyData);
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to generate API key");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    revokeApiKey: async (keyId) => {
      try {
        const res = await apiKeyService.revokeApiKey(keyId);
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to revoke API key");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },

    // Add organization methods
    getUserOrganizations: async () => {
      try {
        const res = await organizationService.getUserOrganizations();
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to fetch organizations"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    getOrganization: async (orgId) => {
      try {
        const res = await organizationService.getOrganization(orgId);
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to fetch organization details"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    createOrganization: async (orgData) => {
      try {
        const res = await organizationService.createOrganization(orgData);
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to create organization"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    updateOrganization: async (orgId, orgData) => {
      try {
        const res = await organizationService.updateOrganization(
          orgId,
          orgData
        );
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to update organization"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    getOrganizationMembers: async (orgId) => {
      try {
        const res = await organizationService.getOrganizationMembers(orgId);
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to fetch organization members"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    inviteUserToOrganization: async (orgId, userData) => {
      try {
        const res = await organizationService.inviteUserToOrganization(
          orgId,
          userData
        );
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to invite user to organization"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    leaveOrganization: async (orgId) => {
      try {
        const res = await organizationService.leaveOrganization(orgId);
        return res;
      } catch (error) {
        setError(error.response?.data?.error || "Failed to leave organization");
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    removeUserFromOrganization: async (orgId, userId) => {
      try {
        const res = await organizationService.removeUserFromOrganization(
          orgId,
          userId
        );
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error ||
            "Failed to remove user from organization"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
    deleteOrganization: async (orgId) => {
      try {
        const res = await organizationService.deleteOrganization(orgId);
        return res;
      } catch (error) {
        setError(
          error.response?.data?.error || "Failed to delete organization"
        );
        setTimeout(() => setError(null), 5000);
        throw error;
      }
    },
  };

  return (
    <AuthContext.Provider value={authContextValue}>
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
