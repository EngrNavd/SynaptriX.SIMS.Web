import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Chip,
  Stack,
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Cancel as CancelIcon,
  Print as PrintIcon,
  LocalAtm as PaymentIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Email as EmailAddressIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Define interfaces
interface Customer {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  city?: string;
  emirates?: string;
  taxRegistrationNumber?: string;
  status?: string;
  createdAt?: string;
}

interface Product {
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
  isActive?: boolean;
}

interface SelectedProduct {
  product: Product;
  quantity: number;
}

// Local formatter function
const formatMobileForDisplay = (mobile: string): string => {
  if (!mobile) return '';
  const cleaned = mobile.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+971 ${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return mobile;
};

interface InvoiceReviewSectionProps {
  customer: Customer | null;
  selectedProducts: SelectedProduct[];
  shippingCharges: number;
  setShippingCharges: (value: number) => void;
  discountAmount: number;
  setDiscountAmount: (value: number) => void;
  notes: string;
  setNotes: (value: string) => void;
  paymentMethod: string;
  setPaymentMethod: (value: string) => void;
  paymentStatus: string;
  setPaymentStatus: (value: string) => void;
  amountPaid: number;
  setAmountPaid: (value: number) => void;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  amountDue: number;
  onBack: () => void;
  onSubmit: () => void;
  onEditCustomer?: () => void;
  onEditProducts?: () => void;
  isSubmitting?: boolean;
}

const InvoiceReviewSection: React.FC<InvoiceReviewSectionProps> = ({
  customer,
  selectedProducts = [],
  shippingCharges,
  setShippingCharges,
  discountAmount,
  setDiscountAmount,
  notes,
  setNotes,
  paymentMethod,
  setPaymentMethod,
  paymentStatus,
  setPaymentStatus,
  amountPaid,
  setAmountPaid,
  subTotal,
  taxAmount,
  totalAmount,
  amountDue,
  onBack,
  onSubmit,
  onEditCustomer,
  onEditProducts,
  isSubmitting = false,
}) => {
  // Safety check for selectedProducts
  const safeSelectedProducts = Array.isArray(selectedProducts) ? selectedProducts : [];

  // State for invoice details
  const [invoiceDate, setInvoiceDate] = useState<Date | null>(new Date());
  const [dueDate, setDueDate] = useState<Date | null>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  const [error, setError] = useState<string | null>(null);

  // Calculate item totals
  const calculateItemTotal = (product: Product, quantity: number) => {
    return (product.sellingPrice || 0) * (quantity || 1);
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Handle shipping charges change
  const handleShippingChargesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setShippingCharges(value);
  };

  // Handle discount amount change
  const handleDiscountAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setDiscountAmount(value);
  };

  // Handle amount paid change
  const handleAmountPaidChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value) || 0;
    setAmountPaid(value);
    
    // Auto-update payment status based on amount paid
    if (value >= totalAmount) {
      setPaymentStatus('Paid');
    } else if (value > 0) {
      setPaymentStatus('PartiallyPaid');
    } else {
      setPaymentStatus('Unpaid');
    }
  };

  // Handle notes change
  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
  };

  // Handle payment method change
  const handlePaymentMethodChange = (event: any) => {
    setPaymentMethod(event.target.value as string);
  };

  // Handle payment status change
  const handlePaymentStatusChange = (event: any) => {
    const newStatus = event.target.value as string;
    setPaymentStatus(newStatus);
    
    // Auto-set amount paid based on status
    if (newStatus === 'Paid') {
      setAmountPaid(totalAmount);
    } else if (newStatus === 'Unpaid') {
      setAmountPaid(0);
    }
  };

  // Validate and submit
  const handleSubmit = () => {
    if (!customer || !customer.id) {
      setError('Customer information is required');
      return;
    }

    if (safeSelectedProducts.length === 0) {
      setError('Please add at least one product to the invoice');
      return;
    }

    // Check for products with invalid prices
    const invalidProducts = safeSelectedProducts.filter(
      item => !item.product.sellingPrice || item.product.sellingPrice <= 0
    );
    if (invalidProducts.length > 0) {
      setError('Some products have invalid prices. Please check product selection.');
      return;
    }

    setError(null);
    onSubmit();
  };

  // Get customer display name
  const getCustomerName = () => {
    if (!customer) return 'Unknown Customer';
    return customer.name || 'Unknown Customer';
  };

  // Get total quantity of all products
  const getTotalQuantity = () => {
    return safeSelectedProducts.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Review & Complete Invoice
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Customer Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Customer Information
                </Typography>
                {onEditCustomer && (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={onEditCustomer}
                    size="small"
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    Edit
                  </Button>
                )}
              </Box>

              {customer ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PersonIcon fontSize="small" />
                      {getCustomerName()}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Mobile
                    </Typography>
                    <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon fontSize="small" />
                      {formatMobileForDisplay(customer.mobile)}
                    </Typography>
                  </Box>

                  {customer.email && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailAddressIcon fontSize="small" />
                        {customer.email}
                      </Typography>
                    </Box>
                  )}

                  {customer.address && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationIcon fontSize="small" />
                        {customer.address}
                      </Typography>
                    </Box>
                  )}

                  {customer.taxRegistrationNumber && (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        TRN Number
                      </Typography>
                      <Typography variant="body1">
                        {customer.taxRegistrationNumber}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              ) : (
                <Alert severity="warning">
                  No customer selected. Please go back and select or register a customer.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Details */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Details
              </Typography>

              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Invoice Date"
                      value={invoiceDate}
                      onChange={(newValue) => setInvoiceDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, disabled: true } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <DatePicker
                      label="Due Date"
                      value={dueDate}
                      onChange={(newValue) => setDueDate(newValue)}
                      slotProps={{ textField: { fullWidth: true, disabled: true } }}
                    />
                  </Grid>
                </Grid>
              </LocalizationProvider>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="payment-method-label">Payment Method</InputLabel>
                    <Select
                      labelId="payment-method-label"
                      value={paymentMethod}
                      label="Payment Method"
                      onChange={handlePaymentMethodChange}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="Cash">Cash</MenuItem>
                      <MenuItem value="CreditCard">Credit Card</MenuItem>
                      <MenuItem value="DebitCard">Debit Card</MenuItem>
                      <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
                      <MenuItem value="Cheque">Cheque</MenuItem>
                      <MenuItem value="DigitalWallet">Digital Wallet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="payment-status-label">Payment Status</InputLabel>
                    <Select
                      labelId="payment-status-label"
                      value={paymentStatus}
                      label="Payment Status"
                      onChange={handlePaymentStatusChange}
                      disabled={isSubmitting}
                    >
                      <MenuItem value="Unpaid">Unpaid</MenuItem>
                      <MenuItem value="PartiallyPaid">Partially Paid</MenuItem>
                      <MenuItem value="Paid">Paid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Products Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Products ({safeSelectedProducts.length})
                </Typography>
                {onEditProducts && (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={onEditProducts}
                    size="small"
                    variant="outlined"
                    disabled={isSubmitting}
                  >
                    Edit Products
                  </Button>
                )}
              </Box>

              {safeSelectedProducts.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell align="center">SKU</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Quantity</TableCell>
                        <TableCell align="right">Total</TableCell>
                        <TableCell align="center">Stock</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {safeSelectedProducts.map((item, index) => (
                        <TableRow key={`product-${item.product.id}-${index}`}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.product.name}
                            </Typography>
                            {item.product.description && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {item.product.description}
                              </Typography>
                            )}
                            {item.product.category && (
                              <Chip
                                label={item.product.category}
                                size="small"
                                sx={{ mt: 0.5, mr: 1 }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2">
                              {item.product.sku || 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(item.product.sellingPrice || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {item.quantity || 1}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              {formatCurrency(calculateItemTotal(item.product, item.quantity))}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              icon={<InventoryIcon />}
                              label={item.product.stockQuantity || 0}
                              size="small"
                              color={
                                (item.product.stockQuantity || 0) > 10
                                  ? 'success'
                                  : (item.product.stockQuantity || 0) > 0
                                  ? 'warning'
                                  : 'error'
                              }
                              variant="outlined"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="warning">
                  No products added. Please go back and add products to the invoice.
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Charges & Notes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Details
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Shipping Charges"
                    type="number"
                    value={shippingCharges}
                    onChange={handleShippingChargesChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Discount Amount"
                    type="number"
                    value={discountAmount}
                    onChange={handleDiscountAmountChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={isSubmitting}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount Paid"
                    type="number"
                    value={amountPaid}
                    onChange={handleAmountPaidChange}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                    }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={isSubmitting}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add any special instructions or notes for this invoice..."
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={isSubmitting}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Invoice Summary */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Invoice Summary
              </Typography>

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Subtotal ({getTotalQuantity()} items)</Typography>
                  <Typography variant="body1">{formatCurrency(subTotal)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body1">VAT (5%)</Typography>
                  <Typography variant="body1">{formatCurrency(taxAmount)}</Typography>
                </Box>

                {shippingCharges > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Shipping Charges</Typography>
                    <Typography variant="body1">+{formatCurrency(shippingCharges)}</Typography>
                  </Box>
                )}

                {discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Discount</Typography>
                    <Typography variant="body1" color="error">
                      -{formatCurrency(discountAmount)}
                    </Typography>
                  </Box>
                )}

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Total Amount</Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(totalAmount)}
                  </Typography>
                </Box>

                {amountPaid > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">Amount Paid</Typography>
                    <Typography variant="body1" color="success.main">
                      -{formatCurrency(amountPaid)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Amount Due</Typography>
                  <Typography variant="h6" color={amountDue > 0 ? "error" : "success.main"}>
                    {formatCurrency(amountDue)}
                  </Typography>
                </Box>
              </Stack>

              <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  icon={<ReceiptIcon />}
                  label={`Invoice #INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`}
                  variant="outlined"
                />
                <Chip
                  icon={<PaymentIcon />}
                  label={paymentMethod || 'Cash'}
                  variant="outlined"
                />
                <Chip
                  label={paymentStatus || 'Unpaid'}
                  color={
                    paymentStatus === 'Paid' ? 'success' :
                    paymentStatus === 'PartiallyPaid' ? 'warning' : 'default'
                  }
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={onBack}
          startIcon={<CancelIcon />}
          variant="outlined"
          size="large"
          disabled={isSubmitting}
        >
          Back to Products
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<PrintIcon />}
            variant="outlined"
            size="large"
            onClick={() => window.print()}
            disabled={isSubmitting}
          >
            Print Preview
          </Button>

          <Button
            onClick={handleSubmit}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
            variant="contained"
            size="large"
            disabled={isSubmitting || !customer || safeSelectedProducts.length === 0}
          >
            {isSubmitting ? 'Creating Invoice...' : 'Review Complete'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceReviewSection;