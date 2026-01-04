// src/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark', // CHANGED TO DARK MODE
    primary: {
      main: '#0A2463', // Navy blue
      light: '#3E92CC', // Lighter blue for highlights
      dark: '#07163E',  // Darker navy
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3E92CC', // Light blue accent
      light: '#6AAFE6',
      dark: '#2C76A3',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#0F172A', // Very dark blue-gray background
      paper: '#1E293B',   // Dark slate for cards/paper
    },
    text: {
      primary: '#F1F5F9', // Light gray for primary text
      secondary: '#94A3B8', // Muted blue-gray for secondary
    },
    // Success, warning, error, info colors remain suitable for dark mode
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    // All heading colors removed to inherit from theme's text.primary
    h1: { fontWeight: 700, fontSize: '2.5rem' },
    h2: { fontWeight: 700, fontSize: '2rem' },
    h3: { fontWeight: 600, fontSize: '1.75rem' },
    h4: { fontWeight: 600, fontSize: '1.5rem' },
    h5: { fontWeight: 600, fontSize: '1.25rem' },
    h6: { fontWeight: 600, fontSize: '1rem' },
    button: { fontWeight: 600, textTransform: 'none' },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(62, 146, 204, 0.3)' }, // Updated shadow color
        },
        containedPrimary: {
          backgroundColor: '#0A2463',
          '&:hover': { backgroundColor: '#07163E' },
        },
        containedSecondary: {
          backgroundColor: '#3E92CC',
          '&:hover': { backgroundColor: '#2C76A3' },
        },
        outlinedPrimary: {
          borderColor: '#3E92CC', // Use lighter blue for visibility on dark bg
          color: '#3E92CC',
          '&:hover': {
            backgroundColor: 'rgba(62, 146, 204, 0.08)',
            borderColor: '#6AAFE6',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#0A2463',
          backgroundImage: 'linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%)',
          borderBottom: '1px solid #1E293B', // Subtle separation
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1E293B',
          backgroundImage: 'none',
          border: '1px solid #334155', // Darker border for dark mode
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)', // Stronger shadow
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#1E293B', // Dark header
          fontWeight: 600,
          color: '#F1F5F9', // Light text
          borderBottom: '2px solid #334155',
        },
        root: {
          borderBottom: '1px solid #334155', // Table row borders
        }
      },
    },
    MuiChip: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#0A2463',
          color: '#FFFFFF',
        },
	  root: {
        '& .MuiChip-label': {
          color: 'inherit',
        },
      },
    },
		},
    MuiDivider: {
      styleOverrides: {
        root: { borderColor: '#334155' } // Darker dividers
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#475569',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#3E92CC',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          // Force all Typography to use theme colors
          color: 'inherit',
        },
      },
    }, 
    MuiIcon: {
	  styleOverrides: {
	    root: {
	 	 // Force all icons to inherit color from parent
	 	 color: 'inherit',
	    },
	  },
    }, 
    MuiSvgIcon: {
	  styleOverrides: {
	    root: {
	 	 // Force SVG icons to inherit color
	 	 color: 'inherit',
	    },
	  },
    },
    MuiInputBase: {
	  styleOverrides: {
	    root: {
	 	 color: 'inherit', // Makes text inputs use theme color
	    },
	    input: {
	 	 '&::placeholder': {
	 	   color: 'text.secondary', // Placeholder text color
	 	   opacity: 0.7,
	 	 },
	    },
	  },
    }, 
    MuiMenuItem: {
	  styleOverrides: {
	    root: {
	  	color: 'text.primary', // Menu items text color
	  	'&:hover': {
	  	  backgroundColor: 'action.hover',
	  	},
	  	'&.Mui-selected': {
	  	  backgroundColor: 'primary.main',
	  	  color: 'white',
	  	  '&:hover': {
	  		backgroundColor: 'primary.dark',
	  	  },
	  	},
	   },
	  },
	 },
   },
});

export default theme;