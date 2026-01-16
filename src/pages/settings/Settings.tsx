import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Paper
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Security,
  Notifications,
  Language,
  Payment,
  Store,
  People,
  Email,
  Save,
  RestartAlt,
  Info,
  Warning,
  Business,
  AccountCircle,
  VpnKey,
  Cloud,
  DataUsage
} from '@mui/icons-material';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'SynaptriX SIMS',
    email: 'admin@sms-uae.com',
    phone: '+971 4 123 4567',
    language: 'en',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    
    // Security Settings
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordExpiry: 90,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: false,
    orderAlerts: true,
    stockAlerts: true,
    
    // Business Settings
    taxRate: 0,
    invoicePrefix: 'INV-',
    autoBackup: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default?')) {
      alert('Settings reset to default');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon /> },
    { id: 'security', label: 'Security', icon: <Security /> },
    { id: 'notifications', label: 'Notifications', icon: <Notifications /> },
    { id: 'business', label: 'Business', icon: <Business /> },
    { id: 'users', label: 'Users & Roles', icon: <People /> },
    { id: 'payment', label: 'Payment', icon: <Payment /> }
  ];

  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="info" icon={<Info />}>
          General application settings. Changes will be applied to all users.
        </Alert>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Company Name"
          value={settings.companyName}
          onChange={(e) => handleSettingChange('companyName', e.target.value)}
          helperText="Display name for your business"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Contact Email"
          type="email"
          value={settings.email}
          onChange={(e) => handleSettingChange('email', e.target.value)}
          helperText="Primary contact email address"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Phone Number"
          value={settings.phone}
          onChange={(e) => handleSettingChange('phone', e.target.value)}
          helperText="Business contact number"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Currency</InputLabel>
          <Select
            value={settings.currency}
            label="Currency"
            onChange={(e) => handleSettingChange('currency', e.target.value)}
          >
            <MenuItem value="AED">UAE Dirham (AED)</MenuItem>
            <MenuItem value="USD">US Dollar (USD)</MenuItem>
            <MenuItem value="EUR">Euro (EUR)</MenuItem>
            <MenuItem value="GBP">British Pound (GBP)</MenuItem>
            <MenuItem value="SAR">Saudi Riyal (SAR)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Language</InputLabel>
          <Select
            value={settings.language}
            label="Language"
            onChange={(e) => handleSettingChange('language', e.target.value)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ar">Arabic (العربية)</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Timezone</InputLabel>
          <Select
            value={settings.timezone}
            label="Timezone"
            onChange={(e) => handleSettingChange('timezone', e.target.value)}
          >
            <MenuItem value="Asia/Dubai">Dubai (GMT+4)</MenuItem>
            <MenuItem value="UTC">UTC</MenuItem>
            <MenuItem value="America/New_York">New York (GMT-5)</MenuItem>
            <MenuItem value="Europe/London">London (GMT+0)</MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
  );

  const renderSecuritySettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Alert severity="warning" icon={<Warning />}>
          Security settings affect user authentication and data protection.
        </Alert>
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.twoFactorAuth}
              onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography>Two-Factor Authentication</Typography>
              <Typography variant="caption" color="text.secondary">
                Require 2FA for all user logins
              </Typography>
            </Box>
          }
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Session Timeout (minutes)</InputLabel>
          <Select
            value={settings.sessionTimeout}
            label="Session Timeout (minutes)"
            onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
          >
            <MenuItem value={15}>15 minutes</MenuItem>
            <MenuItem value={30}>30 minutes</MenuItem>
            <MenuItem value={60}>1 hour</MenuItem>
            <MenuItem value={120}>2 hours</MenuItem>
            <MenuItem value={240}>4 hours</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Password Expiry (days)</InputLabel>
          <Select
            value={settings.passwordExpiry}
            label="Password Expiry (days)"
            onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
          >
            <MenuItem value={30}>30 days</MenuItem>
            <MenuItem value={60}>60 days</MenuItem>
            <MenuItem value={90}>90 days</MenuItem>
            <MenuItem value={180}>180 days</MenuItem>
            <MenuItem value={365}>1 year</MenuItem>
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Security Audit Log
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
          <List>
            <ListItem>
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText
                primary="Last login: Today at 14:30"
                secondary="IP: 192.168.1.100"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <VpnKey />
              </ListItemIcon>
              <ListItemText
                primary="Password changed: 5 days ago"
                secondary="By: Admin User"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText
                primary="Settings updated: Yesterday"
                secondary="General settings modified"
              />
            </ListItem>
          </List>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderNotificationSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography>Email Notifications</Typography>
              <Typography variant="caption" color="text.secondary">
                Receive notifications via email
              </Typography>
            </Box>
          }
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.pushNotifications}
              onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography>Push Notifications</Typography>
              <Typography variant="caption" color="text.secondary">
                Show browser notifications
              </Typography>
            </Box>
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Divider />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Alert Preferences
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.orderAlerts}
              onChange={(e) => handleSettingChange('orderAlerts', e.target.checked)}
              color="primary"
            />
          }
          label="New Order Alerts"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.stockAlerts}
              onChange={(e) => handleSettingChange('stockAlerts', e.target.checked)}
              color="primary"
            />
          }
          label="Low Stock Alerts"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Notification Email"
          type="email"
          value="notifications@sms-uae.com"
          disabled
          helperText="All alerts will be sent to this email address"
        />
      </Grid>
    </Grid>
  );

  const renderBusinessSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Tax Rate (%)"
          type="number"
          value={settings.taxRate}
          onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
          InputProps={{
            endAdornment: '%',
          }}
          helperText="VAT rate applied to all sales"
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Invoice Prefix"
          value={settings.invoicePrefix}
          onChange={(e) => handleSettingChange('invoicePrefix', e.target.value)}
          helperText="Prefix for invoice numbers"
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Switch
              checked={settings.autoBackup}
              onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box>
              <Typography>Automatic Backup</Typography>
              <Typography variant="caption" color="text.secondary">
                Daily automatic backup of all data
              </Typography>
            </Box>
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h6" gutterBottom>
          Storage Information
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
          <Stack direction="row" spacing={3} alignItems="center">
            <Cloud color="primary" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Storage Usage
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Box sx={{ height: 8, bgcolor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
                    <Box sx={{ width: '45%', height: '100%', bgcolor: 'primary.main' }} />
                  </Box>
                </Box>
                <Typography variant="body2">45% used</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                2.3 GB of 5 GB used
              </Typography>
            </Box>
            <Button size="small" variant="outlined">
              Upgrade
            </Button>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'security': return renderSecuritySettings();
      case 'notifications': return renderNotificationSettings();
      case 'business': return renderBusinessSettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <Container maxWidth="lg">
      {/* Header - FIXED: Removed hard-coded color */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure application settings and preferences
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Sidebar Tabs */}
        <Grid item xs={12} md={3}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <List disablePadding>
              {tabs.map((tab) => (
                <ListItem
                  key={tab.id}
                  button
                  selected={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  sx={{
                    borderLeft: activeTab === tab.id ? 3 : 0,
                    borderColor: 'primary.main',
                    bgcolor: activeTab === tab.id ? 'action.hover' : 'transparent',
                    '&:hover': {
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {tab.icon}
                  </ListItemIcon>
                  <ListItemText primary={tab.label} />
                </ListItem>
              ))}
            </List>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mt: 3, bgcolor: 'background.paper' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                System Status
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Uptime:</Typography>
                  <Typography variant="body2" fontWeight={500}>99.8%</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Users Online:</Typography>
                  <Typography variant="body2" fontWeight={500}>3</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Last Backup:</Typography>
                  <Typography variant="body2" fontWeight={500}>Today 02:00</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Version:</Typography>
                  <Typography variant="body2" fontWeight={500}>v2.1.0</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Main Content */}
        <Grid item xs={12} md={9}>
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardHeader
              title={tabs.find(t => t.id === activeTab)?.label}
              subheader="Configure settings for this section"
              action={
                <Stack direction="row" spacing={1}>
                  <Button
                    startIcon={<RestartAlt />}
                    onClick={handleReset}
                    variant="outlined"
                    size="small"
                  >
                    Reset
                  </Button>
                  <Button
                    startIcon={<Save />}
                    onClick={handleSave}
                    variant="contained"
                    size="small"
                  >
                    Save Changes
                  </Button>
                </Stack>
              }
            />
            <Divider />
            <CardContent sx={{ pt: 3 }}>
              {renderContent()}
            </CardContent>
          </Card>

          {/* Danger Zone */}
          {activeTab === 'security' && (
            <Card sx={{ mt: 3, borderColor: 'error.main' }} variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom color="error">
                  <Warning sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Danger Zone
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  These actions are irreversible. Please proceed with caution.
                </Typography>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => alert('Clear all data')}
                  >
                    Clear All Data
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => alert('Delete account')}
                  >
                    Delete Account
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Settings;