import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  People,
  Inventory,
  Receipt,
  Warning,
  Add,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Stats cards data
  const stats = [
    {
      title: "Today's Sales",
      value: 'AED 0.00',
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.light',
      description: 'No sales today',
    },
    {
      title: 'Monthly Sales',
      value: 'AED 0.00',
      icon: <Receipt sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light',
      description: 'No sales this month',
    },
    {
      title: 'Total Customers',
      value: '0',
      icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.light',
      description: 'No customers registered',
    },
    {
      title: 'Low Stock Products',
      value: '0',
      icon: <Inventory sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light',
      description: 'All products in stock',
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Create New Invoice',
      description: 'Generate a new sales invoice',
      icon: <Receipt />,
      action: () => navigate('/invoices?create=true'),
      color: 'primary.main',
    },
    {
      title: 'Add New Customer',
      description: 'Register a new customer',
      icon: <People />,
      action: () => navigate('/customers?create=true'),
      color: 'success.main',
    },
    {
      title: 'Manage Products',
      description: 'View and update product stock',
      icon: <Inventory />,
      action: () => navigate('/products'),
      color: 'info.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Welcome back, {user?.firstName}! Here's what's happening with your business.
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="text.secondary" variant="body2">
                      {stat.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stat.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: stat.color,
                      borderRadius: '50%',
                      p: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Quick Actions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {quickActions.map((action, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      height: '100%',
                      '&:hover': { 
                        transform: 'translateY(-2px)',
                        boxShadow: 4,
                      },
                      transition: 'all 0.2s',
                    }}
                    onClick={action.action}
                  >
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Box
                        sx={{
                          color: action.color,
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <Box sx={{ fontSize: 40 }}>{action.icon}</Box>
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {action.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {action.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* System Status */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              System Status
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                User: {user?.firstName} {user?.lastName}
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                Role: {user?.role}
              </Alert>
              <Alert severity="warning">
                VAT Rate: 5% (UAE Standard)
              </Alert>
              <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  Tenant ID: {user?.tenantId}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Getting Started Guide */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body1" fontWeight="bold">
          Getting Started Guide
        </Typography>
        <Typography variant="body2">
          1. Start by adding customers from the Customers page
          <br />
          2. Add products to your inventory from the Products page
          <br />
          3. Create your first invoice from the Invoices page
          <br />
          4. Track sales and analytics from the Sales page
        </Typography>
      </Alert>

      {/* UAE Specific Info */}
      <Alert severity="warning" sx={{ mt: 2 }}>
        <Typography variant="body2">
          💡 <strong>UAE Compliance:</strong> All invoices include 5% VAT as per UAE regulations.
          Mobile numbers are automatically formatted to +971 standard.
        </Typography>
      </Alert>
    </Box>
  );
}