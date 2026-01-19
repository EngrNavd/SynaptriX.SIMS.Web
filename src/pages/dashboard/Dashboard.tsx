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
  Divider,
  Select,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Tooltip,
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
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Download,
  Today,
  Yesterday,
  DateRange,
  Store,
  Category,
  ArrowUpward,
  ArrowDownward,
  Error,
  Info,
  CheckCircle,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import dashboardApi, { 
  SalesChartData, 
  RevenueByCategory, 
  DashboardPeriodData 
} from '@/api/dashboard.api';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

// Recharts imports
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';

import YesterdayIcon from '@/components/icons/YesterdayIcon';

// Define period types
type PeriodType = 'today' | 'yesterday' | 'thisweek' | 'lastweek' | 'thismonth' | 'lastmonth';

const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [period, setPeriod] = useState<PeriodType>('today');
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Fetch comprehensive dashboard data for the selected period
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery<DashboardPeriodData>({
    queryKey: ['dashboard', 'period-data', period],
    queryFn: () => dashboardApi.getDashboardPeriodData(period),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch sales chart data
  const {
    data: salesChartData,
    isLoading: chartLoading,
  } = useQuery<SalesChartData[]>({
    queryKey: ['dashboard', 'sales-chart', period],
    queryFn: () => dashboardApi.getSalesChartData(period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch revenue by category
  const {
    data: revenueByCategory,
    isLoading: categoryLoading,
  } = useQuery<RevenueByCategory[]>({
    queryKey: ['dashboard', 'revenue-category', period],
    queryFn: () => dashboardApi.getRevenueByCategory(period),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch top products - FIXED ISSUE #4, #5, #6
  const {
    data: topProducts,
    isLoading: productsLoading,
  } = useQuery({
    queryKey: ['dashboard', 'top-products', period, 5],
    queryFn: () => dashboardApi.getTopProducts(5, period),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch low stock alerts - FIXED ISSUE #4
  const {
    data: lowStockAlerts,
    isLoading: alertsLoading,
  } = useQuery({
    queryKey: ['dashboard', 'low-stock-alerts'],
    queryFn: () => dashboardApi.getLowStockProducts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch dashboard alerts
  const {
    data: dashboardAlerts,
    isLoading: dashboardAlertsLoading,
  } = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: () => dashboardApi.getDashboardAlerts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch recent activities
  const {
    data: recentActivities,
    isLoading: activitiesLoading,
  } = useQuery({
    queryKey: ['dashboard', 'recent-activities'],
    queryFn: () => dashboardApi.getRecentActivities(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportAnchorEl(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportAnchorEl(null);
  };

  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
  };

  const handleRefresh = () => {
    refetchDashboard();
  };

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const blob = await dashboardApi.exportDashboardData(period, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard_${period}_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      // TODO: surface user-facing error (e.g., toast/snackbar)
    }
    handleExportMenuClose();
  };

  // Period options with icons
  const periodOptions = [
    { value: 'today' as PeriodType, label: 'Today', icon: <Today /> },
	{ value: 'yesterday' as PeriodType, label: 'Yesterday', icon: <YesterdayIcon /> },
    { value: 'thisweek' as PeriodType, label: 'This Week', icon: <DateRange /> },
    { value: 'lastweek' as PeriodType, label: 'Last Week', icon: <DateRange /> },
    { value: 'thismonth' as PeriodType, label: 'This Month', icon: <DateRange /> },
    { value: 'lastmonth' as PeriodType, label: 'Last Month', icon: <DateRange /> },
  ];

  // Get current period label
  const currentPeriodLabel = periodOptions.find(p => p.value === period)?.label || 'Today';

  if (dashboardLoading) {
    return (
      <Box sx={{ width: '100%', p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Loading dashboard data for {currentPeriodLabel.toLowerCase()}...
        </Typography>
      </Box>
    );
  }

  if (dashboardError) {
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
        Error loading dashboard data. Please try again.
      </Alert>
    );
  }

  const data = dashboardData || {} as DashboardPeriodData;
  const chartData = salesChartData || [];
  const categories = revenueByCategory || [];
  const topProductsData = topProducts?.data || [];
  const alerts = lowStockAlerts?.data || [];
  const dashboardAlertsData = dashboardAlerts?.data || [];
  const activities = recentActivities || [];

  // KPI Cards Data
  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(data.totalRevenue || 0),
      icon: <AttachMoney fontSize="large" />,
      trend: data.salesGrowth || 0,
      subtitle: `${data.salesCount || 0} transactions`,
      color: theme.palette.primary.main,
      period: data.period || currentPeriodLabel,
      metric: 'revenue',
    },
    {
      title: 'Total Orders',
      value: data.totalOrders || 0,
      icon: <ShoppingCart fontSize="large" />,
      trend: data.orderGrowth || 0,
      subtitle: `${data.pendingOrders || 0} pending`,
      color: theme.palette.success.main,
      metric: 'orders',
    },
    {
      title: 'Active Customers',
      value: data.activeCustomers || 0,
      icon: <People fontSize="large" />,
      trend: data.customerGrowth || 0,
      subtitle: `${data.newCustomers || 0} new customers`,
      color: theme.palette.info.main,
      metric: 'customers',
    },
    {
      title: 'Inventory Status',
      value: data.lowStockCount || 0,
      icon: <Inventory fontSize="large" />,
      trend: 0,
      subtitle: `${data.totalProducts || 0} total products`,
      color: data.lowStockCount > 0 ? theme.palette.error.main : theme.palette.success.main,
      metric: 'inventory',
    },
  ];

  // Custom Tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          {payload.map((pld: any, index: number) => (
            <Typography key={index} variant="body2" sx={{ color: pld.color, mt: 0.5 }}>
              {pld.name}: {pld.name.includes('Revenue') ? formatCurrency(pld.value) : pld.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  // Custom Legend for charts
  const renderColorfulLegendText = (value: string, entry: any) => {
    const { color } = entry;
    return <span style={{ color }}>{value}</span>;
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header with Filters - FIXED ISSUE #2 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Dashboard Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {currentPeriodLabel} • GMT+4 (Dubai Time) • Last updated: {data.lastUpdated || 'Just now'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Period Selector - FIXED ISSUE #2 */}
          <FormControl variant="outlined" size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="period-select-label">Time Period</InputLabel>
            <Select
              labelId="period-select-label"
              value={period}
              onChange={(e) => setPeriod(e.target.value as PeriodType)}
              label="Time Period"
              startAdornment={<CalendarToday sx={{ mr: 1, color: 'text.secondary' }} />}
            >
              {periodOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {option.icon}
                    {option.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={handleRefresh} color="primary" title="Refresh data">
            <Refresh />
          </IconButton>

          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={handleExportMenuOpen}
          >
            Export
          </Button>

          <Menu
            anchorEl={exportAnchorEl}
            open={Boolean(exportAnchorEl)}
            onClose={handleExportMenuClose}
          >
            <MenuItem onClick={() => handleExport('excel')}>
              Export as Excel
            </MenuItem>
            <MenuItem onClick={() => handleExport('csv')}>
              Export as CSV
            </MenuItem>
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
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
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
                    {kpi.period && (
                      <Chip
                        label={kpi.period}
                        size="small"
                        sx={{ mt: 1 }}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Box sx={{ color: kpi.color }}>{kpi.icon}</Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {kpi.subtitle}
                  </Typography>
                  {kpi.trend !== 0 && (
                    <Chip
                      icon={kpi.trend > 0 ? <ArrowUpward /> : <ArrowDownward />}
                      label={`${kpi.trend > 0 ? '+' : ''}${kpi.trend.toFixed(1)}%`}
                      size="small"
                      color={kpi.trend > 0 ? 'success' : 'error'}
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <BarChartIcon sx={{ mr: 1 }} />
                Sales Trend - {currentPeriodLabel}
              </Typography>
              <ToggleButtonGroup
                value={period}
                exclusive
                onChange={(e, newPeriod) => newPeriod && setPeriod(newPeriod)}
                size="small"
              >
                <ToggleButton value="today">Day</ToggleButton>
                <ToggleButton value="thisweek">Week</ToggleButton>
                <ToggleButton value="thismonth">Month</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {chartLoading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LinearProgress sx={{ width: '100%' }} />
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                  <XAxis 
                    dataKey="label" 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                  />
                  <YAxis 
                    stroke={theme.palette.text.secondary}
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Legend formatter={renderColorfulLegendText} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke={theme.palette.primary.main}
                    fill={theme.palette.primary.light}
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke={theme.palette.success.main}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Data displayed in GMT+4 (Dubai Time)
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {chartData.length} data points
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Revenue by Category Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <PieChartIcon sx={{ mr: 1 }} />
              Revenue by Category
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {categoryLoading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LinearProgress sx={{ width: '100%' }} />
              </Box>
            ) : categories.length > 0 ? (
              <Box>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.category}: ${entry.percentage.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                      nameKey="category"
                    >
                      {categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || getCategoryColor(index)} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend formatter={renderColorfulLegendText} />
                  </PieChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  {categories.slice(0, 3).map((category, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          bgcolor: category.color,
                          mr: 1,
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {category.category}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(category.revenue)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        ({category.percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No category data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Second Charts Row */}
      <Grid container spacing={3} sx={{ mt: 0 }}>
        {/* Top Products Chart - FIXED ISSUE #4, #5, #6 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <Store sx={{ mr: 1 }} />
                Top Products - {currentPeriodLabel}
              </Typography>
              <Button size="small" startIcon={<ShowChart />}>
                View All Products
              </Button>
            </Box>

            {productsLoading ? (
              <LinearProgress />
            ) : topProductsData.length > 0 ? (
              <Box>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topProductsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis 
                      dataKey="productName" 
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis 
                      stroke={theme.palette.text.secondary}
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <RechartsTooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend formatter={renderColorfulLegendText} />
                    <Bar 
                      dataKey="revenue" 
                      name="Revenue" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="profit" 
                      name="Profit" 
                      fill={theme.palette.success.main}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>

                {/* Products Table with SKU Display - FIXED ISSUE #6 */}
                <TableContainer sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>SKU</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Revenue</TableCell>
                        <TableCell align="right">Profit</TableCell>
                        <TableCell align="right">Avg. Price</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {topProductsData.map((product: any, index: number) => (
                        <TableRow key={product.productId || index} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {product.productName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={product.sku || 'N/A'} 
                              size="small" 
                              variant="outlined"
                              sx={{ fontFamily: 'monospace' }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            {product.quantitySold || 0}
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                            {formatCurrency(product.revenue || 0)}
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            color: (product.profit || 0) > 0 ? 'success.main' : 'error.main',
                            fontWeight: 'bold'
                          }}>
                            {formatCurrency(product.profit || 0)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(product.averagePrice || 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Store sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No product data available
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Activities & Quick Stats */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <Category sx={{ mr: 1 }} />
              Performance Metrics
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Avg. Order Value
                    </Typography>
                    <Typography variant="h5">
                      {formatCurrency(data.averageOrderValue || 0)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Conversion Rate
                    </Typography>
                    <Typography variant="h5">
                      {data.conversionRate || 0}%
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="body2" color="success.contrastText">
                  Top Product
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'success.contrastText' }}>
                  {data.topProduct || 'N/A'}
                </Typography>
              </Box>
            </Box>

            {/* Recent Activities */}
            <Typography variant="subtitle2" gutterBottom>
              Recent Activities
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {activitiesLoading ? (
              <LinearProgress />
            ) : activities.length > 0 ? (
              <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                {activities.slice(0, 5).map((activity: any, index: number) => (
                  <Box
                    key={activity.id || index}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: 1,
                      bgcolor: index % 2 === 0 ? 'action.hover' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: 'primary.main' }}>
                      {activity.user?.[0]?.toUpperCase() || 'S'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {activity.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {activity.timestamp} (GMT+4)
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                No recent activities
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dashboard Alerts */}
      {dashboardAlertsData.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Warning color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">System Alerts</Typography>
            <Chip
              label={`${dashboardAlertsData.length} alert${dashboardAlertsData.length > 1 ? 's' : ''}`}
              color="warning"
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>

          <Grid container spacing={2}>
            {dashboardAlertsData.slice(0, 4).map((alert: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Alert
                  severity={
                    alert.priority === 'High' ? 'error' :
                    alert.priority === 'Medium' ? 'warning' : 'info'
                  }
                  variant="outlined"
                  sx={{ height: '100%' }}
                  iconMapping={{
                    error: <Error />,
                    warning: <Warning />,
                    info: <Info />,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alert.title}
                  </Typography>
                  <Typography variant="body2">
                    {alert.message}
                  </Typography>
                  {alert.createdAt && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      {alert.createdAt}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Low Stock Alerts - FIXED ISSUE #4 */}
      {alerts.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Inventory color="warning" sx={{ mr: 1 }} />
            <Typography variant="h6">Low Stock Alerts</Typography>
            <Chip
              label={`${alerts.length} product${alerts.length > 1 ? 's' : ''}`}
              color="warning"
              size="small"
              sx={{ ml: 2 }}
            />
          </Box>

          <Grid container spacing={2}>
            {alerts.slice(0, 4).map((alert: any, index: number) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Alert
                  severity={
                    alert.alertLevel === 'High' ? 'error' :
                    alert.alertLevel === 'Medium' ? 'warning' : 'info'
                  }
                  variant="outlined"
                  sx={{ height: '100%' }}
                  icon={<Inventory />}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {alert.name || alert.productName}
                  </Typography>
                  <Typography variant="body2">
                    SKU: <strong>{alert.sku || 'N/A'}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Stock: <strong>{alert.currentStock || 0}</strong> / Min: {alert.reorderLevel || 5}
                  </Typography>
                  {alert.lastUpdated && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Updated: {alert.lastUpdated}
                    </Typography>
                  )}
                </Alert>
              </Grid>
            ))}
          </Grid>
          
          {alerts.length > 4 && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button size="small" startIcon={<Inventory />}>
                View All Low Stock Items ({alerts.length})
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Footer with Quick Stats */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {formatCurrency(data.totalRevenue || 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Revenue
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {data.totalOrders || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Orders
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {data.totalCustomers || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Customers
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary">
                {data.totalProducts || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Products
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            All data is displayed in GMT+4 (Dubai Time) • Last updated: {data.lastUpdated || 'N/A'}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

// Helper function for category colors
const getCategoryColor = (index: number): string => {
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00c49f', '#ffbb28', '#ff8042'
  ];
  return colors[index % colors.length];
};

export default DashboardPage;