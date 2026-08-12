import { create } from 'zustand';
import { api, setCsrfToken } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/login', { email, password });
      setCsrfToken(response.data.data.csrfToken);
      set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, phone) => {
    set({ isLoading: true });
    try {
      const response = await api.post('/auth/register', { name, email, password, phone });
      setCsrfToken(response.data.data.csrfToken);
      set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try { await api.post('/auth/logout'); } catch { /* Clear local state even if the API is unavailable. */ }
    setCsrfToken();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.get('/auth/me');
      setCsrfToken(response.data.data.csrfToken);
      set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

if (typeof window !== 'undefined') {
  window.addEventListener('dc-auth-expired', () => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
  });
}
