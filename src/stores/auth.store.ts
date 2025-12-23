// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@/types';

interface AuthState {
  isAuthenticated: boolean;
  user: UserDto | null;
  token: string | null;
  refreshToken: string | null;
  login: (user: UserDto, token: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,

      login: (user, token, refreshToken) => {
        console.log('AuthStore: Saving login data', { user, token, refreshToken });
        
        // Save to localStorage
        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update Zustand state
        set({
          isAuthenticated: true,
          user,
          token,
          refreshToken,
        });
      },

      logout: () => {
        console.log('AuthStore: Logging out');
        
        // Clear localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Clear Zustand state
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);