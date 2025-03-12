import axios from "axios";
import { deleteCookie } from "cookies-next";

// Configure axios with defaults
export const configureAxios = (token) => {
  axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;

  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token.trim()}`;
  }

  // Add response interceptor for global error handling
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 429) {
        console.warn(
          "Rate limit exceeded, please wait before making more requests"
        );
        // Add exponential backoff for retry
        const retryAfter = error.response.headers["retry-after"] || 5;
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(axios(error.config));
          }, retryAfter * 1000);
        });
      }

      if (error.response?.status === 401) {
        console.warn("Authentication error, clearing session");
        // If unauthorized and we had a token, clear it and reload
        if (axios.defaults.headers.common["Authorization"]) {
          deleteCookie("token", { path: "/" });
          delete axios.defaults.headers.common["Authorization"];
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_data");

          // Only reload if we're in a browser context
          if (typeof window !== "undefined") {
            window.location.href = "/login?expired=true";
          }
        }
      }

      return Promise.reject(error);
    }
  );
};

// Helper function to make API requests with retries
export const fetchWithRetry = async (url, options = {}, retries = 3) => {
  try {
    const response = await axios({
      url,
      ...options,
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429 && retries > 0) {
      // Wait for increasing amounts of time with each retry
      const delay = (4 - retries) * 2000;
      console.log(
        `Rate limited, retrying in ${
          delay / 1000
        }s... (${retries} retries left)`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};
