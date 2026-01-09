import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PaletteMode } from '@mui/material';

interface ThemeState {
  mode: PaletteMode;
  toggleTheme: () => void;
  setTheme: (mode: PaletteMode) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark', // Default to dark mode
      
      toggleTheme: () => {
        const newMode = get().mode === 'light' ? 'dark' : 'light';
        set({ mode: newMode });
        
        // Update localStorage
        localStorage.setItem('theme-mode', newMode);
        
        // Update data-theme attribute for CSS
        document.documentElement.setAttribute('data-theme', newMode);
      },
      
      setTheme: (mode: PaletteMode) => {
        set({ mode });
        localStorage.setItem('theme-mode', mode);
        document.documentElement.setAttribute('data-theme', mode);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({
        mode: state.mode,
      }),
    }
  )
);

// Initialize theme from localStorage or system preference
export const initializeTheme = () => {
  const themeStore = useThemeStore.getState();
  
  // Check localStorage first
  const savedTheme = localStorage.getItem('theme-mode') as PaletteMode;
  
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    themeStore.setTheme(savedTheme);
  } else {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeStore.setTheme(prefersDark ? 'dark' : 'light');
  }
};