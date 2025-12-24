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

  // Dashboard stats - Updated with navy theme
  const stats = [
    {
      title: "Today's Revenue",
      value: 'AED 12,450',
      icon: <AttachMoney sx={{ fontSize: 40, color: '#0A2463' }} />,
      color: 'rgba(10, 36, 99, 0.08)',
      borderColor: '#0A2463',
      description: '+12.5% from yesterday',
      trend: 'up',
    },
    {
      title: 'Monthly Sales',
      value: 'AED 245,800',
      icon: <Receipt sx={{ fontSize: 40, color: '#10B981' }} />,
      color: 'rgba(16, 185, 129, 0.08)',
      borderColor: '#10B981',
      description: '+8.2% from last month',
      trend: 'up',
    },
    {
      title: 'Total Customers',
      value: customerStats?.data?.totalCustomers?.toString() || '1,245',
      icon: <People sx={{ fontSize: 40, color: '#3B82F6' }} />,
      color: 'rgba(59, 130, 246, 0.08)',
      borderColor: '#3B82F6',
      description: customerStats?.data ? 'Active customers' : '+15.7% growth',
      trend: 'up',
    },
    {
      title: 'Inventory Value',
      value: 'AED 125,430',
      icon: <Inventory sx={{ fontSize: 40, color: '#F59E0B' }} />,
      color: 'rgba(245, 158, 11, 0.08)',
      borderColor: '#F59E0B',
      description: '856 total products',
      trend: 'stable',
    },
  ];

  // Quick actions
  const quickActions = [
    { label: 'New Sale', icon: <ShoppingCart />, color: 'primary' },
    { label: 'Add Customer', icon: <People />, color: 'primary' },
    { label: 'Add Product', icon: <Inventory />, color: 'primary' },
    { label: 'View Reports', icon: <Receipt />, color: 'primary' },
  ];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
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

      {/* Stats Grid - UPDATED for MUI v6 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card 
              className="hover-card"
              sx={{ 
                height: '100%',
                backgroundColor: stat.color,
                borderLeft: `4px solid ${stat.borderColor}`,
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                position: 'relative',
                overflow: 'hidden',
                '&:before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${stat.borderColor} 0%, transparent 100%)`,
                },
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
                      <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                        {stat.value}
                      </Typography>
                    )}
                    <Typography variant="caption" sx={{ color: stat.trend === 'up' ? 'success.main' : 'text.secondary' }}>
                      {stat.description}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: `${stat.borderColor}15`,
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
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid key={index} size={{ xs: 6, sm: 3 }}>
              <Card
                className="hover-card"
                sx={{
                  textAlign: 'center',
                  p: 2,
                  cursor: 'pointer',
                  backgroundColor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(10, 36, 99, 0.02)',
                  },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1 }}>
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

      {/* Additional Content - UPDATED for MUI v6 */}
      <Grid container spacing={3}>
        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
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
                    backgroundColor: index === 0 ? 'rgba(10, 36, 99, 0.03)' : 'transparent',
                    borderLeft: index === 0 ? '3px solid' : 'none',
                    borderColor: 'primary.main',
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
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
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
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
                    backgroundColor: 'grey.200',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(90deg, #0A2463 0%, #3E92CC 100%)',
                    }
                  }} 
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">This Month</Typography>
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
                  backgroundColor: 'grey.50',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccountBalance sx={{ color: 'primary.main', fontSize: 20 }} />
                    <Typography>Active Customers</Typography>
                  </Box>
                  <Typography fontWeight="bold">{customerStats?.data?.activeCustomers || '1,045'}</Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'grey.50',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CreditCard sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography>New This Month</Typography>
                  </Box>
                  <Typography fontWeight="bold">{customerStats?.data?.newCustomersThisMonth || '45'}</Typography>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: 'grey.50',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShipping sx={{ color: 'warning.main', fontSize: 20 }} />
                    <Typography>Pending Orders</Typography>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
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
                    backgroundColor: index < 3 ? 'rgba(10, 36, 99, 0.03)' : 'transparent',
                  }}
                >
                  <Typography>{product}</Typography>
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

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
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
                      backgroundColor: 'grey.200',
                      '& .MuiLinearProgress-bar': {
                        background: 'linear-gradient(90deg, #0A2463 0%, #3E92CC 100%)',
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
          <strong>Note:</strong> Dashboard shows demo data. Connect to your .NET API endpoints 
          to display real-time sales, inventory, and customer statistics.
        </Typography>
      </Alert>
    </Box>
  );
}