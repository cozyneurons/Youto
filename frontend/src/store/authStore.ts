import { create } from 'zustand';
import type { User } from '../types';
import { authService } from '../services/authService';
import { ls } from '../utils/localStorage';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

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
      ls.setToken(data.access_token);
      ls.setRefreshToken(data.refresh_token);
      ls.setUser(data.user);
      set({ user: data.user, token: data.access_token, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    authService.logout().catch(() => {});
    ls.clear();
    set({ user: null, token: null, isAuthenticated: false });
  },

  setUser: (user) => {
    ls.setUser(user);
    set({ user });
  },
}));
