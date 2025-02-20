import axios from "axios";
import { auth } from "../config/firebase";
import { signOut } from "firebase/auth";

// Create axios instance with default config
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Keep track of token refresh attempts
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

// Add token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    try {
      const token = await user.getIdToken(false); // Don't force refresh on every request
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      console.error("Error getting token:", error);
    }
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is not 401 or it's already a retry, reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // If token refresh is in progress, queue this request
      try {
        const token = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axios(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("No user found");
      }

      // Force token refresh
      const token = await user.getIdToken(true);
      processQueue(null, token);

      // Update the failed request with new token
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      // Clear session and redirect to login
      await signOut(auth);
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export { api };
