import axios from "axios";

/**
 * Central Axios instance for talking to the backend API.
 * In dev, Vite proxies "/api" to the Express server (see vite.config.ts).
 * In prod, set VITE_API_BASE_URL to the deployed API origin.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api",
  timeout: 10_000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error?.response?.data ?? error.message);
    return Promise.reject(error);
  },
);
