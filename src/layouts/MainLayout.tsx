import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Badge,
  Popover,
  Menu,
  MenuItem,
  Divider,
  Button,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  Inventory,
  Receipt,
  TrendingUp,
  Settings,
  Notifications,
  Person,
  Email,
  Logout,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';
import { format } from 'date-fns';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Customers', icon: <People />, path: '/customers' },
  { text: 'Products', icon: <Inventory />, path: '/products' },
  { text: 'Invoices', icon: <Receipt />, path: '/invoices' },
  { text: 'Sales Analytics', icon: <TrendingUp />, path: '/sales' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

// Mock user data - replace with actual user data from your auth context
const currentUser = {
  name: 'John Smith',
  email: 'john.smith@company.com',
  role: 'Administrator',
  avatar: 'JS',
};

// Mock notifications - replace with actual data
const mockNotifications = [
  { id: 1, title: 'New invoice created', time: '10 min ago', read: false },
  { id: 2, title: 'Low stock alert: Product XYZ', time: '1 hour ago', read: false },
  { id: 3, title: 'Payment received', time: '2 hours ago', read: true },
  { id: 4, title: 'Weekly report ready', time: '1 day ago', read: true },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();
  const location = useLocation();

  // Calculate unread notifications count
  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotificationsClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchor(event.currentTarget);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setNotificationsAnchor(null);
  };

  const handleCloseProfile = () => {
    setProfileAnchor(null);
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleNotificationClick = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    // Navigate or perform action based on notification
    handleCloseNotifications();
  };

  const handleProfileNavigation = () => {
    navigate('/profile');
    handleCloseProfile();
  };

  const handleLogout = () => {
    // TODO: integrate with auth logout
    handleCloseProfile();
  };

  const drawer = (
    <div>
      <Toolbar sx={{ display: 'flex', alignItems: 'center', px: 2, py: 3 }}>
        <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          SynaptriX SIMS
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: 1,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div">
              {menuItems.find(item => item.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notifications Button - FIXED */}
            <IconButton
              onClick={handleNotificationsClick}
              sx={{ 
                color: 'text.primary',
                position: 'relative',
              }}
            >
              <Badge 
                badgeContent={unreadCount} 
                color="error"
                max={9}
              >
                <Notifications />
              </Badge>
            </IconButton>
            
            {/* User Profile - FIXED */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                sx={{ 
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  cursor: 'pointer'
                }}
                onClick={handleProfileClick}
              >
                {currentUser.avatar}
              </Avatar>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {currentUser.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {currentUser.role}
                </Typography>
              </Box>
              <IconButton
                onClick={handleProfileClick}
                size="small"
                sx={{ display: { xs: 'none', md: 'flex' } }}
              >
                {profileAnchor ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Notifications Menu - FIXED */}
      <Menu
        anchorEl={notificationsAnchor}
        open={Boolean(notificationsAnchor)}
        onClose={handleCloseNotifications}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 350,
            maxHeight: 400,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button 
              size="small" 
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all as read
            </Button>
          )}
        </Box>
        <Divider />
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem
              key={notification.id}
              onClick={() => handleNotificationClick(notification.id)}
              sx={{ 
                py: 1.5,
                borderLeft: notification.read ? 'none' : '3px solid',
                borderColor: 'primary.main',
                backgroundColor: notification.read ? 'transparent' : 'action.hover'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" fontWeight={notification.read ? 'normal' : 'bold'}>
                  {notification.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
              No notifications
            </Typography>
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          onClick={handleCloseNotifications}
          sx={{ justifyContent: 'center', py: 1 }}
        >
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
      
      {/* Profile Menu - FIXED */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleCloseProfile}
        PaperProps={{
          sx: {
            mt: 1.5,
            width: 250,
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              {currentUser.avatar}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {currentUser.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.role}
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
        </Box>
        <MenuItem onClick={handleProfileNavigation}>
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => navigate('/settings')}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          <ListItemText>Settings</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          <ListItemText>Logout</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: '#fafafa',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}