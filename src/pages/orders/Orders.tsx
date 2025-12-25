import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Grid,
  Stack
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Visibility,
  Edit,
  Delete,
  LocalShipping,
  CheckCircle,
  Pending,
  Cancel,
  ShoppingCart
} from '@mui/icons-material';

const Orders: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const orders = [
    {
      id: 'ORD-001',
      customer: 'Ahmed Al Mansoori',
      date: '2024-03-15',
      status: 'Delivered',
      total: 1250.00,
      items: 3
    },
    {
      id: 'ORD-002',
      customer: 'Fatima Al Qasimi',
      date: '2024-03-14',
      status: 'Processing',
      total: 890.50,
      items: 5
    },
    {
      id: 'ORD-003',
      customer: 'Mohammed Al Maktoum',
      date: '2024-03-13',
      status: 'Pending',
      total: 2450.75,
      items: 2
    },
    {
      id: 'ORD-004',
      customer: 'Layla Hassan',
      date: '2024-03-12',
      status: 'Cancelled',
      total: 540.25,
      items: 4
    },
    {
      id: 'ORD-005',
      customer: 'Omar Khalid',
      date: '2024-03-11',
      status: 'Delivered',
      total: 1875.00,
      items: 6
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'primary';
      case 'Pending': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle />;
      case 'Processing': return <LocalShipping />;
      case 'Pending': return <Pending />;
      case 'Cancelled': return <Cancel />;
      default: return <ShoppingCart />;
    }
  };

  const stats = {
    totalOrders: 125,
    totalRevenue: 45680.50,
    pendingOrders: 8,
    avgOrderValue: 365.44
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={600} gutterBottom>
          Orders Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View, manage, and track customer orders.
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: 'primary.light', borderRadius: 1 }}>
                  <ShoppingCart color="primary" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.totalOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Orders
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: 'success.light', borderRadius: 1 }}>
                  <LocalShipping color="success" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    AED {stats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Pending color="warning" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.pendingOrders}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Orders
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                  <CheckCircle color="info" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    AED {stats.avgOrderValue.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avg Order Value
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search orders by ID, customer name, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <IconButton>
              <FilterList />
            </IconButton>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => alert('Create new order')}
            >
              New Order
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Orders
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {order.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>
                        AED {order.total.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={getStatusColor(order.status) as any}
                        icon={getStatusIcon(order.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" title="View">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" title="Edit">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" title="Delete">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button variant="outlined">View All Orders</Button>
          </Box>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<ShoppingCart />}
                onClick={() => alert('Create sales order')}
              >
                Create Sales Order
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocalShipping />}
                onClick={() => alert('Process shipments')}
              >
                Process Shipments
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<CheckCircle />}
                onClick={() => alert('Update order status')}
              >
                Update Status
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => alert('Generate report')}
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Orders;