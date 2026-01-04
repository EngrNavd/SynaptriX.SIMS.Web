import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { invoicesApi } from '../../api/invoices.api';
import CustomerSelection from '../../Components/invoices/CustomerSelection'; // UPDATED
import ProductSelectionSection from '../../Components/invoices/ProductSelectionSection';
import InvoiceReviewSection from '../../Components/invoices/InvoiceReviewSection';

// Import types from your types file
import type { CustomerDto } from '@/types'; // ADDED

// Define local types
interface ProductDto {
  id: string;
  name: string;
  sellingPrice: number;
  purchasePrice?: number;
  stockQuantity: number;
  sku?: string;
  description?: string;
  category?: string;
  brand?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface CustomerFormData {
  name: string;
  email: string;
  address: string;
  city: string;
  emirates: string;
  taxRegistrationNumber: string;
}

const steps = ['Customer', 'Products', 'Review & Complete'];

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [mobileNumber, setMobileNumber] = useState<string>('');
  const [customer, setCustomer] = useState<CustomerDto | null>(null); // UPDATED TYPE
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [customerFormData, setCustomerFormData] = useState<CustomerFormData>({
    name: '',
    email: '',
    address: '',
    city: '',
    emirates: '',
    taxRegistrationNumber: ''
  });
  const [selectedProducts, setSelectedProducts] = useState<Array<{
    product: ProductDto;
    quantity: number;
  }>>([]);
  const [shippingCharges, setShippingCharges] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [paymentStatus, setPaymentStatus] = useState<string>('Unpaid');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Clear all data when mobile number changes
  const clearCustomerData = () => {
    setCustomer(null);
    setShowCustomerForm(false);
    setCustomerFormData({
      name: '',
      email: '',
      address: '',
      city: '',
      emirates: '',
      taxRegistrationNumber: ''
    });
    setSelectedProducts([]);
    setShippingCharges(0);
    setDiscountAmount(0);
    setNotes('');
    setPaymentMethod('Cash');
    setPaymentStatus('Unpaid');
    setAmountPaid(0);
  };

  // Handle customer selection from CustomerSelection component
  const handleCustomerSelected = (selectedCustomer: CustomerDto | null) => {
    setCustomer(selectedCustomer);
    
    if (selectedCustomer) {
      // Update mobile number from selected customer
      setMobileNumber(selectedCustomer.mobile || '');
      
      // Update customer form data for display in review section
      setCustomerFormData({
        name: selectedCustomer.fullName || '',
        email: selectedCustomer.email || '',
        address: selectedCustomer.address || '',
        city: selectedCustomer.city || '',
        emirates: selectedCustomer.state || '',
        taxRegistrationNumber: selectedCustomer.taxNumber || ''
      });
    } else {
      // Customer cleared
      setMobileNumber('');
      clearCustomerData();
    }
  };

  // Calculate totals for display only
  const calculateTotals = () => {
    const subTotal = selectedProducts.reduce(
      (sum, item) => sum + ((item.product.sellingPrice || 0) * (item.quantity || 1)),
      0
    );
    
    const vatRate = 0.05; // 5% UAE VAT
    const taxAmount = subTotal * vatRate;
    
    // Calculate total amount
    const totalAmount = subTotal + taxAmount + (shippingCharges || 0) - (discountAmount || 0);
    
    // Calculate amount due
    const amountDue = totalAmount - (amountPaid || 0);

    return {
      subTotal,
      taxAmount,
      discountAmount,
      shippingCharges,
      totalAmount,
      amountPaid,
      amountDue
    };
  };

  const { subTotal, taxAmount, totalAmount, amountDue } = calculateTotals();

