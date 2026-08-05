import axios, { type AxiosRequestConfig } from "axios";

const apiBaseURL = import.meta.env.VITE_API_BASE_URL?.trim() || "/api";

/**
 * Central Axios instance for talking to the backend API.
 * In dev, Vite proxies "/api" to the Express server (see vite.config.ts).
 * In prod, set VITE_API_BASE_URL to the deployed API origin.
 */
export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 10_000,
  // Required so httpOnly session cookies (admin + fan refresh token) are
  // sent/received — both in dev (cross-origin :5173 -> :4000) and in prod
  // (same-origin).
  withCredentials: true,
});

// Lazily wired up by features/auth to avoid a circular import between this
// file and the auth store/api (which both, in turn, use `api`).
let getAccessToken: (() => string | null) | undefined;
let onUnauthorized: (() => void) | undefined;
let refreshAccessToken: (() => Promise<string>) | undefined;

export function configureAuthInterceptor(handlers: {
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string>;
  onUnauthorized: () => void;
}) {
  getAccessToken = handlers.getAccessToken;
  refreshAccessToken = handlers.refreshAccessToken;
  onUnauthorized = handlers.onUnauthorized;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token && !config.headers?.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface RetriableRequestConfig extends AxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

// Silently refreshes an expired access token once and retries the original
// request — keeps fans logged in across the 2h access-token lifetime
// without ever surfacing a spurious 401 to the UI.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config as RetriableRequestConfig | undefined;
    const isAuthEndpoint = config?.url?.includes("/auth/");

    if (error?.response?.status === 401 && config && !config._retriedAfterRefresh && !isAuthEndpoint && refreshAccessToken) {
      config._retriedAfterRefresh = true;
      try {
        await refreshAccessToken();
        return api(config);
      } catch {
        onUnauthorized?.();
      }
    }

    console.error("[API Error]", error?.response?.data ?? error.message);
    return Promise.reject(error);
  },
);
