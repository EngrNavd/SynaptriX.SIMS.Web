import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp,
  Receipt,
  People,
  Inventory,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';

export default function Dashboard() {
  // Fetch customer statistics
  const { data: customerStats, isLoading, error } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: () => customersApi.getStatistics(),
  });

  // Dashboard stats - using your structure
  const stats = [
    {
      title: "Today's Sales",
      value: 'AED 0.00', // Will update with real API later
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.light',
      description: 'Loading...',
    },
    {
      title: 'Monthly Sales',
      value: 'AED 0.00', // Will update with real API later
      icon: <Receipt sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.light',
      description: 'Loading...',
    },
    {
      title: 'Total Customers',
      value: customerStats?.data?.totalCustomers?.toString() || '0',
      icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.light',
      description: customerStats?.data ? 'Registered customers' : 'Loading...',
    },
    {
      title: 'Low Stock Products',
      value: '0', // Will update with real API later
      icon: <Inventory sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.light',
      description: 'Loading...',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to SynaptriX SIMS - Sales & Inventory Management System
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to load dashboard statistics: {error.message}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                backgroundColor: stat.color,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                  {stat.icon}
                </Box>
                {isLoading && stat.title === 'Total Customers' ? (
                  <LinearProgress sx={{ mb: 2 }} />
                ) : (
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {stat.value}
                  </Typography>
                )}
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  {stat.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Additional Content */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Recent Activity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
              <Typography color="text.secondary">
                Activity feed will be displayed here once APIs are connected
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '300px' }}>
            <Typography variant="h6" gutterBottom fontWeight="medium">
              Quick Stats
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography>Active Customers</Typography>
                <Typography fontWeight="bold">{customerStats?.data?.activeCustomers || '0'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography>New This Month</Typography>
                <Typography fontWeight="bold">{customerStats?.data?.newCustomersThisMonth || '0'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography>Avg. Order Value</Typography>
                <Typography fontWeight="bold">AED 0.00</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* API Note */}
      <Alert severity="info" sx={{ mt: 4 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Dashboard is currently using sample data. Connect to your .NET API 
          endpoints to display real-time sales, inventory, and customer statistics.
        </Typography>
      </Alert>
    </Box>
  );
}