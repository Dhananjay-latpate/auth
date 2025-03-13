// Constants for cache management
const USER_CACHE_KEY = "user_data";
const USER_CACHE_TIMESTAMP_KEY = "user_data_timestamp";
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes
const RECENT_CACHE_AGE = 30 * 1000; // 30 seconds

// Cache user data in localStorage
export const cacheUserData = (userData) => {
  if (typeof window !== "undefined" && userData) {
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(userData));
    localStorage.setItem(USER_CACHE_TIMESTAMP_KEY, Date.now().toString());
  }
};

// Get cached user data if valid
export const getCachedUserData = () => {
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
    clearUserCache();
    return null;
  }
};

// Check if we have a very recent cache (to avoid too many API calls)
export const hasRecentCache = () => {
  if (typeof window === "undefined") return false;

  const timestamp = localStorage.getItem(USER_CACHE_TIMESTAMP_KEY);
  if (!timestamp) return false;

  const now = Date.now();
  const cacheAge = now - parseInt(timestamp);

  return cacheAge < RECENT_CACHE_AGE;
};

// Clear user data cache
export const clearUserCache = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_CACHE_KEY);
    localStorage.removeItem(USER_CACHE_TIMESTAMP_KEY);
  }
};
