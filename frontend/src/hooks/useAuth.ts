import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const user = useAuthStore(s => s.user);
  const token = useAuthStore(s => s.token);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const isLoading = useAuthStore(s => s.isLoading);
  const login = useAuthStore(s => s.login);
  const signup = useAuthStore(s => s.signup);
  const logout = useAuthStore(s => s.logout);
  return { user, token, isAuthenticated, isLoading, login, signup, logout };
}
