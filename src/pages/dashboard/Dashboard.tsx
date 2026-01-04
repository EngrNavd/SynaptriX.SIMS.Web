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
  Chip,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  Receipt,
  People,
  Inventory,
  AttachMoney,
  ShoppingCart,
  Store,
  LocalShipping,
  AccountBalance,
  CreditCard,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';

export default function Dashboard() {
  // Fetch customer statistics
  const { data: customerStats, isLoading, error } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: () => customersApi.getStatistics(),
  });

  // Dashboard stats - UPDATED: Using theme colors
  const stats = [
    {
      title: "Today's Revenue",
      value: 'AED 12,450',
      icon: <AttachMoney sx={{ fontSize: 40 }} />,
      color: 'info.main',
      description: '+12.5% from yesterday',
      trend: 'up',
    },
    {
      title: 'Monthly Sales',
      value: 'AED 245,800',
      icon: <Receipt sx={{ fontSize: 40 }} />,
      color: 'success.main',
      description: '+8.2% from last month',
      trend: 'up',
    },
    {
      title: 'Total Customers',
      value: customerStats?.data?.totalCustomers?.toString() || '1,245',
      icon: <People sx={{ fontSize: 40 }} />,
      color: 'info.main',
      description: customerStats?.data ? 'Active customers' : '+15.7% growth',
      trend: 'up',
    },
    {
      title: 'Inventory Value',
      value: 'AED 125,430',
      icon: <Inventory sx={{ fontSize: 40 }} />,
      color: 'warning.main',
      description: '856 total products',
      trend: 'stable',
    },
  ];

  // Quick actions
  const quickActions = [
    { label: 'Create Invoice', icon: <ShoppingCart />, color: 'info' },
    { label: 'Add Customer', icon: <People />, color: 'info.main' },
    { label: 'Add Product', icon: <Inventory />, color: 'info.main' },
    { label: 'View Reports', icon: <Receipt />, color: 'info.main' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome back! Here's what's happening with your business today.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          Failed to load dashboard statistics: {error.message}
        </Alert>
      )}

      {/* Stats Grid - UPDATED: Using theme colors */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid key={index} item xs={12} sm={6} md={3}>
            <Card 
              className="hover-card"
              sx={{ 
                height: '100%',
                borderLeft: `4px solid`,
                borderColor: stat.color,
                position: 'relative',
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    {isLoading && stat.title === 'Total Customers' ? (
                      <LinearProgress sx={{ width: '60%', mb: 1 }} />
                    ) : (
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {stat.value}
                      </Typography>
                    )}
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: stat.trend === 'up' ? 'success.main' : 'text.secondary',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                      }}
                    >
                      {stat.trend === 'up' && <TrendingUp sx={{ fontSize: 14 }} />}
                      {stat.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: stat.color,
                      backgroundColor: 'action.hover',
                      borderRadius: 2,
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
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.paper' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid key={index} item xs={6} sm={3}>
              <Card
                className="hover-card"
                sx={{
                  textAlign: 'center',
                  p: 2,
                  cursor: 'pointer',
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ color: 'info.main', mb: 1 }}>
                  {action.icon}
                </Box>
                <Typography variant="body2" fontWeight="medium">
                  {action.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Additional Content */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold">
                Recent Activity
              </Typography>
              <Chip label="Today" size="small" color="primary" />
            </Box>
            
            <Box sx={{ mt: 2 }}>
              {[
                { time: '10:30 AM', action: 'New order #ORD-1001 placed', amount: 'AED 1,250' },
                { time: '09:15 AM', action: 'Customer Ahmed Ali updated', type: 'Update' },
                { time: 'Yesterday', action: 'Product "iPhone 15" low stock alert', type: 'Alert' },
                { time: 'Jan 14', action: 'Monthly sales report generated', type: 'Report' },
              ].map((activity, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: index === 0 ? 'action.hover' : 'transparent',
                    borderLeft: index === 0 ? '3px solid' : 'none',
                    borderColor: 'primary.main',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      color: 'white',
                    }}
                  >
                    {activity.type === 'Update' ? 'U' : activity.type === 'Alert' ? 'A' : 'O'}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      {activity.action}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                  {activity.amount && (
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      {activity.amount}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%', bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Business Overview
            </Typography>
            
            <Box sx={{ mt: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Revenue Growth
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={75} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    bgcolor: 'divider',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: 'primary.main',
                    }
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">This Month</Typography>
                  <Typography variant="caption" fontWeight="bold">75%</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography variant="body2">Active Customers</Typography>
                  </Box>
                  <Typography fontWeight="bold">{customerStats?.data?.activeCustomers || '1,045'}</Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body2">New This Month</Typography>
                  </Box>
                  <Typography fontWeight="bold">{customerStats?.data?.newCustomersThisMonth || '45'}</Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography variant="body2">Pending Orders</Typography>
                  </Box>
                  <Typography fontWeight="bold">12</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Top Selling Products
            </Typography>
            <Box sx={{ mt: 2 }}>
              {['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Air M2', 'Sony Headphones', 'iPad Pro'].map((product, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: index < 3 ? 'action.hover' : 'transparent',
                  }}
                >
                  <Typography variant="body2">{product}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {['AED 4,200', 'AED 3,800', 'AED 3,500', 'AED 1,200', 'AED 2,800'][index]}
                    </Typography>
                    <Chip 
                      label={`${['45', '38', '32', '28', '24'][index]} sold`} 
                      size="small" 
                      color={index < 3 ? 'primary' : 'default'}
                      variant={index < 3 ? 'filled' : 'outlined'}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.paper' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Customer Locations
            </Typography>
            <Box sx={{ mt: 2 }}>
              {[
                { location: 'Dubai', customers: 420, percentage: 35 },
                { location: 'Abu Dhabi', customers: 310, percentage: 26 },
                { location: 'Sharjah', customers: 185, percentage: 15 },
                { location: 'Ajman', customers: 95, percentage: 8 },
                { location: 'Other', customers: 190, percentage: 16 },
              ].map((item, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{item.location}</Typography>
                    <Typography variant="body2" fontWeight="medium">
                      {item.customers} customers ({item.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={item.percentage} 
                    sx={{ 
                      height: 6, 
                      borderRadius: 3,
                      bgcolor: 'divider',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'primary.main',
                        opacity: 1 - (index * 0.15),
                      }
                    }} 
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* API Note */}
      <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>Note:</strong> Dashboard shows demo data for now. Once operational, will display real-time sales, inventory, and customer statistics.
        </Typography>
      </Alert>
    </Box>
  );
}