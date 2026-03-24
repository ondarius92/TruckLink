import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens, UserRole } from '../types';
import AuthService from '../services/auth.service';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
  clearError: () => void;

  // Helpers
  isDriver: () => boolean;
  isBusiness: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) =>
        set({ user, isAuthenticated: true }),

      setTokens: (tokens) => {
        AuthService.saveTokens(tokens);
        set({ tokens, isAuthenticated: true });
      },

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),

      fetchMe: async () => {
        try {
          set({ isLoading: true });
          const user = await AuthService.getMe();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
          AuthService.clearTokens();
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await AuthService.logout();
        } catch {
          // שתוק בשגיאה
        } finally {
          AuthService.clearTokens();
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      isDriver: () => get().user?.role === UserRole.DRIVER,
      isBusiness: () => get().user?.role === UserRole.BUSINESS,
      isAdmin: () => get().user?.role === UserRole.ADMIN,
    }),
    {
      name: 'trucklink-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