  // Handle next step
  const handleNext = () => {
    if (createInvoiceMutation.isPending) {
      return;
    }

    if (activeStep === 0) {
      // Validate customer step
      if (!customer && !customerFormData.name) {
        setSnackbar({
          open: true,
          message: 'Please select or register a customer first',
          severity: 'error'
        });
        return;
      }
    } else if (activeStep === 1) {
      // Validate products step
      if (selectedProducts.length === 0) {
        setSnackbar({
          open: true,
          message: 'Please add at least one product to the invoice',
          severity: 'error'
        });
        return;
      }
    }

    // If we're on the last step, don't increment - submission is handled separately
    if (activeStep < steps.length - 1) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (invoiceData: any) =>
      invoicesApi.createInvoice(invoiceData),
    onSuccess: (response: any) => {
      console.log('Invoice creation response:', response);
      
      if (response.success && response.data) {
        setSnackbar({
          open: true,
          message: 'Invoice created successfully!',
          severity: 'success'
        });
        // Navigate to invoice details after delay
        setTimeout(() => {
          navigate(`/invoices/${response.data.id}`);
        }, 1500);
      } else if (response.id || response.invoiceNumber) {
        // Handle direct response (without success wrapper)
        setSnackbar({
          open: true,
          message: 'Invoice created successfully!',
          severity: 'success'
        });
        setTimeout(() => {
          navigate(`/invoices/${response.id}`);
        }, 1500);
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Invoice created!',
          severity: response.success === false ? 'error' : 'success'
        });
        if (response.success !== false) {
          setTimeout(() => {
            navigate('/invoices');
          }, 1500);
        }
      }
    },
    onError: (error: any) => {
      console.error('Create invoice error:', error);
      console.error('Error response data:', error.response?.data);
      
      let errorMessage = 'An error occurred while creating invoice';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors?.length > 0) {
        errorMessage = error.response.data.errors.join(', ');
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    }
  });

  const handleCreateInvoice = () => {
    // Validate customer
    if (!customer && !customerFormData.name) {
      setSnackbar({
        open: true,
        message: 'Customer information is required',
        severity: 'error'
      });
      return;
    }

    // Validate products
    if (selectedProducts.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please add at least one product to the invoice',
        severity: 'error'
      });
      return;
    }

    // Prepare invoice items
    const invoiceItems = selectedProducts.map(item => ({
      productId: item.product.id,
      quantity: item.quantity || 1,
      discountPercent: 0,
    }));

    // Prepare invoice data matching backend DTO
    const invoiceData = {
      customerId: customer?.id || '',
      items: invoiceItems,
      shippingCharges: shippingCharges || 0,
      discountAmount: discountAmount || 0,
      notes: notes || '',
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: paymentStatus || 'Unpaid',
      amountPaid: amountPaid || 0,
      status: 'Draft',
      invoiceDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };

    console.log('Sending invoice data:', invoiceData);
    console.log('Payment details:', {
      discountAmount: invoiceData.discountAmount,
      amountPaid: invoiceData.amountPaid,
      paymentStatus: invoiceData.paymentStatus
    });
    
    createInvoiceMutation.mutate(invoiceData);
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle product selection
  const handleProductSelect = (product: ProductDto) => {
    const existingIndex = selectedProducts.findIndex(
      (item) => item.product.id === product.id
    );
    if (existingIndex >= 0) {
      const updated = [...selectedProducts];
      updated[existingIndex].quantity += 1;
      setSelectedProducts(updated);
    } else {
      setSelectedProducts([
        ...selectedProducts,
        { product, quantity: 1 }
      ]);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (productId: string, quantity: number) => {
    if (quantity < 1) {
      // Remove product if quantity is 0 or negative
      const updated = selectedProducts.filter(
        (item) => item.product.id !== productId
      );
      setSelectedProducts(updated);
    } else {
      const updated = selectedProducts.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      setSelectedProducts(updated);
    }
  };

  // Handle product removal
  const handleProductRemove = (productId: string) => {
    const updated = selectedProducts.filter(
      (item) => item.product.id !== productId
    );
    setSelectedProducts(updated);
  };

  // Get customer display name
  const getCustomerDisplayName = () => {
    if (customer) {
      return customer.fullName || '';
    }
    if (customerFormData.name) {
      return customerFormData.name;
    }
    return '';
  };

  // Get customer display mobile
  const getCustomerDisplayMobile = () => {
    if (customer?.mobile) {
      return customer.mobile;
    }
    if (mobileNumber) {
      return mobileNumber;
    }
    return '';
  };

  // Render step content
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <CustomerSelection
            onCustomerSelected={handleCustomerSelected}
            initialCustomer={customer}
            disabled={createInvoiceMutation.isPending}
          />
        );
      case 1:
        return (
          <ProductSelectionSection
            selectedProducts={selectedProducts}
            setSelectedProducts={setSelectedProducts}
            onProductSelect={handleProductSelect}
            onQuantityChange={handleQuantityChange}
            onProductRemove={handleProductRemove}
          />
        );
      case 2:
        return (
          <InvoiceReviewSection
            customer={{
              id: customer?.id || '',
              name: getCustomerDisplayName(),
              mobile: getCustomerDisplayMobile(),
              email: customer?.email || customerFormData.email || '',
              address: customer?.address || customerFormData.address || '',
              city: customer?.city || customerFormData.city || '',
              emirates: customer?.state || customerFormData.emirates || '',
              taxRegistrationNumber: customer?.taxNumber || customerFormData.taxRegistrationNumber || '',
              status: 'Active',
              createdAt: customer?.createdAt || new Date().toISOString()
            }}
            selectedProducts={selectedProducts}
            shippingCharges={shippingCharges}
            setShippingCharges={setShippingCharges}
            discountAmount={discountAmount}
            setDiscountAmount={setDiscountAmount}
            notes={notes}
            setNotes={setNotes}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
            amountPaid={amountPaid}
            setAmountPaid={setAmountPaid}
            subTotal={subTotal}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
            amountDue={amountDue}
            onBack={handleBack}
            onSubmit={handleCreateInvoice}
            onEditCustomer={() => setActiveStep(0)}
            onEditProducts={() => setActiveStep(1)}
            isSubmitting={createInvoiceMutation.isPending}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Invoice
        </Typography>

        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step Content */}
        <Box sx={{ mb: 4 }}>
          {renderStepContent(activeStep)}
        </Box>

        {/* Navigation Buttons - Only show Next on steps 0 and 1 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || createInvoiceMutation.isPending}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/invoices')}
              disabled={createInvoiceMutation.isPending}
            >
              Cancel
            </Button>
            
            {/* Only show Next button on steps 0 and 1 */}
            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
                disabled={createInvoiceMutation.isPending}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            ) : (
              /* On last step, show Create Invoice button */
              <Button
                variant="contained"
                color="primary"
                onClick={handleCreateInvoice}
                disabled={createInvoiceMutation.isPending || !customer || selectedProducts.length === 0}
                endIcon={
                  createInvoiceMutation.isPending ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CheckCircleIcon />
                  )
                }
              >
                {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Quick Summary */}
        {selectedProducts.length > 0 && (
          <Paper sx={{ p: 2, mt: 3, bgcolor: 'background.default' }}>
            <Typography variant="subtitle1" gutterBottom>
              Quick Summary
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Items
                </Typography>
                <Typography variant="body1">
                  {selectedProducts.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Subtotal
                </Typography>
                <Typography variant="body1">
                  AED {subTotal.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  VAT (5%)
                </Typography>
                <Typography variant="body1">
                  AED {taxAmount.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="body2" color="textSecondary">
                  Total
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  AED {totalAmount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
            {discountAmount > 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Discount: AED {discountAmount.toFixed(2)}
              </Typography>
            )}
            {amountPaid > 0 && (
              <Typography variant="body2" color={amountPaid >= totalAmount ? "success.main" : "warning.main"} sx={{ mt: 1 }}>
                Amount Paid: AED {amountPaid.toFixed(2)} {amountPaid >= totalAmount ? '(Fully Paid)' : '(Partially Paid)'}
              </Typography>
            )}
            {amountDue > 0 && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                Amount Due: AED {amountDue.toFixed(2)}
              </Typography>
            )}
          </Paper>
        )}
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CreateInvoicePage;