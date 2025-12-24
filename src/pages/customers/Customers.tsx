import { useState } from 'react';
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
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';
import { UAEUtils } from '@/utils/uae.utils';
import CustomerForm from '@/components/customers/CustomerForm';
import toast from 'react-hot-toast';
import type { CustomerDto } from '@/types';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  
  const queryClient = useQueryClient();

  // Fetch customers
  const { 
    data: response, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['customers', page, pageSize, search],
    queryFn: () => customersApi.getCustomers({
      page: page + 1, // Convert to 1-based for backend
      pageSize,
      search: search || undefined,
    }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Extract data from response - Handle both array and CustomerListDto
	const customers = response?.success && Array.isArray(response.data) 
	  ? response.data 
	  : [];

	const totalCount = customers.length || 0;
	
  // Delete customer mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => customersApi.deleteCustomer(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['customers'] });
        toast.success(response.message || 'Customer deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete customer');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete customer';
      toast.error(errorMessage);
    },
  });

  // Create/Update mutation
	const saveMutation = useMutation({
	mutationFn: async (data: any) => {
    console.log('Mutation Function Called with data:', data);
    
    if (isEdit && selectedCustomer) {
      // For update: send all fields except customerCode
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
      
      console.log('Sending Update Data:', {
        customerId: selectedCustomer.id,
        updateData
      });
      
      return await customersApi.updateCustomer(selectedCustomer.id, updateData);
    } else {
      // For create: send all fields including customerCode
      console.log('Sending Create Data:', data);
      return await customersApi.createCustomer(data);
    }
  },
  onSuccess: (response) => {
    console.log('Mutation Success Response:', response);
    
    if (response.success) {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success(response.message || (isEdit ? 'Customer updated successfully' : 'Customer created successfully'));
      handleCloseDialog();
    } else {
      // Handle validation errors
      if (response.errors && response.errors.length > 0) {
        response.errors.forEach((err: string) => toast.error(err));
      } else {
        toast.error(response.message || 'Failed to save customer');
      }
    }
  },
  onError: (error: any) => {
    console.error('Mutation Error Object:', error);
    console.error('Error Response:', error.response);
    console.error('Error Config:', error.config);
    
    // Extract error message safely
    let errorMessage = 'Failed to save customer';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message && typeof error.message === 'string' && error.message !== '[object Object]') {
      errorMessage = error.message;
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMessage = error.response.data.errors.join(', ');
    } else if (error.response?.data) {
      // Try to stringify the error data
      try {
        errorMessage = JSON.stringify(error.response.data);
      } catch {
        errorMessage = 'Unknown error occurred';
      }
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
    if (window.confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
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

  // View customer details component - Updated to match your CustomerDto
  const CustomerDetailsView = ({ customer }: { customer: CustomerDto }) => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Customer Details
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            <Assignment sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Customer Code
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {customer.customerCode || 'N/A'}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Full Name
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {customer.fullName}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            <Phone sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Mobile Number
          </Typography>
          <Typography variant="body1">
            {UAEUtils.formatPhoneForDisplay(customer.mobile)}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            <Email sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Email
          </Typography>
          <Typography variant="body1">
            {customer.email || 'N/A'}
          </Typography>
        </Box>
        
        {customer.company && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Business sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Company
            </Typography>
            <Typography variant="body1">{customer.company}</Typography>
          </Box>
        )}
        
        {customer.taxNumber && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Tax Number (TRN)
            </Typography>
            <Typography variant="body1">{customer.taxNumber}</Typography>
          </Box>
        )}
        
        {customer.occupation && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Work sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Occupation
            </Typography>
            <Typography variant="body1">{customer.occupation}</Typography>
          </Box>
        )}
        
        {customer.dateOfBirth && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              <Cake sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
              Date of Birth
            </Typography>
            <Typography variant="body1">
              {new Date(customer.dateOfBirth).toLocaleDateString()}
            </Typography>
          </Box>
        )}
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            <LocationOn sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
            Address
          </Typography>
          <Typography variant="body2">
            {customer.address || 'N/A'}
            {customer.city && `, ${customer.city}`}
            {customer.state && `, ${customer.state}`}
            {customer.postalCode && ` - ${customer.postalCode}`}
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Country
          </Typography>
          <Typography variant="body2">{customer.country}</Typography>
        </Box>
      </Box>
      
      <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
        Financial Information
      </Typography>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">Current Balance</Typography>
          <Typography 
            variant="h5" 
            fontWeight="bold"
            color={customer.currentBalance > 0 ? 'error.main' : 'success.main'}
          >
            {UAEUtils.formatCurrency(customer.currentBalance)}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">Credit Limit</Typography>
          <Typography variant="h5" fontWeight="bold">
            {UAEUtils.formatCurrency(customer.creditLimit)}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">Available Credit</Typography>
          <Typography 
            variant="h5" 
            fontWeight="bold"
            color={customer.creditLimit - customer.currentBalance > 0 ? 'success.main' : 'error.main'}
          >
            {UAEUtils.formatCurrency(customer.creditLimit - customer.currentBalance)}
          </Typography>
        </Paper>
      </Box>
      
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mt: 3 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">Total Purchases</Typography>
          <Typography variant="h6" fontWeight="bold">
            {customer.totalPurchases}
          </Typography>
        </Paper>
        
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="subtitle2" color="text.secondary">Total Amount</Typography>
          <Typography variant="h6" fontWeight="bold" color="primary">
            {UAEUtils.formatCurrency(customer.totalPurchaseAmount)}
          </Typography>
        </Paper>
      </Box>
      
      {customer.notes && (
        <>
          <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 3 }}>
            Notes
          </Typography>
          <Paper sx={{ p: 2 }}>
            <Typography variant="body2">{customer.notes}</Typography>
          </Paper>
        </>
      )}
      
      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexWrap: 'wrap' }}>
        <Chip 
          label={`Created: ${new Date(customer.createdAt).toLocaleDateString()}`} 
          variant="outlined" 
          size="small" 
        />
        {customer.lastPurchaseDate && (
          <Chip 
            label={`Last Purchase: ${new Date(customer.lastPurchaseDate).toLocaleDateString()}`} 
            variant="outlined" 
            size="small" 
          />
        )}
        <Chip 
          label={customer.gender || 'Gender not specified'} 
          variant="outlined" 
          size="small" 
        />
      </Box>
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

  // Columns for DataGrid - Updated to match your CustomerDto
  const columns: GridColDef<CustomerDto>[] = [
    {
      field: 'customerCode',
      headerName: 'Code',
      width: 120,
      renderCell: (params) => (
        <Typography fontWeight="bold" color="primary">
          {params.value || 'N/A'}
        </Typography>
      ),
    },
    {
      field: 'fullName',
      headerName: 'Name',
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography fontWeight="medium">{params.value}</Typography>
          {params.row.company && (
            <Typography variant="caption" color="text.secondary">
              {params.row.company}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'mobile',
      headerName: 'Mobile',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone fontSize="small" color="action" />
          <Typography variant="body2">{UAEUtils.formatPhoneForDisplay(params.value)}</Typography>
        </Box>
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Email fontSize="small" color="action" />
          <Typography variant="body2">{params.value || '-'}</Typography>
        </Box>
      ),
    },
    {
      field: 'currentBalance',
      headerName: 'Balance',
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance fontSize="small" color="action" />
          <Typography
            fontWeight="bold"
            color={params.value > 0 ? 'error.main' : params.value < 0 ? 'success.main' : 'text.primary'}
          >
            {UAEUtils.formatCurrency(params.value)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'creditLimit',
      headerName: 'Credit Limit',
      width: 150,
      type: 'number',
      renderCell: (params) => (
        <Typography variant="body2">
          {UAEUtils.formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'city',
      headerName: 'City',
      width: 130,
      renderCell: (params) => (
        <Chip 
          label={params.value || 'N/A'} 
          size="small" 
          variant="outlined"
        />
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
          return <Chip label="Owes Money" color="warning" size="small" />;
        } else if (status === 'Active Credit') {
          return <Chip label="Active Credit" color="success" size="small" />;
        } else {
          return <Chip label="Active" color="success" size="small" variant="outlined" />;
        }
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Visibility />}
          label="View"
          onClick={() => handleOpenView(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit"
          onClick={() => handleOpenEdit(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
          showInMenu
          disabled={params.row.currentBalance > 0}
        />,
      ],
    },
  ];

  // Handle search with debounce
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch('');
    setPage(0);
  };

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading customers: {error.message}
        <Button onClick={() => refetch()} sx={{ ml: 2 }} size="small">
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Customers
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database with UAE-specific features
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCreate}
          sx={{ height: 40 }}
          disabled={saveMutation.isPending || deleteMutation.isPending}
        >
          Add Customer
        </Button>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
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
        />
      </Paper>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Total Customers
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {totalCount}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Active Credit Accounts
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            {customers.filter(c => c.creditLimit > 0).length}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Outstanding Balance
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="error.main">
            {UAEUtils.formatCurrency(
              customers.reduce((sum, c) => sum + (c.currentBalance > 0 ? c.currentBalance : 0), 0)
            )}
          </Typography>
        </Paper>
      </Box>

      {/* Customer Table */}
      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          loading={isLoading}
          pagination
          paginationMode="server"
          rowCount={totalCount}
          pageSizeOptions={[5, 10, 25, 50]}
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
              backgroundColor: 'background.paper',
              borderBottom: '2px solid',
              borderColor: 'divider',
            },
          }}
        />
      </Paper>

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          💡 <strong>UAE Features:</strong> Mobile numbers automatically format to +971 standard. 
          TRN validation ensures compliance with UAE tax regulations. Customers with outstanding balances cannot be deleted.
        </Typography>
      </Alert>

      {/* Customer Dialog */}
      <Dialog
        open={openDialog}
        onClose={!saveMutation.isPending ? handleCloseDialog : undefined}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          {viewMode ? 'View Customer' : isEdit ? 'Edit Customer' : 'Add New Customer'}
          {(saveMutation.isPending || deleteMutation.isPending) && (
            <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
              <CircularProgress size={12} sx={{ mr: 1 }} />
              Processing...
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers>
          {viewMode && selectedCustomer ? (
            <CustomerDetailsView customer={selectedCustomer} />
          ) : (
            <CustomerForm
              initialData={selectedCustomer}
              onSubmit={handleSaveCustomer}
              isLoading={saveMutation.isPending}
              isEdit={isEdit}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseDialog}
            disabled={saveMutation.isPending}
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
                Edit
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
            >
              {isEdit ? 'Update Customer' : 'Create Customer'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}