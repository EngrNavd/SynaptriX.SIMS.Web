import { createTheme, Theme, PaletteMode, PaletteOptions } from '@mui/material/styles';

// Common typography settings
const typography = {
  fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontWeight: 700,
    fontSize: '2.5rem',
    letterSpacing: '-0.025em',
  },
  h2: {
    fontWeight: 700,
    fontSize: '2rem',
    letterSpacing: '-0.025em',
  },
  h3: {
    fontWeight: 600,
    fontSize: '1.75rem',
    letterSpacing: '-0.025em',
  },
  h4: {
    fontWeight: 600,
    fontSize: '1.5rem',
    letterSpacing: '-0.025em',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.25rem',
    letterSpacing: '-0.025em',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1rem',
    letterSpacing: '-0.025em',
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  button: {
    fontWeight: 600,
    textTransform: 'none',
    fontSize: '0.875rem',
  },
};

// Common shape settings
const shape = {
  borderRadius: 10,
};

// Light mode palette
const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#0A2463', // SynaptriX Navy Blue
    light: '#3E92CC', // SynaptriX Light Blue
    dark: '#1A365D',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#3B82F6', // Vibrant Blue
    light: '#93C5FD',
    dark: '#1D4ED8',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8FAFC', // Light gray background
    paper: '#FFFFFF',   // White cards
  },
  text: {
    primary: '#1E293B', // Dark gray for text
    secondary: '#64748B', // Medium gray
    disabled: '#94A3B8',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF'
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
    contrastText: '#FFFFFF'
  },
  divider: 'rgba(148, 163, 184, 0.2)',
  action: {
    active: '#64748B',
    hover: 'rgba(148, 163, 184, 0.08)',
    selected: 'rgba(148, 163, 184, 0.16)',
    disabled: 'rgba(148, 163, 184, 0.3)',
    disabledBackground: 'rgba(148, 163, 184, 0.12)',
    focus: 'rgba(148, 163, 184, 0.12)',
  },
};

// Dark mode palette - ENHANCED FOR BETTER CONTRAST
const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#60A5FA', // LIGHT BLUE - Better contrast on dark backgrounds
    light: '#93C5FD', // Very light blue for icons/text
    dark: '#3B82F6', // Medium blue for hover states
    contrastText: '#0F172A', // Dark background for contrast
  },
  secondary: {
    main: '#3B82F6', // Vibrant Blue
    light: '#60A5FA', // Light blue
    dark: '#2563EB', // Darker blue
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#0F172A', // Dark background
    paper: '#1E293B',   // Slightly lighter for cards
  },
  text: {
    primary: '#F8FAFC', // Bright white for main text
    secondary: '#CBD5E1', // Light gray for secondary text
    disabled: '#64748B',
  },
  success: {
    main: '#10B981',
    light: '#34D399', // Brighter green for dark mode
    dark: '#059669',
    contrastText: '#FFFFFF'
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24', // Brighter yellow
    dark: '#D97706',
    contrastText: '#0F172A' // Dark background for contrast
  },
  error: {
    main: '#EF4444',
    light: '#F87171', // Brighter red
    dark: '#DC2626',
    contrastText: '#FFFFFF'
  },
  info: {
    main: '#60A5FA', // Light blue for info
    light: '#93C5FD',
    dark: '#3B82F6',
    contrastText: '#0F172A'
  },
  divider: 'rgba(100, 116, 139, 0.3)',
  action: {
    active: '#F8FAFC',
    hover: 'rgba(96, 165, 250, 0.12)', // Light blue hover
    selected: 'rgba(96, 165, 250, 0.2)', // Light blue selected
    disabled: 'rgba(100, 116, 139, 0.3)',
    disabledBackground: 'rgba(100, 116, 139, 0.12)',
    focus: 'rgba(96, 165, 250, 0.12)',
  },
};

