import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  AutoMode as AutoModeIcon,
  SettingsBrightness as SettingsIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useThemeStore } from '@/stores/theme.store';
import { PaletteMode } from '@mui/material';

const ThemeToggleMenu: React.FC = () => {
  const theme = useTheme();
  const { mode, setTheme } = useThemeStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (newMode: PaletteMode) => {
    setTheme(newMode);
    handleClose();
  };

  const themeOptions = [
    {
      mode: 'light' as PaletteMode,
      label: 'Light',
      icon: <LightModeIcon />,
      description: 'For daytime use',
      color: theme.palette.mode === 'dark' ? '#FBBF24' : '#D97706',
    },
    {
      mode: 'dark' as PaletteMode,
      label: 'Dark',
      icon: <DarkModeIcon />,
      description: 'For nighttime use',
      color: theme.palette.mode === 'dark' ? '#93C5FD' : '#2563EB',
    },
    {
      mode: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light' as PaletteMode,
      label: 'System',
      icon: <AutoModeIcon />,
      description: 'Follows system settings',
      color: theme.palette.mode === 'dark' ? '#34D399' : '#059669',
    },
  ];

  return (
    <>
      <Tooltip title="Change theme" arrow>
        <IconButton
          onClick={handleClick}
          sx={{
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
              boxShadow: theme.palette.mode === 'dark' 
                ? '0 4px 12px rgba(0, 0, 0, 0.3)' 
                : '0 4px 12px rgba(0, 0, 0, 0.1)',
            },
          }}
        >
          <SettingsIcon 
            sx={{ 
              fontSize: 20,
              color: theme.palette.mode === 'dark' 
                ? theme.palette.primary.light 
                : theme.palette.primary.main,
            }} 
          />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            width: 220,
            borderRadius: 2,
            overflow: 'visible',
            mt: 1.5,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: theme.palette.background.paper,
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderTop: `1px solid ${theme.palette.divider}`,
              borderLeft: `1px solid ${theme.palette.divider}`,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography 
            variant="subtitle2" 
            color={theme.palette.mode === 'dark' ? 'text.secondary' : 'text.primary'}
            fontWeight={600}
          >
            Theme Settings
          </Typography>
        </Box>
        
        <Divider sx={{ my: 1 }} />
        
        {themeOptions.map((option) => (
          <MenuItem
            key={option.mode}
            onClick={() => handleThemeChange(option.mode)}
            selected={mode === option.mode}
            sx={{
              py: 1.5,
              px: 2,
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
                '&:hover': {
                  backgroundColor: theme.palette.action.selected,
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: option.color }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText 
              primary={option.label}
              secondary={option.description}
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: theme.palette.mode === 'dark' ? 'text.primary' : 'text.primary',
              }}
              secondaryTypographyProps={{
                fontSize: '0.75rem',
                color: theme.palette.mode === 'dark' ? 'text.secondary' : 'text.secondary',
              }}
            />
            {mode === option.mode && (
              <CheckIcon 
                sx={{ 
                  ml: 2, 
                  fontSize: 16,
                  color: theme.palette.mode === 'dark' 
                    ? theme.palette.primary.light 
                    : theme.palette.primary.main,
                }} 
              />
            )}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ThemeToggleMenu;