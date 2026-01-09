import React from 'react';
import {
  IconButton,
  Tooltip,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AutoMode as AutoModeIcon,
} from '@mui/icons-material';
import { useThemeStore } from '@/stores/theme.store';

const ThemeToggle: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeStore();

  return (
    <Tooltip 
      title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      arrow
      placement="bottom"
    >
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: 'inherit',
          position: 'relative',
          width: 40,
          height: 40,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
            transform: 'scale(1.05)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
      >
        {mode === 'dark' ? (
          <LightModeIcon 
            sx={{ 
              fontSize: 20,
              color: theme.palette.warning.light,
            }} 
          />
        ) : (
          <DarkModeIcon 
            sx={{ 
              fontSize: 20,
              color: theme.palette.primary.main,
            }} 
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;