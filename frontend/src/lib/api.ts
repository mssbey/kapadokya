import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
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
