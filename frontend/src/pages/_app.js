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
