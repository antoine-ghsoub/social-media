import axios from "axios";

// A flag to ensure we only trigger one redirect at a time
let isRedirecting = false;

export const makeRequest = axios.create({
  baseURL: "http://localhost:8800/api/",
  withCredentials: true,
});

// Add a response interceptor to handle 401 errors
makeRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    // If this request opts out of auth redirection, just reject the error.
    if (
      error.config &&
      error.config.headers &&
      error.config.headers.skipAuthRedirect
    ) {
      return Promise.reject(error);
    }

    // If we receive a 401 (Unauthorized) error, not on the login page, and we aren’t already redirecting...
    if (
      error.response &&
      error.response.status === 401 &&
      !window.location.pathname.startsWith("/login") &&
      !isRedirecting
    ) {
      isRedirecting = true;
      // Clear any stored user data so that React knows you’re not logged in.
      localStorage.removeItem("user");
      // Redirect to the login page.
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
