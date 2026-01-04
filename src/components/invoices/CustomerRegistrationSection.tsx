import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Chip
} from '@mui/material';
import {
  Search as SearchIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { posApi } from '../../api/pos.api';
import { UAEUtils } from '../../utils/uae.utils';
import type { CustomerLookupResponse } from '../../types/customer.types';

interface CustomerRegistrationSectionProps {
  customer: CustomerLookupResponse | null;
  setCustomer: (customer: CustomerLookupResponse | null) => void;
  mobileNumber: string;
  setMobileNumber: (mobile: string) => void;
  showCustomerForm?: boolean;
  setShowCustomerForm?: (show: boolean) => void;
  customerFormData?: any;
  setCustomerFormData?: (data: any) => void;
  onMobileNumberChange?: () => void;
}

const CustomerRegistrationSection: React.FC<CustomerRegistrationSectionProps> = ({
  customer,
  setCustomer,
  mobileNumber,
  setMobileNumber,
  showCustomerForm: externalShowForm,
  setShowCustomerForm: externalSetShowForm,
  customerFormData: externalFormData,
  setCustomerFormData: externalSetFormData,
  onMobileNumberChange
}) => {
  // Local state if not controlled by parent
  const [internalShowForm, setInternalShowForm] = useState(false);
  const [internalFormData, setInternalFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    emirates: '',
    taxRegistrationNumber: ''
  });
  const [mobileError, setMobileError] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState<string>('');

  // Use external or internal state
  const showCustomerForm = externalShowForm !== undefined ? externalShowForm : internalShowForm;
  const setShowCustomerForm = externalSetShowForm !== undefined ? externalSetShowForm : setInternalShowForm;
  const customerFormData = externalFormData !== undefined ? externalFormData : internalFormData;
  const setCustomerFormData = externalSetFormData !== undefined ? externalSetFormData : setInternalFormData;

  // Mutation for customer lookup
  const lookupMutation = useMutation({
    mutationFn: (mobile: string) => posApi.lookupCustomer(mobile),
    onSuccess: (response) => {
      setIsSearching(false);
      
      if (response.success && response.data) {
        // Customer found - load their details
        setCustomer(response.data);
        setSearchMessage(`Customer found: ${response.data.name}`);
        
        // Pre-fill form with customer data for potential editing
        setCustomerFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          address: response.data.address || '',
          city: response.data.city || '',
          emirates: response.data.emirates || '',
          taxRegistrationNumber: response.data.taxRegistrationNumber || ''
        });
        
        // Don't show form for existing customer by default
        // Customer is already loaded, so we don't need registration form
        setShowCustomerForm(false);
      } else {
        // Customer not found - prepare for registration
        setCustomer(null);
        setSearchMessage('Customer not found. Please register new customer.');
        
        // Show registration form
        setShowCustomerForm(true);
        
        // Clear form data for new registration
        setCustomerFormData({
          name: '',
          email: '',
          address: '',
          city: '',
          emirates: '',
          taxRegistrationNumber: ''
        });
      }
    },
    onError: (error: any) => {
      setIsSearching(false);
      setCustomer(null);
      
      // Check if it's a 404 (customer not found)
      if (error.response?.status === 404) {
        setSearchMessage('Customer not found. Please register new customer.');
        setShowCustomerForm(true);
        setCustomerFormData({
          name: '',
          email: '',
          address: '',
          city: '',
          emirates: '',
          taxRegistrationNumber: ''
        });
      } else {
        setSearchMessage('Error searching for customer. Please try again.');
      }
    }
  });

  // Mutation for creating/updating customer
  const saveCustomerMutation = useMutation({
    mutationFn: () => {
      const customerData = {
        name: customerFormData.name.trim(),
        mobile: UAEUtils.formatMobileForApi(mobileNumber),
        email: customerFormData.email?.trim() || '',
        address: customerFormData.address?.trim() || '',
        city: customerFormData.city?.trim() || '',
        emirates: customerFormData.emirates || '',
        taxRegistrationNumber: customerFormData.taxRegistrationNumber?.trim() || ''
      };

      if (customer?.id) {
        // Update existing customer
        return posApi.updateCustomer(customer.id, customerData);
      } else {
        // Create new customer
        return posApi.createCustomer(customerData);
      }
    },
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update customer state with new/updated data
        setCustomer(response.data);
        setFormErrors({});
        setSearchMessage(`Customer ${customer ? 'updated' : 'registered'} successfully!`);
        
        // Hide form after successful save
        setShowCustomerForm(false);
      }
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error.response?.data?.errors) {
        const errors: Record<string, string> = {};
        error.response.data.errors.forEach((err: string) => {
          if (err.includes('Name')) errors.name = err;
          if (err.includes('Email')) errors.email = err;
          if (err.includes('Mobile')) errors.mobile = err;
        });
        setFormErrors(errors);
      }
      setSearchMessage('Failed to save customer. Please check the form.');
    }
  });

  // Handle mobile number change
  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMobileNumber(value);
    
    // Validate UAE mobile format
    if (value && !UAEUtils.isValidUaeMobile(value)) {
      setMobileError('Please enter a valid UAE mobile number (050, 055, 056, 052, 054, 058)');
    } else {
      setMobileError('');
    }

    // Clear customer data if mobile changes
    if (value !== mobileNumber) {
      setCustomer(null);
      setSearchMessage('');
      setShowCustomerForm(false);
      if (onMobileNumberChange) {
        onMobileNumberChange();
      }
    }
  };

  // Handle search (Enter key or button click)
  const handleSearch = () => {
    if (!mobileNumber.trim()) {
      setMobileError('Mobile number is required');
      return;
    }

    if (!UAEUtils.isValidUaeMobile(mobileNumber)) {
      setMobileError('Please enter a valid UAE mobile number');
      return;
    }

    setIsSearching(true);
    setSearchMessage('Searching for customer...');
    lookupMutation.mutate(mobileNumber);
  };

  // Handle Enter key press in mobile field
  const handleMobileKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle form field changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setCustomerFormData({
        ...customerFormData,
        [name]: value
      });
      // Clear error for this field
      if (formErrors[name]) {
        setFormErrors({
          ...formErrors,
          [name]: ''
        });
      }
    }
  };

  // Handle save customer
  const handleSaveCustomer = () => {
    // Validate required fields
    const errors: Record<string, string> = {};
    
    if (!customerFormData.name.trim()) {
      errors.name = 'Full name is required';
    }
    
    if (!mobileNumber.trim()) {
      errors.mobile = 'Mobile number is required';
    } else if (!UAEUtils.isValidUaeMobile(mobileNumber)) {
      errors.mobile = 'Please enter a valid UAE mobile number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    saveCustomerMutation.mutate();
  };

  // Handle edit existing customer
  const handleEditCustomer = () => {
    setShowCustomerForm(true);
  };

  // UAE emirates list
  const emiratesList = UAEUtils.getEmirates();

  return (
    <Box>
      {/* Mobile Number Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer Mobile Number
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Mobile Number"
              placeholder="0501234567"
              value={mobileNumber}
              onChange={handleMobileChange}
              onKeyPress={handleMobileKeyPress}
              error={!!mobileError}
              helperText={mobileError || "Enter UAE mobile number and press Enter to search"}
              InputProps={{
                startAdornment: <InputAdornment position="start"></InputAdornment>,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleSearch}
                      disabled={isSearching || !mobileNumber || !!mobileError}
                      edge="end"
                    >
                      {isSearching ? <CircularProgress size={24} /> : <SearchIcon />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="body2" color="textSecondary">
              {searchMessage || 'Enter mobile number to search'}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Customer Found - Display Information */}
      {customer && !showCustomerForm && (
        <Paper sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'success.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="h6" color="success.main">
                  Customer Found
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Full Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{customer.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="textSecondary">Mobile</Typography>
                  <Typography variant="body1">{UAEUtils.formatMobileForDisplay(customer.mobile)}</Typography>
                </Grid>
                {customer.email && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                    <Typography variant="body1">{customer.email}</Typography>
                  </Grid>
                )}
                {customer.address && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Address</Typography>
                    <Typography variant="body1">{customer.address}</Typography>
                  </Grid>
                )}
                {customer.city && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">City</Typography>
                    <Typography variant="body1">{customer.city}</Typography>
                  </Grid>
                )}
                {customer.emirates && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="textSecondary">Emirates</Typography>
                    <Typography variant="body1">{customer.emirates}</Typography>
                  </Grid>
                )}
                {customer.taxRegistrationNumber && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">Tax Registration Number (TRN)</Typography>
                    <Typography variant="body1">{customer.taxRegistrationNumber}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
            
            <Box>
              <Chip
                icon={<CheckCircleIcon />}
                label="Existing Customer"
                color="success"
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={handleEditCustomer}
                sx={{ mt: 1 }}
              >
                Edit Details
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Customer Registration/Edit Form */}
      {showCustomerForm && (
        <Paper sx={{ p: 3, mb: 3, borderLeft: '4px solid', borderColor: 'primary.main' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              {customer ? 'Edit Customer Details' : 'New Customer Registration'}
            </Typography>
            {customer && (
              <Chip
                label="Editing Existing Customer"
                color="warning"
                variant="outlined"
              />
            )}
          </Box>

          {searchMessage && (
            <Alert severity={customer ? "info" : "warning"} sx={{ mb: 3 }}>
              {searchMessage}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Full Name - Always required */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="name"
                label="Full Name"
                value={customerFormData.name}
                onChange={handleFormChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                placeholder="Enter customer's full name"
                autoFocus
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email"
                label="Email Address"
                type="email"
                value={customerFormData.email}
                onChange={handleFormChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                placeholder="customer@example.com"
              />
            </Grid>

            {/* Mobile (read-only, shown for reference) */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={UAEUtils.formatMobileForDisplay(mobileNumber)}
                InputProps={{
                  readOnly: true,
                }}
                helperText="Mobile number (cannot be changed here)"
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="address"
                label="Address"
                value={customerFormData.address}
                onChange={handleFormChange}
                placeholder="Building, Street, Area"
                multiline
                rows={2}
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="city"
                label="City"
                value={customerFormData.city}
                onChange={handleFormChange}
                placeholder="e.g., Dubai"
              />
            </Grid>

            {/* Emirates */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Emirates</InputLabel>
                <Select
                  name="emirates"
                  value={customerFormData.emirates || ''}
                  onChange={handleFormChange}
                  label="Emirates"
                >
                  <MenuItem value="">Select Emirates</MenuItem>
                  {emiratesList.map((emirate) => (
                    <MenuItem key={emirate} value={emirate}>
                      {emirate}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* TRN (Tax Registration Number) */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="taxRegistrationNumber"
                label="Tax Registration Number (TRN)"
                value={customerFormData.taxRegistrationNumber || ''}
                onChange={handleFormChange}
                placeholder="Enter UAE TRN if available"
                helperText="For VAT invoicing purposes"
              />
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (customer) {
                      // If editing existing customer, just hide form
                      setShowCustomerForm(false);
                    } else {
                      // If registering new customer, clear everything
                      setShowCustomerForm(false);
                      setCustomer(null);
                      setMobileNumber('');
                      setCustomerFormData({
                        name: '',
                        email: '',
                        address: '',
                        city: '',
                        emirates: '',
                        taxRegistrationNumber: ''
                      });
                    }
                  }}
                >
                  {customer ? 'Cancel Edit' : 'Cancel'}
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveCustomer}
                  disabled={saveCustomerMutation.isPending}
                  startIcon={
                    saveCustomerMutation.isPending ? (
                      <CircularProgress size={20} />
                    ) : customer ? (
                      <EditIcon />
                    ) : (
                      <PersonAddIcon />
                    )
                  }
                >
                  {saveCustomerMutation.isPending
                    ? 'Saving...'
                    : customer
                    ? 'Update Customer'
                    : 'Register Customer'}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Success Message */}
          {saveCustomerMutation.isSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Customer {customer ? 'updated' : 'registered'} successfully!
            </Alert>
          )}

          {/* Error Message */}
          {saveCustomerMutation.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to save customer. Please check the form and try again.
            </Alert>
          )}
        </Paper>
      )}

      {/* Instructions */}
      {!customer && !showCustomerForm && mobileNumber && !isSearching && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Press Enter or click the search icon to look up this mobile number.
          If the customer exists, their details will appear here.
        </Alert>
      )}

      {/* Search Status */}
      {isSearching && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CircularProgress size={20} sx={{ mr: 2 }} />
          <Typography variant="body2">Searching for customer...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CustomerRegistrationSection;