// Common component styles
const components = (mode: PaletteMode) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        fontWeight: 600,
        padding: '10px 20px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: mode === 'dark'
            ? '0 10px 25px -5px rgba(96, 165, 250, 0.4)' // Light blue shadow
            : '0 10px 25px -5px rgba(37, 99, 235, 0.2)',
        },
        '&:active': {
          transform: 'translateY(0)',
        },
      },
      containedPrimary: {
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' // Light blue gradient
          : 'linear-gradient(135deg, #0A2463 0%, #3E92CC 100%)',
        boxShadow: mode === 'dark'
          ? '0 4px 14px 0 rgba(96, 165, 250, 0.4)' // Light blue shadow
          : '0 4px 14px 0 rgba(10, 36, 99, 0.2)',
        '&:hover': {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #93C5FD 0%, #60A5FA 100%)' // Even lighter on hover
            : 'linear-gradient(135deg, #1A365D 0%, #0A2463 100%)',
          boxShadow: mode === 'dark'
            ? '0 6px 20px rgba(96, 165, 250, 0.5)'
            : '0 6px 20px rgba(10, 36, 99, 0.3)',
        },
      },
      containedSecondary: {
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
          : 'linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)',
        '&:hover': {
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)' // Light blue on hover
            : 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
        },
      },
      outlinedPrimary: {
        borderColor: mode === 'dark' ? '#60A5FA' : '#0A2463',
        color: mode === 'dark' ? '#93C5FD' : '#0A2463', // Very light blue for dark mode
        borderWidth: '2px',
        '&:hover': {
          backgroundColor: mode === 'dark'
            ? 'rgba(96, 165, 250, 0.08)'
            : 'rgba(10, 36, 99, 0.08)',
          borderColor: mode === 'dark' ? '#93C5FD' : '#3E92CC',
          boxShadow: mode === 'dark'
            ? '0 4px 12px rgba(96, 165, 250, 0.2)'
            : '0 4px 12px rgba(10, 36, 99, 0.1)',
        },
      },
      sizeLarge: {
        padding: '12px 28px',
        fontSize: '1rem',
      },
      sizeSmall: {
        padding: '6px 16px',
        fontSize: '0.8125rem',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #1E293B 0%, #1E293B 100%)'
          : 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
        backdropFilter: 'blur(10px)',
        backgroundColor: mode === 'dark'
          ? 'rgba(30, 41, 59, 0.95)'
          : 'rgba(255, 255, 255, 0.95)',
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`,
        boxShadow: mode === 'dark'
          ? '0 4px 20px rgba(0, 0, 0, 0.15)'
          : '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'dark' ? '#1E293B' : '#FFFFFF', // Lighter dark background
        backgroundImage: 'none',
        border: `1px solid ${mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`,
        boxShadow: mode === 'dark'
          ? '0 8px 32px rgba(0, 0, 0, 0.15)'
          : '0 8px 32px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.4)' : 'rgba(10, 36, 99, 0.3)',
          boxShadow: mode === 'dark'
            ? '0 12px 40px rgba(0, 0, 0, 0.2)'
            : '0 12px 40px rgba(0, 0, 0, 0.08)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        overflow: 'hidden',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: mode === 'dark' ? '#1E293B' : '#F8FAFC',
        fontWeight: 700,
        color: mode === 'dark' ? '#93C5FD' : '#1E293B', // Light blue for dark mode
        borderBottom: `2px solid ${mode === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`,
        fontSize: '0.875rem',
        letterSpacing: '0.05em',
      },
      root: {
        borderBottom: `1px solid ${mode === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(148, 163, 184, 0.2)'}`,
        padding: '16px',
      },
      body: {
        color: mode === 'dark' ? '#F8FAFC' : '#1E293B',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 28,
        '& .MuiChip-label': {
          paddingLeft: 10,
          paddingRight: 10,
        },
      },
      colorPrimary: {
        backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.15)' : 'rgba(10, 36, 99, 0.1)',
        color: mode === 'dark' ? '#93C5FD' : '#0A2463', // Light blue for dark mode
        border: `1px solid ${mode === 'dark' ? 'rgba(147, 197, 253, 0.3)' : 'rgba(10, 36, 99, 0.3)'}`,
      },
      colorSecondary: {
        backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
        color: mode === 'dark' ? '#93C5FD' : '#3B82F6',
        border: `1px solid ${mode === 'dark' ? 'rgba(147, 197, 253, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
      },
      outlined: {
        borderWidth: '1.5px',
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: mode === 'dark' ? 'rgba(100, 116, 139, 0.3)' : 'rgba(148, 163, 184, 0.3)',
        margin: '24px 0',
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: 10,
        backgroundColor: mode === 'dark' ? 'rgba(30, 41, 59, 0.5)' : 'rgba(248, 250, 252, 0.8)',
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: mode === 'dark' ? 'rgba(100, 116, 139, 0.5)' : 'rgba(148, 163, 184, 0.5)',
          borderWidth: '2px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: mode === 'dark' ? '#60A5FA' : '#0A2463',
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: mode === 'dark' ? '#93C5FD' : '#0A2463', // Very light blue for focus
          borderWidth: '2px',
          boxShadow: mode === 'dark'
            ? '0 0 0 3px rgba(147, 197, 253, 0.1)'
            : '0 0 0 3px rgba(10, 36, 99, 0.1)',
        },
      },
      input: {
        padding: '14px 16px',
        '&::placeholder': {
          color: mode === 'dark' ? '#94A3B8' : '#64748B',
          opacity: 0.7,
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        color: mode === 'dark' ? '#CBD5E1' : '#64748B',
        fontWeight: 500,
        '&.Mui-focused': {
          color: mode === 'dark' ? '#93C5FD' : '#0A2463', // Very light blue
        },
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        color: mode === 'dark' ? '#F8FAFC' : '#1E293B',
        padding: '12px 20px',
        borderRadius: 8,
        margin: '2px 8px',
        '&:hover': {
          backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.12)' : 'rgba(10, 36, 99, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(10, 36, 99, 0.15)',
          color: mode === 'dark' ? '#93C5FD' : '#0A2463', // Very light blue
          fontWeight: 600,
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(10, 36, 99, 0.2)',
          },
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: mode === 'dark' ? '#1E293B' : '#1E293B',
        color: mode === 'dark' ? '#F8FAFC' : '#FFFFFF',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '8px 12px',
        border: `1px solid ${mode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
        boxShadow: mode === 'dark'
          ? '0 8px 24px rgba(0, 0, 0, 0.2)'
          : '0 8px 24px rgba(0, 0, 0, 0.15)',
        borderRadius: 8,
      },
      arrow: {
        color: mode === 'dark' ? '#1E293B' : '#1E293B',
        '&:before': {
          border: `1px solid ${mode === 'dark' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`,
        },
      },
    },
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        fontSize: '1.25rem',
      },
    },
  },
  MuiBackdrop: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        color: 'inherit',
        minWidth: '40px !important',
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: mode === 'dark' ? 'rgba(96, 165, 250, 0.08)' : 'rgba(10, 36, 99, 0.08)',
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: mode === 'dark' ? '#60A5FA' : '#0A2463', // Light blue for dark mode
        color: mode === 'dark' ? '#0F172A' : '#FFFFFF',
      },
    },
  },
});

// Create theme based on mode
export const createAppTheme = (mode: PaletteMode = 'dark'): Theme => {
  const palette = mode === 'light' ? lightPalette : darkPalette;

  return createTheme({
    palette,
    typography,
    shape,
    components: components(mode),
  });
};

// Default export (dark theme for backward compatibility)
const defaultTheme = createAppTheme('dark');
export default defaultTheme;

// Export for use in stores
export type { PaletteMode };
export { lightPalette, darkPalette };