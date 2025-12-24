import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Badge,
  Tabs,
  Tab,
  Menu,
  MenuItem,
  Divider,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  Search,
  Add,
  Edit,
  Delete,
  Visibility,
  Phone,
  Email,
  AccountBalance,
  LocationOn,
  Business,
  Cake,
  Work,
  Assignment,
  Clear,
  FilterList,
  Download,
  MoreVert,
  TrendingUp,
  TrendingDown,
  AccountCircle,
  Payment,
  ShoppingCart,
  AttachMoney,
  AccessTime,
  CreditScore,
  Warning,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';
import { UAEUtils } from '@/utils/uae.utils';
import CustomerForm from '@/components/customers/CustomerForm';
import toast from 'react-hot-toast';
import type { CustomerDto } from '@/types';
import { format } from 'date-fns';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const queryClient = useQueryClient();
  
  // Debounced version of search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Fetch customers
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['customers', page, pageSize, debouncedSearch, statusFilter],
    queryFn: () => customersApi.getCustomers({
      page: page + 1,
      pageSize,
      search: debouncedSearch || undefined,
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch customer statistics
  const { data: statsResponse } = useQuery({
    queryKey: ['customer-statistics'],
    queryFn: () => customersApi.getStatistics(),
  });

  const customers = response?.success && Array.isArray(response.data) 
    ? response.data 
    : [];

  // Filter customers by status
  const filteredCustomers = customers.filter(customer => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return customer.currentBalance <= 0;
    if (statusFilter === 'owing') return customer.currentBalance > 0;
    if (statusFilter === 'credit') return customer.creditLimit > 0;
    return true;
  });

  const totalCount = filteredCustomers.length || 0;
  
  // Calculate statistics
  const calculateStats = () => {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.currentBalance <= 0).length;
    const owingCustomers = customers.filter(c => c.currentBalance > 0).length;
    const creditCustomers = customers.filter(c => c.creditLimit > 0).length;
    const totalOutstanding = customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0);
    const totalCreditLimit = customers.reduce((sum, c) => sum + c.creditLimit, 0);
    
    return {
      totalCustomers,
      activeCustomers,
      owingCustomers,
      creditCustomers,
      totalOutstanding,
      totalCreditLimit,
    };
  };

  const stats = calculateStats();

  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customer-statistics'] });
        toast.success('Customer deactivated successfully');
      } else {
        toast.error(response.message || 'Failed to deactivate customer');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to deactivate customer';
      toast.error(errorMessage);
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEdit && selectedCustomer) {
        const updateData = {
          fullName: data.fullName || '',
          email: data.email || '',
          mobile: data.mobile || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || 'United Arab Emirates',
          postalCode: data.postalCode || '',
          dateOfBirth: data.dateOfBirth || null,
          gender: data.gender || '',
          occupation: data.occupation || '',
          company: data.company || '',
          taxNumber: data.taxNumber || '',
          creditLimit: data.creditLimit || 0,
          notes: data.notes || '',
        };
        
        return await customersApi.updateCustomer(selectedCustomer.id, updateData);
      } else {
        return await customersApi.createCustomer(data);
      }
    },
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        queryClient.invalidateQueries({ queryKey: ['customer-statistics'] });
        toast.success(response.message || (isEdit ? 'Customer updated successfully' : 'Customer created successfully'));
        handleCloseDialog();
      } else {
        if (response.errors && response.errors.length > 0) {
          response.errors.forEach((err: string) => toast.error(err));
        } else {
          toast.error(response.message || 'Failed to save customer');
        }
      }
    },
    onError: (error: any) => {
      let errorMessage = 'Failed to save customer';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message && typeof error.message === 'string' && error.message !== '[object Object]') {
        errorMessage = error.message;
      } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
        errorMessage = error.response.data.errors.join(', ');
      }
      
      toast.error(errorMessage);
    },
  });

  const handleOpenCreate = () => {
    setIsEdit(false);
    setViewMode(false);
    setSelectedCustomer(null);
    setOpenDialog(true);
  };

  const handleOpenEdit = (customer: CustomerDto) => {
    setIsEdit(true);
    setViewMode(false);
    setSelectedCustomer(customer);
    setOpenDialog(true);
  };

  const handleOpenView = (customer: CustomerDto) => {
    setViewMode(true);
    setIsEdit(false);
    setSelectedCustomer(customer);
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this customer? They will no longer appear in active lists.')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setIsEdit(false);
    setViewMode(false);
  };

  const handleSaveCustomer = async (data: any) => {
    await saveMutation.mutateAsync(data);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(0);
    handleFilterClose();
  };

  // Enhanced Customer Details View
  const CustomerDetailsView = ({ customer }: { customer: CustomerDto }) => (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            bgcolor: 'primary.main',
            fontSize: 32,
            fontWeight: 'bold',
          }}
        >
          {customer.fullName.charAt(0)}
        </Avatar>
        <Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {customer.fullName}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Chip 
              icon={<Assignment />}
              label={`Code: ${customer.customerCode || 'N/A'}`}
              size="small"
              variant="outlined"
            />
            <Chip 
              icon={<Business />}
              label={customer.company || 'No Company'}
              size="small"
              variant="outlined"
            />
            <Chip 
              label={`Created: ${format(new Date(customer.createdAt), 'MMM dd, yyyy')}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Contact Information */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="hover-card">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                Contact Information
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Mobile</Typography>
                    <Typography variant="body1">{UAEUtils.formatPhoneForDisplay(customer.mobile)}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Email color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Email</Typography>
                    <Typography variant="body1">{customer.email || 'Not provided'}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="action" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Address</Typography>
                    <Typography variant="body2">
                      {customer.address || 'Not provided'}
                      {customer.city && `, ${customer.city}`}
                      {customer.state && `, ${customer.state}`}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card className="hover-card">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                Personal Details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Occupation</Typography>
                  <Typography variant="body2">{customer.occupation || 'Not specified'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Gender</Typography>
                  <Typography variant="body2">{customer.gender || 'Not specified'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body2">
                    {customer.dateOfBirth ? format(new Date(customer.dateOfBirth), 'MMM dd, yyyy') : 'Not specified'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Tax Number</Typography>
                  <Typography variant="body2">{customer.taxNumber || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Financial Overview */}
        <Grid size={{ xs: 12 }}>
          <Card className="hover-card">
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                Financial Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold"
                      color={customer.currentBalance > 0 ? 'error.main' : 'success.main'}
                      gutterBottom
                    >
                      {UAEUtils.formatCurrency(customer.currentBalance)}
                    </Typography>
                    {customer.currentBalance > 0 && (
                      <Chip 
                        icon={<Warning />}
                        label="Payment Due"
                        size="small"
                        color="error"
                        variant="outlined"
                      />
                    )}
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Credit Limit</Typography>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {UAEUtils.formatCurrency(customer.creditLimit)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {customer.creditLimit > 0 ? 'Active Credit' : 'No Credit'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Available Credit</Typography>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold"
                      color={customer.creditLimit - customer.currentBalance > 0 ? 'success.main' : 'error.main'}
                      gutterBottom
                    >
                      {UAEUtils.formatCurrency(customer.creditLimit - customer.currentBalance)}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={customer.creditLimit > 0 ? ((customer.currentBalance / customer.creditLimit) * 100) : 0}
                      sx={{ 
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: customer.currentBalance > customer.creditLimit * 0.8 ? 'error.main' : 'warning.main',
                        }
                      }}
                    />
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary">Total Purchases</Typography>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {customer.totalPurchases}
                    </Typography>
                    <Typography variant="body2" color="primary.main">
                      {UAEUtils.formatCurrency(customer.totalPurchaseAmount)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Notes Section */}
        {customer.notes && (
          <Grid size={{ xs: 12 }}>
            <Card className="hover-card">
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                  Notes
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="body2">{customer.notes}</Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );

  // Calculate status based on balance
  const getCustomerStatus = (customer: CustomerDto) => {
    if (customer.currentBalance > 0) {
      return 'Owes Money';
    } else if (customer.creditLimit > 0) {
      return 'Active Credit';
    } else {
      return 'Active';
    }
  };

  // Columns for DataGrid
  const columns: GridColDef<CustomerDto>[] = [
    {
      field: 'customerCode',
      headerName: 'Code',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
            {params.row.fullName?.charAt(0)}
          </Avatar>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {params.value || 'N/A'}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Customer',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography fontWeight="medium">{params.value}</Typography>
          {params.row.company && (
            <Typography variant="caption" color="text.secondary" display="block">
              {params.row.company}
            </Typography>
          )}
          {params.row.city && (
            <Typography variant="caption" color="text.secondary">
              {params.row.city}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'mobile',
      headerName: 'Contact',
      width: 160,
      renderCell: (params) => (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">{UAEUtils.formatPhoneForDisplay(params.value)}</Typography>
          </Box>
          {params.row.email && (
            <Typography variant="caption" color="text.secondary" display="block">
              {params.row.email}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'currentBalance',
      headerName: 'Balance',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {params.value > 0 ? (
            <TrendingUp fontSize="small" color="error" />
          ) : (
            <TrendingDown fontSize="small" color="success" />
          )}
          <Typography
            fontWeight="bold"
            color={params.value > 0 ? 'error.main' : 'success.main'}
          >
            {UAEUtils.formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'creditLimit',
      headerName: 'Credit',
      width: 120,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <CreditScore fontSize="small" color="action" />
          <Typography variant="body2">
            {UAEUtils.formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      valueGetter: (_, row) => getCustomerStatus(row),
      renderCell: (params) => {
        const status = params.value;
        if (status === 'Owes Money') {
          return <Chip label="Owes Money" color="warning" size="small" icon={<Warning />} />;
        } else if (status === 'Active Credit') {
          return <Chip label="Credit Active" color="success" size="small" icon={<Payment />} />;
        } else {
          return <Chip label="Active" color="info" size="small" variant="outlined" />;
        }
      },
    },
    {
      field: 'lastPurchaseDate',
      headerName: 'Last Purchase',
      width: 140,
      valueGetter: (_, row) => row.lastPurchaseDate ? format(new Date(row.lastPurchaseDate), 'MMM dd') : 'Never',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ShoppingCart fontSize="small" color="action" />
          <Typography variant="body2">{params.value}</Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 100,
      getActions: (params) => [
        <IconButton size="small" onClick={() => handleOpenView(params.row)}>
          <Visibility fontSize="small" />
        </IconButton>,
        <IconButton size="small" onClick={() => handleOpenEdit(params.row)}>
          <Edit fontSize="small" />
        </IconButton>,
        <IconButton 
          size="small" 
          onClick={() => handleDelete(params.row.id)}
          disabled={params.row.currentBalance > 0}
        >
          <Delete fontSize="small" />
        </IconButton>,
      ],
    },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
        Error loading customers: {error.message}
        <Button onClick={() => refetch()} sx={{ ml: 2 }} size="small" variant="outlined">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
            Customer Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer in an effient way ..!!!
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            disabled={customers.length === 0}
          >
            Export
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreate}
            disabled={saveMutation.isPending || deleteMutation.isPending}
            sx={{
              background: 'linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #07163E 0%, #0A2463 100%)',
              },
            }}
          >
            Add Customer
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card className="hover-card stat-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Customers
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {stats.totalCustomers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                All time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card className="hover-card stat-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {stats.activeCustomers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Current balance zero
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card className="hover-card stat-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Owing Money
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="warning.main">
                {stats.owingCustomers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Outstanding balance
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card className="hover-card stat-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Credit Limit
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="info.main">
                {UAEUtils.formatCurrency(stats.totalCreditLimit)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total approved
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card className="hover-card stat-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Outstanding
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="error.main">
                {UAEUtils.formatCurrency(stats.totalOutstanding)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                To collect
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Bar */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search customers by name, mobile, email, or code..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {search && (
                    <IconButton onClick={handleClearSearch} size="small">
                      <Clear />
                    </IconButton>
                  )}
                  {isLoading && (
                    <CircularProgress size={20} />
                  )}
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleFilterClick}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Filter
          </Button>
        </Box>

        {/* Filter Menu */}
        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          <MenuItem onClick={() => handleStatusFilter('all')} selected={statusFilter === 'all'}>
            All Customers
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter('active')} selected={statusFilter === 'active'}>
            <Chip label="Active" size="small" color="info" variant="outlined" sx={{ mr: 1 }} />
            Active (No Balance)
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter('owing')} selected={statusFilter === 'owing'}>
            <Chip label="Owing" size="small" color="warning" sx={{ mr: 1 }} />
            Owes Money
          </MenuItem>
          <MenuItem onClick={() => handleStatusFilter('credit')} selected={statusFilter === 'credit'}>
            <Chip label="Credit" size="small" color="success" sx={{ mr: 1 }} />
            Credit Active
          </MenuItem>
        </Menu>

        {/* Active Filters */}
        {statusFilter !== 'all' && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Active filter:
            </Typography>
            <Chip
              label={
                statusFilter === 'active' ? 'Active Customers' :
                statusFilter === 'owing' ? 'Owes Money' :
                'Credit Active'
              }
              size="small"
              onDelete={() => setStatusFilter('all')}
            />
          </Box>
        )}
      </Paper>

      {/* Customer Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <DataGrid
          rows={filteredCustomers}
          columns={columns}
          loading={isLoading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          pageSizeOptions={[10, 25, 50, 100]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F8FAFC',
              borderBottom: '2px solid',
              borderColor: 'divider',
            },
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #E2E8F0',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: 'rgba(10, 36, 99, 0.02)',
            },
          }}
          slots={{
            noRowsOverlay: () => (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', p: 4 }}>
                <AccountCircle sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                <Typography color="text.secondary" gutterBottom>
                  No customers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {search ? 'Try adjusting your search' : 'Add your first customer to get started'}
                </Typography>
              </Box>
            ),
          }}
        />
      </Paper>

      {/* Customer Dialog */}
      <Dialog
        open={openDialog}
        onClose={!saveMutation.isPending ? handleCloseDialog : undefined}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: 'primary.main', color: 'white', py: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="bold">
              {viewMode ? 'Customer Details' : isEdit ? 'Edit Customer' : 'Add New Customer'}
            </Typography>
            {(saveMutation.isPending || deleteMutation.isPending) && (
              <CircularProgress size={20} color="inherit" />
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {viewMode && selectedCustomer ? (
            <CustomerDetailsView customer={selectedCustomer} />
          ) : (
            <Box sx={{ p: 3 }}>
              <CustomerForm
                initialData={selectedCustomer}
                onSubmit={handleSaveCustomer}
                isLoading={saveMutation.isPending}
                isEdit={isEdit}
              />
            </Box>
          )}
        </DialogContent>
		<DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
		  <Button 
			onClick={handleCloseDialog}
			disabled={saveMutation.isPending}
			variant="outlined"
		  >
			Cancel
		  </Button>
          {viewMode && selectedCustomer && (
            <>
              <Button 
                variant="outlined"
                onClick={() => {
                  setViewMode(false);
                  setIsEdit(true);
                }}
                disabled={saveMutation.isPending}
              >
                Edit Details
              </Button>
              <Button 
                variant="contained"
                onClick={handleCloseDialog}
                disabled={saveMutation.isPending}
              >
                Close
              </Button>
            </>
          )}
		  {!viewMode && (
			<Button 
			  variant="contained" 
			  type="submit"
			  form="customer-form"
			  disabled={saveMutation.isPending}
			  startIcon={saveMutation.isPending ? <CircularProgress size={16} /> : null}
			  sx={{
				background: 'linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%)',
				'&:hover': {
				  background: 'linear-gradient(135deg, #07163E 0%, #0A2463 100%)',
				},
			  }}
			>
			  {isEdit ? 'Update Customer' : 'Create Customer'}
			</Button>
		  )}
		</DialogActions>
      </Dialog>
    </Box>
  );
}