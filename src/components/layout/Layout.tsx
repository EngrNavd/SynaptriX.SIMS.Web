import React, { ReactNode } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Inventory,
  Receipt,
  Settings,
  Logout,
  ChevronLeft,
  Notifications,
  AccountCircle,
  Business,
  ShoppingCart,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate, useLocation, NavLink, Outlet } from 'react-router-dom'; // Added Outlet

const drawerWidth = 280;

// Remove the children prop since we'll use Outlet
const Layout = () => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Customers', icon: <People />, path: '/customers' },
    { text: 'Products', icon: <Inventory />, path: '/products' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
    { text: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'primary.dark',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              {drawerOpen ? <ChevronLeft /> : <MenuIcon />}
            </IconButton>
            <Business sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" noWrap>
                SYNAPATRIX SIMS
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Smart Inventory Management System
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <Notifications />
            </IconButton>
            
            <IconButton
              onClick={handleMenuOpen}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  bgcolor: 'secondary.main',
                  width: 40,
                  height: 40,
                  border: '2px solid rgba(255,255,255,0.3)',
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>
            
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  overflow: 'visible',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Super Admin
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Administrator
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => navigate('/settings')}>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        open={drawerOpen}
        sx={{
          width: drawerOpen ? drawerWidth : 72,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerOpen ? drawerWidth : 72,
            boxSizing: 'border-box',
            backgroundColor: '#FFFFFF',
            borderRight: '1px solid #E2E8F0',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
          },
        }}
      >
        <Toolbar />
        
        <Box sx={{ overflow: 'auto', pt: 2 }}>
          <List>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <ListItem
                  key={item.text}
                  disablePadding
                  sx={{
                    mx: 1,
                    mb: 0.5,
                    borderRadius: 2,
                  }}
                >
                  <NavLink
                    to={item.path}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      width: '100%',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        px: 2,
                        py: 1.5,
                        borderRadius: 2,
                        backgroundColor: isActive ? 'primary.main' : 'transparent',
                        color: isActive ? 'white' : 'text.primary',
                        '&:hover': {
                          backgroundColor: isActive ? 'primary.dark' : 'rgba(10, 36, 99, 0.04)',
                        },
                        cursor: 'pointer',
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive ? 'white' : 'inherit',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {drawerOpen && (
                        <ListItemText 
                          primary={item.text} 
                          primaryTypographyProps={{
                            fontWeight: isActive ? 600 : 400,
                          }}
                        />
                      )}
                    </Box>
                  </NavLink>
                </ListItem>
              );
            })}
          </List>
          
          {/* Tenant/Company Info */}
          {drawerOpen && (
            <Box sx={{ p: 3, mt: 'auto', borderTop: '1px solid #E2E8F0' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Current Tenant
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                Dubai Main Branch
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Premium License
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 72}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Toolbar />
        
        {/* Page Content - This is where child routes render */}
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
        
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            pt: 4,
            pb: 2,
            mt: 'auto',
            borderTop: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} SynaptriX SIMS. All rights reserved.
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Version 2.0.1 • UAE Localized
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;