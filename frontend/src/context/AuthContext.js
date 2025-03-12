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

  // Register user
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
    } catch (error) {
      setError(
        error.response?.data?.error || "An error occurred during registration"
      );
      setTimeout(() => setError(null), 5000);
    }
  };

  // Login user
  const login = async ({ email, password }) => {
    try {
      console.log("Attempting login with:", { email });

      // Clear previous tokens to avoid redirect loops
      deleteCookie("token", { path: "/" });
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      localStorage.removeItem("isLoggingOut");
      delete axios.defaults.headers.common["Authorization"];

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      console.log("Login response:", res.data);

      // Check if 2FA is required
      if (res.data.requireTwoFactor) {
        router.push({
          pathname: "/login/verify-2fa",
          query: { email },
        });
        return;
      }

      if (res.data.success && res.data.token) {
        const token = res.data.token.trim();
        // Store token in localStorage and cookie
        localStorage.setItem("auth_token", token);
        setCookie("token", token, {
          maxAge: 30 * 24 * 60 * 60,
          path: "/",
        });

        setupAxiosDefaults(token);

        console.log("Token set in cookie and localStorage");

        if (res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user_data", JSON.stringify(res.data.user));
        }

        // Fetch fresh user data
        await checkUserLoggedIn();
        setupTokenRefresh();

        // Redirect to dashboard (using full reload to clear middleware if needed)
        window.location.href = "/dashboard";
        return res.data;
      }

      return res.data;
    } catch (error) {
      console.error("Login error:", error);
      setError(error.response?.data?.error || "Invalid credentials");
      setTimeout(() => setError(null), 5000);
      throw error;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      console.log("AuthContext logout called");

      // Flag to prevent multiple logout attempts
      localStorage.setItem("isLoggingOut", "true");

      // Clear all tokens and state FIRST
      const token = getCookie("token") || localStorage.getItem("auth_token");
      setUser(null);
      deleteCookie("token", { path: "/" });
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      delete axios.defaults.headers.common["Authorization"];

      // Clear token refresh interval
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }

      // Call the API to logout - don't wait for it
      if (token) {
        try {
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }).catch((e) => console.log("Logout API error (non-critical):", e));
        } catch (apiError) {
          console.log("Logout API call error (non-critical):", apiError);
        }
      }

      // Force hard redirect to login page with logged_out flag and timestamp
      const timestamp = Date.now();

      // Clear the logging out flag right before redirecting
      localStorage.removeItem("isLoggingOut");

      // Use replace to create a clean navigation history
      if (typeof window !== "undefined") {
        window.location.replace(`/login?logged_out=true&t=${timestamp}`);
      }
    } catch (error) {
      console.error("Logout process error:", error);
      // Fallback redirect if something went wrong
      window.location.replace("/login?logged_out=true");
    }
  };

  // Check if user is logged in with concurrency handling using a stored promise
  const checkUserLoggedIn = async () => {
    if (authPromiseRef.current) {
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
