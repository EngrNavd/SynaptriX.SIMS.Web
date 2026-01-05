// src/pages/dashboard/Dashboard.tsx
import React, { useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  Inventory,
  Warning,
  AttachMoney,
  Receipt,
  MoreVert,
  Refresh,
  CalendarToday,
  ShowChart,
  BarChart,
  PieChart
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import dashboardApi from '@/api/dashboard.api';
import { formatCurrency } from '@/utils/formatters';

const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('today');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch dashboard overview
  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
    refetch: refetchOverview
  } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getDashboardOverview(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dashboard alerts
  const {
    data: alertsData,
    isLoading: alertsLoading
  } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.getDashboardAlerts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch top products
  const {
    data: topProductsData,
    isLoading: topProductsLoading
  } = useQuery({
    queryKey: ['dashboard', 'top-products', 5],
    queryFn: () => dashboardApi.getTopProducts(5),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch quick stats
  const {
    data: quickStatsData,
    isLoading: quickStatsLoading
  } = useQuery({
    queryKey: ['dashboard', 'quick-stats', period],
    queryFn: () => dashboardApi.getQuickStats(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    handleMenuClose();
  };

  const handleRefresh = () => {
    refetchOverview();
  };

  if (overviewLoading || quickStatsLoading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>Loading dashboard data...</Typography>
      </Box>
    );
  }

  if (overviewError) {
    return (
      <Alert
        severity="error"
        sx={{ m: 3 }}
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      >
        Error loading dashboard data. Please try again later.
      </Alert>
    );
  }

  const overview = overviewData?.data;
  const alerts = alertsData?.data || [];
  const topProducts = topProductsData?.data || [];
  const quickStats = quickStatsData?.data;

  // KPI Cards Data
  const kpiCards = [
    {
      title: "Today's Sales",
      value: formatCurrency(overview?.todaySales || 0),
      icon: <AttachMoney fontSize="large" />,
      trend: overview?.salesGrowthVsYesterday || 0,
      subtitle: `vs yesterday: ${Math.abs(overview?.salesGrowthVsYesterday || 0).toFixed(1)}%`,
      color: '#1976d2'
    },
    {
      title: "Total Customers",
      value: overview?.totalCustomers || 0,
      icon: <People fontSize="large" />,
      trend: 0,
      subtitle: `+${overview?.newCustomersThisMonth || 0} this month`,
      color: '#2e7d32'
    },
    {
      title: "Today's Invoices",
      value: overview?.invoicesToday || 0,
      icon: <Receipt fontSize="large" />,
      trend: 0,
      subtitle: `${overview?.overdueInvoices || 0} overdue`,
      color: '#ed6c02'
    },
    {
      title: "Low Stock Products",
      value: overview?.lowStockProducts || 0,
      icon: <Inventory fontSize="large" />,
      trend: 0,
      subtitle: overview?.lowStockProducts > 0 ? 'Needs attention' : 'All good',
      color: overview?.lowStockProducts > 0 ? '#d32f2f' : '#2e7d32'
    }
  ];

  // Available time periods
  const timePeriods = [
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'thisweek', label: 'This Week' },
    { value: 'lastweek', label: 'Last Week' },
    { value: 'thismonth', label: 'This Month' },
    { value: 'lastmonth', label: 'Last Month' },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time business insights and analytics
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleRefresh} color="primary">
            <Refresh />
          </IconButton>
          
          <Button
            variant="outlined"
            startIcon={<CalendarToday />}
            onClick={handleMenuOpen}
          >
            {timePeriods.find(p => p.value === period)?.label || 'Today'}
          </Button>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            {timePeriods.map((periodOption) => (
              <MenuItem
                key={periodOption.value}
                onClick={() => handlePeriodChange(periodOption.value)}
                selected={period === periodOption.value}
              >
                {periodOption.label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* KPI Cards Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {kpiCards.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                borderLeft: `4px solid ${kpi.color}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography color="text.secondary" gutterBottom variant="body2">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {kpi.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: kpi.color }}>
                    {kpi.icon}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  {kpi.trend !== 0 && (
                    <Chip
                      icon={kpi.trend > 0 ? <TrendingUp /> : <TrendingDown />}
                      label={`${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}%`}
                      size="small"
                      color={kpi.trend > 0 ? "success" : "error"}
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                  )}
                  <Typography variant="body2" color="text.secondary">
                    {kpi.subtitle}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">Alerts & Notifications</Typography>
            <Chip
              label={`${alerts.length} alert${alerts.length > 1 ? 's' : ''}`}
              color="warning"
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>
          
          <Grid container spacing={2}>
            {alerts.slice(0, 3).map((alert, index) => (
              <Grid item xs={12} key={index}>
                <Alert
                  severity={
                    alert.priority === 'High' ? 'error' :
                    alert.priority === 'Medium' ? 'warning' : 'info'
                  }
                  variant="outlined"
                  iconMapping={{
                    error: <Warning fontSize="inherit" />,
                    warning: <Warning fontSize="inherit" />,
                    info: <Warning fontSize="inherit" />,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {alert.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {alert.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {new Date(alert.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Main Content Area */}
      <Grid container spacing={3}>
        {/* Top Products Section */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingCart sx={{ mr: 1 }} />
                Top Selling Products
              </Typography>
              <Button
                size="small"
                startIcon={<ShowChart />}
                onClick={() => dashboardApi.getTopProducts(10)}
              >
                View All
              </Button>
            </Box>
            
            {topProductsLoading ? (
              <LinearProgress />
            ) : topProducts.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <Box component="tr" sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
                      <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 'bold' }}>Product</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 'bold' }}>SKU</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 'bold' }}>Quantity</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 'bold' }}>Revenue</Box>
                      <Box component="th" sx={{ textAlign: 'left', p: 2, fontWeight: 'bold' }}>Profit</Box>
                    </Box>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <Box
                        component="tr"
                        key={product.productId}
                        sx={{
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:hover': { backgroundColor: 'action.hover' }
                        }}
                      >
                        <Box component="td" sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {product.productName}
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <Chip label={product.sku} size="small" variant="outlined" />
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <Typography variant="body2">{product.quantitySold}</Typography>
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {formatCurrency(product.revenue)}
                          </Typography>
                        </Box>
                        <Box component="td" sx={{ p: 2 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'medium',
                              color: product.profit > 0 ? 'success.main' : 'error.main'
                            }}
                          >
                            {formatCurrency(product.profit)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </tbody>
                </Box>
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <ShoppingCart sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No product sales data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Quick Stats Sidebar */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChart sx={{ mr: 1 }} />
              Quick Stats
            </Typography>
            
            <Box sx={{ mt: 2 }}>
              <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue ({period})
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(quickStats?.totalRevenue || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {quickStats?.totalInvoices || 0} invoices
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Invoice
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(quickStats?.averageInvoiceValue || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Customers Served
                    </Typography>
                    <Typography variant="h6">
                      {quickStats?.customersServed || 0}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {quickStats?.topProductName && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="success.contrastText">
                    Top Product
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>
                    {quickStats.topProductName}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    {formatCurrency(quickStats.topProductRevenue)} revenue
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Overview */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PieChart sx={{ mr: 1 }} />
          Monthly Overview
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                This Month Sales
              </Typography>
              <Typography variant="h4">
                {formatCurrency(overview?.thisMonthSales || 0)}
              </Typography>
              <Typography
                variant="body2"
                color={overview?.salesGrowthVsLastMonth > 0 ? 'success.main' : 'error.main'}
                sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}
              >
                {overview?.salesGrowthVsLastMonth > 0 ? (
                  <TrendingUp fontSize="small" sx={{ mr: 0.5 }} />
                ) : (
                  <TrendingDown fontSize="small" sx={{ mr: 0.5 }} />
                )}
                {Math.abs(overview?.salesGrowthVsLastMonth || 0).toFixed(1)}% vs last month
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Product Inventory
              </Typography>
              <Typography variant="h4">
                {overview?.totalProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {overview?.lowStockProducts || 0} low stock
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default DashboardPage;