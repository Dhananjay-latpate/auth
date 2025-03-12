import { createContext, useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

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

// Add centralized error handling
const handleError = (error) => {
  const message = error.response?.data?.error || "An error occurred";
  setError(message);
  setTimeout(() => setError(null), 5000);
  return message;
};

// Update token storage to use only cookies
const storeAuthToken = (token) => {
  if (!token) return;

  setCookie("token", token.trim(), {
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  setupAxiosDefaults(token.trim());
};

const clearAuthToken = () => {
  deleteCookie("token", { path: "/" });
  delete axios.defaults.headers.common["Authorization"];
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const router = useRouter();

  // Use refs for concurrency and interval management
  const authPromiseRef = useRef(null);
  const tokenRefreshIntervalRef = useRef(null);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      // Get token from localStorage or cookie
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("auth_token") || getCookie("token")
          : null;

      if (token) {
        // Set default authorization header
        setupAxiosDefaults(token.trim());
      }
      await checkUserLoggedIn();
    };

    initAuth();

    // Cleanup the token refresh interval on unmount
    return () => {
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
    };
  }, []);

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

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        { email, password }
      );

      if (res.data.success && res.data.token) {
        console.log("[Auth] Login successful, setting token");
        storeAuthToken(res.data.token);

        // Use very explicit no_redirect to bypass all checks
        window.location.replace("/dashboard?no_redirect=true");
        return res.data;
      }
      return null;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // Update logout function
  const logout = async () => {
    try {
      const token = getCookie("token");
      clearAuthToken();
      setUser(null);

      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }

      // Call logout API (non-blocking)
      if (token) {
        await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      window.location.replace("/login?logged_out=true");
    }
  };

  // Check if user is logged in with concurrency handling using a stored promise
  const checkUserLoggedIn = async () => {
    console.log("[Auth] Checking login state");
    if (authPromiseRef.current) {
      console.log("[Auth] Auth check already in progress");
      return authPromiseRef.current;
    }

    authPromiseRef.current = (async () => {
      try {
        // Retrieve token from cookie or localStorage
        let token =
          getCookie("token") ||
          (typeof window !== "undefined" && localStorage.getItem("auth_token"));

        console.log("Checking auth:", token ? "Token exists" : "No token");

        if (!token) {
          setUser(null);
          localStorage.removeItem("user_data");
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

        // Attempt to use cached user data (non-blocking)
        const cachedUser =
          typeof window !== "undefined" && localStorage.getItem("user_data");
        if (cachedUser) {
          try {
            const userData = JSON.parse(cachedUser);
            setUser(userData);
            // Still continue to fetch fresh data below
          } catch (e) {
            console.error("Error parsing cached user data", e);
            localStorage.removeItem("user_data");
          }
        }

        // Fetch fresh user data from the API
        console.log("Fetching user data from API");
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`
        );

        if (res.data.success) {
          setUser(res.data.data);
          localStorage.setItem("user_data", JSON.stringify(res.data.data));
          setupTokenRefresh();
          return res.data.data;
        }
      } catch (error) {
        console.error("Error fetching user:", error);
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized access - clearing tokens");
          setUser(null);
          deleteCookie("token", { path: "/" });
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");
          delete axios.defaults.headers.common["Authorization"];
        }
      } finally {
        setLoading(false);
        authPromiseRef.current = null;
      }
      return null;
    })();

    return authPromiseRef.current;
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
        register,
        login,
        logout,
        hasPermission,
        checkUserLoggedIn,
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
