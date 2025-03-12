import { AuthProvider } from "../context/AuthContext";
import "../styles/globals.css";
import axios from "axios";
import { useEffect, useState } from "react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import Head from "next/head";

// Configure axios with an interceptor to add token to all requests
function setupAxiosInterceptors() {
  axios.interceptors.request.use(
    (config) => {
      // Don't add token for login/register/public endpoints
      if (
        config.url.includes("/auth/login") ||
        config.url.includes("/auth/register") ||
        config.url.includes("/auth/forgotpassword")
      ) {
        return config;
      }

      // Get token from localStorage or cookie
      const token = localStorage.getItem("auth_token") || getCookie("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor to handle errors globally
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Log detailed API errors
      if (error.response) {
        console.error("API Error Response:", {
          status: error.response.status,
          data: error.response.data,
          endpoint: error.config.url,
          method: error.config.method,
        });
      } else if (error.request) {
        console.error("API Request Error (No Response):", error.request);
      } else {
        console.error("API Error:", error.message);
      }
      return Promise.reject(error);
    }
  );
}

function MyApp({ Component, pageProps }) {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Set up axios interceptors
    setupAxiosInterceptors();
    setIsReady(true);

    // Add error handling for routing
    const handleRouteChangeError = (err, url) => {
      if (err.cancelled) {
        console.log(`Route to ${url} was cancelled!`);
      } else {
        console.error("Route change error:", err);
      }
    };

    router.events.on("routeChangeError", handleRouteChangeError);

    return () => {
      router.events.off("routeChangeError", handleRouteChangeError);
    };
  }, [router]);

  // Global redirect loop detection
  useEffect(() => {
    const MAX_NAVIGATIONS = 5;
    const DETECTION_PERIOD = 3000; // 3 seconds
    const STORAGE_KEY = "nav_history";

    // Get navigation history or initialize it
    const getNavHistory = () => {
      try {
        const historyData = sessionStorage.getItem(STORAGE_KEY);
        return historyData
          ? JSON.parse(historyData)
          : {
              count: 0,
              startTime: Date.now(),
              paths: [],
            };
      } catch (e) {
        return { count: 0, startTime: Date.now(), paths: [] };
      }
    };

    // Reset history when enough time passes
    const maybeResetHistory = (history) => {
      const now = Date.now();
      if (now - history.startTime > DETECTION_PERIOD) {
        return { count: 0, startTime: now, paths: [] };
      }
      return history;
    };

    // Check for rapid navigation loops
    const detectLoop = () => {
      // Don't run detection if URL has bypass flags
      if (
        router.query.no_redirect ||
        router.query.logged_out ||
        router.query.bypass
      ) {
        sessionStorage.removeItem(STORAGE_KEY);
        return;
      }

      // Update navigation history
      let history = getNavHistory();
      history = maybeResetHistory(history);

      // Add current path and update count
      history.paths.push(router.pathname);
      history.count++;

      console.log(
        `[App] Navigation ${history.count}/${MAX_NAVIGATIONS} to ${router.pathname}`
      );

      // Check for too many navigations in detection period
      if (history.count > MAX_NAVIGATIONS) {
        console.log("[App] Navigation loop detected, forcing reset");
        // Clear auth state
        document.cookie = "token=; max-age=0; path=/;";
        localStorage.clear();
        sessionStorage.clear();

        // Hard redirect to login with bypass flag
        window.location.href = "/login?no_redirect=true";
        return;
      }

      // Store updated history
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    };

    // Run detection on each route change
    detectLoop();

    // Clean up
    return () => {};
  }, [router.pathname, router.query]);

  // Show a minimal loading state
  if (!isReady) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <Head>
          <title>Loading - Secure Auth System</title>
        </Head>
        <div className="text-lg text-gray-500">Loading application...</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp;
