// frontend/components/invoices/CustomerSelection.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Grid, // CHANGED BACK to regular Grid
  Button,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
  Collapse,
  Fade,
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircle as CheckIcon,
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { customersApi } from '@/api/customers.api';
import { UAEUtils } from '@/utils/uae.utils';
import type { CustomerDto, CreateCustomerDto } from '@/types';
import CustomerForm from '@/components/customers/CustomerForm';

interface CustomerSelectionProps {
  onCustomerSelected: (customer: CustomerDto | null) => void;
  initialCustomer?: CustomerDto | null;
  disabled?: boolean;
}

const CustomerSelection: React.FC<CustomerSelectionProps> = ({
  onCustomerSelected,
  initialCustomer = null,
  disabled = false,
}) => {
  // State
  const [mobileInput, setMobileInput] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showRegistration, setShowRegistration] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<CustomerDto | null>(initialCustomer);
  const [validationError, setValidationError] = useState<string>('');

  // Set initial mobile if customer provided
  useEffect(() => {
    if (initialCustomer?.mobile) {
      setMobileInput(UAEUtils.formatMobileForDisplay(initialCustomer.mobile));
      setMobileNumber(initialCustomer.mobile);
      setFoundCustomer(initialCustomer);
    }
  }, [initialCustomer]);

  // Mobile validation
  const validateMobile = (mobile: string): boolean => {
    const formatted = UAEUtils.formatMobileForApi(mobile);
    const isValid = UAEUtils.isValidUaeMobile(formatted);
    
    if (!isValid) {
      setValidationError('Invalid UAE mobile number. Format: +9715XXXXXXXX');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  // Handle mobile input change
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobileInput(value);
    
    // Auto-format as user types
    if (value) {
      const formatted = UAEUtils.formatMobileForDisplay(value);
      if (formatted !== value) {
        setMobileInput(formatted);
      }
    }
    
    // Reset states
    if (foundCustomer) {
      setFoundCustomer(null);
      onCustomerSelected(null);
    }
    setValidationError('');
  };

  // Lookup customer by mobile
  const lookupCustomerMutation = useMutation({
    mutationFn: (mobile: string) => 
      customersApi.getCustomerByMobile(UAEUtils.formatMobileForApi(mobile)),
    onSuccess: (response) => {
      setIsSearching(false);
      if (response.success && response.data) {
        const customer = response.data;
        setFoundCustomer(customer);
        setMobileNumber(customer.mobile);
        setMobileInput(UAEUtils.formatMobileForDisplay(customer.mobile));
        onCustomerSelected(customer);
      } else {
        setFoundCustomer(null);
        onCustomerSelected(null);
        // Show registration form if customer not found
        setShowRegistration(true);
      }
    },
    onError: (error: any) => {
      setIsSearching(false);
      setFoundCustomer(null);
      onCustomerSelected(null);
      setShowRegistration(true);
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: (data: CreateCustomerDto) => customersApi.createCustomer(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        const newCustomer = response.data;
        setFoundCustomer(newCustomer);
        setMobileNumber(newCustomer.mobile);
        setMobileInput(UAEUtils.formatMobileForDisplay(newCustomer.mobile));
        onCustomerSelected(newCustomer);
        setShowRegistration(false);
      }
    },
    onError: (error: any) => {
      console.error('Failed to create customer:', error);
    },
  });

  // Handle search
  const handleSearch = () => {
    if (!mobileInput.trim()) {
      setValidationError('Please enter a mobile number');
      return;
    }

    if (!validateMobile(mobileInput)) {
      return;
    }

    const formattedMobile = UAEUtils.formatMobileForApi(mobileInput);
    setIsSearching(true);
    lookupCustomerMutation.mutate(formattedMobile);
  };

  // Handle clear
  const handleClear = () => {
    setMobileInput('');
    setMobileNumber('');
    setFoundCustomer(null);
    setShowRegistration(false);
    setValidationError('');
    onCustomerSelected(null);
  };

  // Handle customer form submit
  const handleCustomerCreate = (data: CreateCustomerDto) => {
    // Ensure mobile number matches the one we searched for
    const customerData: CreateCustomerDto = {
      ...data,
      mobile: mobileNumber || UAEUtils.formatMobileForApi(mobileInput),
    };
    createCustomerMutation.mutate(customerData);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      handleSearch();
    }
  };

  // Format mobile for display
  const getFormattedMobile = (mobile: string): string => {
    return UAEUtils.formatMobileForDisplay(mobile);
  };

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="h6" gutterBottom color="primary.main">
        Customer Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter customer mobile number to lookup existing customer or register new customer
      </Typography>

      {/* Mobile Search Section */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={9}>
            <TextField
              fullWidth
              label="Customer Mobile Number *"
              placeholder="+971 5X XXX XXXX"
              value={mobileInput}
              onChange={handleMobileChange}
              onKeyPress={handleKeyPress}
              error={!!validationError}
              helperText={validationError || "UAE format: +9715XXXXXXXX"}
              disabled={disabled || isSearching || !!foundCustomer}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: mobileInput && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClear}
                      disabled={disabled || isSearching}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={!mobileInput.trim() || disabled || isSearching || !!foundCustomer}
              startIcon={
                isSearching ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SearchIcon />
                )
              }
              sx={{ height: '56px' }}
            >
              {isSearching ? 'Searching...' : 'Lookup'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Found Customer Display */}
      <Collapse in={!!foundCustomer}>
        <Fade in={!!foundCustomer}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mb: 3,
              bgcolor: 'success.light',
              border: '1px solid',
              borderColor: 'success.main',
              borderRadius: 2,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <CheckIcon color="success" />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Customer Found
                  </Typography>
                </Box>
                <Typography variant="body2">
                  <strong>Name:</strong> {foundCustomer?.fullName}
                </Typography>
                <Typography variant="body2">
                  <strong>Mobile:</strong> {getFormattedMobile(foundCustomer?.mobile || '')}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {foundCustomer?.email || 'Not provided'}
                </Typography>
                {foundCustomer?.company && (
                  <Typography variant="body2">
                    <strong>Company:</strong> {foundCustomer.company}
                  </Typography>
                )}
                <Box mt={1}>
                  <Chip
                    label={`Credit Limit: ${UAEUtils.formatCurrency(foundCustomer?.creditLimit || 0)}`}
                    size="small"
                    color="default"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`Balance: ${UAEUtils.formatCurrency(foundCustomer?.currentBalance || 0)}`}
                    size="small"
                    color={
                      (foundCustomer?.currentBalance || 0) > 0
                        ? 'warning'
                        : 'success'
                    }
                    variant="outlined"
                  />
                </Box>
              </Box>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClear}
                disabled={disabled}
                startIcon={<ClearIcon />}
              >
                Change
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Collapse>

      {/* Registration Form - Show when customer not found */}
      <Collapse in={showRegistration && !foundCustomer && !isSearching}>
        <Fade in={showRegistration && !foundCustomer && !isSearching}>
          <Box>
            <Box sx={{ my: 3, position: 'relative', textAlign: 'center' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: 'divider',
                  zIndex: 1,
                }}
              />
              <Chip
                label="Register New Customer"
                sx={{
                  bgcolor: 'background.paper',
                  position: 'relative',
                  zIndex: 2,
                  px: 2,
                }}
              />
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
              Customer not found. Please register new customer details.
              <br />
              <strong>Mobile:</strong> {getFormattedMobile(mobileInput)}
            </Alert>

            <CustomerForm
              initialData={null}
              onSubmit={handleCustomerCreate}
              isLoading={createCustomerMutation.isPending}
              isEdit={false}
              prefillMobile={mobileNumber || UAEUtils.formatMobileForApi(mobileInput)}
            />

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                onClick={() => setShowRegistration(false)}
                disabled={createCustomerMutation.isPending}
              >
                Cancel Registration
              </Button>
              <Button
                variant="contained"
                type="submit"
                form="customer-form"
                disabled={createCustomerMutation.isPending}
                startIcon={
                  createCustomerMutation.isPending ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PersonAddIcon />
                  )
                }
              >
                {createCustomerMutation.isPending ? 'Creating...' : 'Register & Select'}
              </Button>
            </Box>
          </Box>
        </Fade>
      </Collapse>

      {/* Error State */}
      {lookupCustomerMutation.isError && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Error looking up customer. Please try again.
        </Alert>
      )}

      {/* Loading State */}
      {isSearching && (
        <Box display="flex" justifyContent="center" alignItems="center" py={4}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Searching for customer...
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default CustomerSelection;