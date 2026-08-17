import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 15000,
});

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Read requests are safe to retry, and a brief backend blip (a rate-limit
// bump, a cold start, a dropped connection) shouldn't surface as a permanent
// "could not be loaded" error to the visitor — retry transient failures
// silently before giving up.
const RETRYABLE_STATUS = new Set([429, 502, 503, 504]);
const MAX_RETRIES = 2;

api.interceptors.response.use(undefined, async (error) => {
  const config = error.config;
  const isGet = !config?.method || config.method.toLowerCase() === 'get';
  const status = error.response?.status;
  const isRetryable = !error.response || RETRYABLE_STATUS.has(status);
  if (config && isGet && isRetryable) {
    config.__retryCount = (config.__retryCount || 0) + 1;
    if (config.__retryCount <= MAX_RETRIES) {
      await delay(400 * config.__retryCount);
      return api(config);
    }
  }
  return Promise.reject(error);
});

let inMemoryCsrfToken: string | undefined;

export function setCsrfToken(token?: string) {
  inMemoryCsrfToken = token;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const prefix = `${name}=`;
  return document.cookie.split('; ').find((part) => part.startsWith(prefix))?.slice(prefix.length);
}

// Cookie authentication is automatic; mutation requests also carry the
// double-submit CSRF value from the non-httpOnly companion cookie.
api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  if (method && !['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const csrf = inMemoryCsrfToken || readCookie('dc_csrf');
    if (csrf) config.headers['X-CSRF-Token'] = decodeURIComponent(csrf);
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('dc-auth-expired'));
    }
    return Promise.reject(error);
  }
);
