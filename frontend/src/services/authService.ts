import api from './api';
import type { AuthTokens, User } from '../types';

export const authService = {
  signup: async (email: string, password: string, name?: string): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/api/auth/signup', { email, password, name });
    return data;
  },

  login: async (email: string, password: string): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/api/auth/login', { email, password });
    return data;
  },

  loginWithGoogle: async (idToken: string): Promise<AuthTokens> => {
    const { data } = await api.post<AuthTokens>('/api/auth/google-oauth', { id_token: idToken });
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/api/auth/me');
    return data;
  },
};
