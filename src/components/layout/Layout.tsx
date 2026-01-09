import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  IconButton,
  Typography,
  Drawer,
  useTheme,
  AppBar,
  Toolbar,
  Avatar,
  Stack,
  Tooltip,
  Badge,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useAuthStore } from '@/stores/auth.store';
import ThemeToggle from '@/components/theme/ThemeToggle';
import ThemeToggleMenu from '@/components/theme/ThemeToggleMenu';
import Footer from './Footer';

const drawerWidth = 280;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Customers', icon: <PeopleIcon />, path: '/customers' },
  { text: 'Products', icon: <InventoryIcon />, path: '/products' },
  { text: 'Invoices', icon: <ReceiptIcon />, path: '/invoices' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Layout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo & Brand Area */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          color: theme.palette.primary.main,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <Box
            component="span"
            sx={{
              width: 8,
              height: 32,
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1,
            }}
          />
          SynaptriX SIMS
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Business Management Suite
        </Typography>
      </Box>

      {/* User Profile */}
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              backgroundColor: theme.palette.primary.main,
              border: `2px solid ${theme.palette.primary.light}`,
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {user?.fullName || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user?.email || 'admin@synaptrix.ae'}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: 2, flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 1,
                borderRadius: 2,
                backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
                borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
                }}
              />
            </ListItem>
          );
        })}
      </List>

      {/* Bottom Section - Theme & Logout */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <ThemeToggle />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Theme
            </Typography>
            <Typography variant="body2">
              {theme.palette.mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Typography>
          </Box>
        </Stack>
        
        <Divider sx={{ my: 1 }} />
        
        <ListItem
          button
          sx={{
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: theme.palette.error.light + '15',
            },
          }}
          onClick={() => {
            logout();
            navigate('/login');
          }}
        >
          <ListItemIcon sx={{ color: theme.palette.error.main, minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              color: theme.palette.error.main,
              fontWeight: 500,
            }} 
          />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
      {/* Top AppBar for Mobile */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          display: { xs: 'flex', md: 'none' },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
          </Typography>
          <Stack direction="row" spacing={1}>
            <ThemeToggle />
            <Tooltip title="Notifications">
              <IconButton color="inherit">
                <Badge badgeContent={3} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: theme.palette.background.paper,
              borderRight: `1px solid ${theme.palette.divider}`,
              height: '100vh',
              position: 'fixed',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Top Bar for Desktop */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            width: '100%',
            display: { xs: 'none', md: 'flex' },
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {menuItems.find(item => location.pathname.startsWith(item.path))?.text || 'Dashboard'}
            </Typography>
            
            <Stack direction="row" spacing={2} alignItems="center">
              <ThemeToggleMenu />
              
              <Tooltip title="Notifications">
                <IconButton
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                >
                  <Badge badgeContent={3} color="error">
                    <NotificationsIcon />
                  </Badge>
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Profile">
                <IconButton
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                  }}
                  onClick={() => navigate('/settings')}
                >
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      backgroundColor: theme.palette.primary.main,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 16 }} />
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Page Content */}
        <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
          {/* Mobile toolbar spacer */}
          <Toolbar sx={{ display: { xs: 'block', md: 'none' } }} />
          
          <Outlet />
        </Box>
        
        {/* Footer */}
        <Box sx={{ mt: 'auto' }}>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;