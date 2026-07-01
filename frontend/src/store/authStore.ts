import { create } from 'zustand';
import { api } from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => void;
  loadUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;
      localStorage.setItem('dc_token', token);
      localStorage.setItem('dc_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (name, email, password, phone) => {
    set({ isLoading: true });
    try {
      const res = await api.post('/auth/register', { name, email, password, phone });
      const { user, token } = res.data.data;
      localStorage.setItem('dc_token', token);
      localStorage.setItem('dc_user', JSON.stringify(user));
      set({ user, token, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('dc_token');
    localStorage.removeItem('dc_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('dc_token');
    const userStr = localStorage.getItem('dc_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem('dc_token');
        localStorage.removeItem('dc_user');
      }
    }
  },
}));
