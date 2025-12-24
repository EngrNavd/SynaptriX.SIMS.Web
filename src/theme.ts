// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0A2463', // Navy blue
      light: '#1E3A8A',
      dark: '#07163E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3E92CC', // Light blue accent
      light: '#6AAFE6',
      dark: '#2C76A3',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      color: '#0A2463',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#0A2463',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      color: '#0A2463',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      color: '#0A2463',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      color: '#0A2463',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      color: '#0A2463',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 36, 99, 0.2)',
          },
        },
        containedPrimary: {
          backgroundColor: '#0A2463',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#07163E',
          },
        },
        containedSecondary: {
          backgroundColor: '#3E92CC',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#2C76A3',
          },
        },
        outlinedPrimary: {
          borderColor: '#0A2463',
          color: '#0A2463',
          '&:hover': {
            backgroundColor: 'rgba(10, 36, 99, 0.04)',
            borderColor: '#07163E',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A2463',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          backgroundImage: 'linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #E2E8F0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F1F5F9',
          fontWeight: 600,
          color: '#0A2463',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#0A2463',
          color: '#FFFFFF',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

export default theme;