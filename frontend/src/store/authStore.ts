import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';
import { ls } from '../utils/localStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  hydrate: () => {
    const token = ls.getToken();
    const user = ls.getUser();
    if (token && user) {
      set({ user, token, isAuthenticated: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authService.login(email, password);
      ls.setToken(data.access_token);
      ls.setRefreshToken(data.refresh_token);
      ls.setUser(data.user);
      set({ user: data.user, token: data.access_token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const data = await authService.signup(email, password, name);
      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Signup failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loginWithGoogle: async (idToken) => {
    set({ isLoading: true });
    try {
      const data = await authService.loginWithGoogle(idToken);
      ls.setToken(data.access_token);
      ls.setRefreshToken(data.refresh_token);
      ls.setUser(data.user);

      set({
        user: data.user,
        token: data.access_token,
        isAuthenticated: true,
        error: null,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.detail || 'Google Login failed' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    authService.logout().catch(() => {});
    ls.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    ls.setUser(user);
    set({ user });
  },
}));

// Hydrate synchronously on store creation
useAuthStore.getState().hydrate();
