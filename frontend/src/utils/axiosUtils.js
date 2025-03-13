import axios from "axios";

// Setup axios defaults and interceptors to handle auth
export const setupAxiosDefaults = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

// Create an Axios instance with authentication headers
export const createAuthenticatedRequest = (token) => {
  return {
    get: (url, config = {}) =>
      axios.get(url, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token?.trim()}`,
          "Cache-Control": "no-cache",
        },
      }),
    post: (url, data, config = {}) =>
      axios.post(url, data, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token?.trim()}`,
        },
      }),
    put: (url, data, config = {}) =>
      axios.put(url, data, {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${token?.trim()}`,
        },
      }),
  };
};
