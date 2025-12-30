// frontend/pages/invoices/CreateInvoicePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import { UAEUtils } from '@/utils/uae.utils';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import type { CreateInvoiceDto, InvoiceDto } from '@/types';

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [isDraft, setIsDraft] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateInvoiceDto>>({
    customerId: undefined,
    items: [],
    shippingCharges: 0,
    invoiceDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'Draft',
    notes: '',
    paymentMethod: 'Cash',
  });

  // Steps for the process
  const steps = ['Customer & Products', 'Review & Payment', 'Complete'];

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceDto) => invoicesApi.createInvoice(data),
    onSuccess: (response) => {
      if (response.success) {
        const invoice = response.data;
        navigate(`/invoices/${invoice.id}`, {
          state: { 
            success: true, 
            message: `Invoice ${isDraft ? 'saved as draft' : 'created'} successfully!` 
          }
        });
      }
    },
    onError: (error: any) => {
      console.error('Failed to create invoice:', error);
    },
  });

  // Handle form data change
  const handleFormChange = (field: keyof CreateInvoiceDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle save as draft
  const handleSaveDraft = () => {
    if (!validateForm()) return;
    
    setIsDraft(true);
    const draftData: CreateInvoiceDto = {
      ...formData as CreateInvoiceDto,
      status: 'Draft',
      customerId: formData.customerId || '', // Required field
      items: formData.items || [], // Required field
    };
    
    createInvoiceMutation.mutate(draftData);
  };

  // Handle create invoice
  const handleCreateInvoice = () => {
    if (!validateForm()) return;
    
    setIsDraft(false);
    const invoiceData: CreateInvoiceDto = {
      ...formData as CreateInvoiceDto,
      status: 'Pending', // Default status for new invoices
      customerId: formData.customerId || '', // Required field
      items: formData.items || [], // Required field
    };
    
    createInvoiceMutation.mutate(invoiceData);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.customerId) {
      alert('Please select a customer');
      return false;
    }
    
    if (!formData.items || formData.items.length === 0) {
      alert('Please add at least one product to the invoice');
      return false;
    }
    
    // Validate items have quantity > 0
    const invalidItems = formData.items?.filter(item => !item.quantity || item.quantity <= 0);
    if (invalidItems && invalidItems.length > 0) {
      alert('All products must have a quantity greater than 0');
      return false;
    }
    
    return true;
  };

  // Calculate totals
  const calculateTotals = () => {
    const items = formData.items || [];
    const subtotal = items.reduce((sum, item) => {
      const unitPrice = item.unitPrice || 0;
      const quantity = item.quantity || 0;
      const discountPercent = item.discountPercent || 0;
      const itemTotal = unitPrice * quantity;
      const discountAmount = (itemTotal * discountPercent) / 100;
      return sum + (itemTotal - discountAmount);
    }, 0);

    const taxRate = 5; // UAE VAT 5%
    const taxAmount = (subtotal * taxRate) / 100;
    const shipping = formData.shippingCharges || 0;
    const total = subtotal + taxAmount + shipping;

    return { subtotal, taxAmount, shipping, total };
  };

  const totals = calculateTotals();

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            underline="hover"
            color="inherit"
            href="/dashboard"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Dashboard
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href="/invoices"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Invoices
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Create Invoice
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Create New Invoice
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new invoice for your customer. Fill in customer details, add products, and set payment information.
        </Typography>
      </Box>

      {/* Progress Stepper */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'background.default' }}>
        <Stepper activeStep={0} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Main Form */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <InvoiceForm
          mode="create"
          formData={formData}
          onFormChange={handleFormChange}
          onCustomerSelected={(customer) => {
            if (customer) {
              handleFormChange('customerId', customer.id);
            }
          }}
        />
      </Paper>

      {/* Summary Card */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.dark">
          Invoice Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="h6" fontWeight="bold">{UAEUtils.formatCurrency(totals.subtotal)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">VAT (5%)</Typography>
            <Typography variant="h6" fontWeight="bold">{UAEUtils.formatCurrency(totals.taxAmount)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="h6" fontWeight="bold">{UAEUtils.formatCurrency(totals.shipping)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {UAEUtils.formatCurrency(totals.total)}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/invoices')}
          disabled={createInvoiceMutation.isPending}
        >
          Cancel
        </Button>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSaveDraft}
            disabled={createInvoiceMutation.isPending || !formData.customerId || !formData.items?.length}
            startIcon={
              createInvoiceMutation.isPending && isDraft ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
          >
            {createInvoiceMutation.isPending && isDraft ? 'Saving Draft...' : 'Save as Draft'}
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateInvoice}
            disabled={createInvoiceMutation.isPending || !formData.customerId || !formData.items?.length}
            startIcon={
              createInvoiceMutation.isPending && !isDraft ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <CheckIcon />
              )
            }
            sx={{ minWidth: 150 }}
          >
            {createInvoiceMutation.isPending && !isDraft ? 'Creating...' : 'Create Invoice'}
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {createInvoiceMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to create invoice: {createInvoiceMutation.error?.message || 'Unknown error'}
        </Alert>
      )}

      {/* Info Alert for Draft */}
      {isDraft && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Draft invoices can be edited later from the invoices list. Drafts do not affect customer balance or inventory.
        </Alert>
      )}
    </Box>
  );
};

export default CreateInvoicePage;