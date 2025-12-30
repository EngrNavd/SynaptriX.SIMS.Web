// frontend/components/invoices/InvoiceForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid, // CHANGED BACK to regular Grid
  Paper,
  Typography,
  TextField,
  MenuItem,
  Divider,
  Alert,
  IconButton,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  LocalShipping as ShippingIcon,
  Description as NotesIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { UAEUtils } from '@/utils/uae.utils';
import CustomerSelection from './CustomerSelection';
import ProductSelection from './ProductSelection';
import type { 
  CreateInvoiceDto, 
  UpdateInvoiceDto, 
  CreateInvoiceItemDto,
  CustomerDto,
  ProductDto 
} from '@/types';

interface InvoiceFormProps {
  mode: 'create' | 'edit';
  formData: Partial<CreateInvoiceDto> | Partial<UpdateInvoiceDto>;
  onFormChange: (field: string, value: any) => void;
  onCustomerSelected: (customer: CustomerDto | null) => void;
  initialCustomer?: CustomerDto | null;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  mode,
  formData,
  onFormChange,
  onCustomerSelected,
  initialCustomer = null,
}) => {
  const [items, setItems] = useState<CreateInvoiceItemDto[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(initialCustomer);

  // Initialize items from formData
  useEffect(() => {
    if (formData.items) {
      setItems(formData.items as CreateInvoiceItemDto[]);
    }
  }, [formData.items]);

  // Handle customer selection
  const handleCustomerSelected = (customer: CustomerDto | null) => {
    setSelectedCustomer(customer);
    onCustomerSelected(customer);
    if (customer) {
      onFormChange('customerId', customer.id);
    }
  };

  // Handle product selection
  const handleProductSelected = (product: ProductDto) => {
    // Check if product already exists in items
    const existingItemIndex = items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if exists
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      setItems(updatedItems);
      onFormChange('items', updatedItems);
    } else {
      // Add new item
      const newItem: CreateInvoiceItemDto = {
        productId: product.id,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discountPercent: 0,
      };
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      onFormChange('items', updatedItems);
    }
  };

  // Handle item quantity change
  const handleQuantityChange = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = [...items];
    updatedItems[index].quantity = quantity;
    setItems(updatedItems);
    onFormChange('items', updatedItems);
  };

  // Handle item price change
  const handlePriceChange = (index: number, price: number) => {
    if (price < 0) return;
    
    const updatedItems = [...items];
    updatedItems[index].unitPrice = price;
    setItems(updatedItems);
    onFormChange('items', updatedItems);
  };

  // Handle item discount change
  const handleDiscountChange = (index: number, discount: number) => {
    if (discount < 0 || discount > 100) return;
    
    const updatedItems = [...items];
    updatedItems[index].discountPercent = discount;
    setItems(updatedItems);
    onFormChange('items', updatedItems);
  };

  // Handle remove item
  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    onFormChange('items', updatedItems);
  };

  // Calculate item total
  const calculateItemTotal = (item: CreateInvoiceItemDto): number => {
    const unitPrice = item.unitPrice || 0;
    const quantity = item.quantity || 0;
    const discountPercent = item.discountPercent || 0;
    const itemTotal = unitPrice * quantity;
    const discountAmount = (itemTotal * discountPercent) / 100;
    return itemTotal - discountAmount;
  };

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const taxRate = 5; // UAE VAT 5%
    const taxAmount = (subtotal * taxRate) / 100;
    const shipping = typeof formData.shippingCharges === 'number' ? formData.shippingCharges : 0;
    const total = subtotal + taxAmount + shipping;

    return { subtotal, taxAmount, shipping, total };
  };

  const totals = calculateTotals();

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ width: '100%' }}>
        {/* Customer Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Customer Information
          </Typography>
          <CustomerSelection
            onCustomerSelected={handleCustomerSelected}
            initialCustomer={initialCustomer}
          />
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Product Selection Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom color="primary.main">
            Products & Services
          </Typography>
          <ProductSelection
            onProductSelected={handleProductSelected}
            disabled={!selectedCustomer}
            existingItems={items.map(item => ({
              productId: item.productId,
              quantity: item.quantity
            }))}
          />
          
          {!selectedCustomer && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Please select a customer first to add products.
            </Alert>
          )}
        </Box>

        {/* Items Table */}
        {items.length > 0 && (
          <Paper elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="bold">
                Invoice Items ({items.length})
              </Typography>
            </Box>
            
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: 800 }}>
                {/* Table Header */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 0.5fr',
                  gap: 1,
                  p: 2,
                  bgcolor: 'grey.50',
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="body2" fontWeight="bold">Product</Typography>
                  <Typography variant="body2" fontWeight="bold" align="right">Unit Price</Typography>
                  <Typography variant="body2" fontWeight="bold" align="center">Qty</Typography>
                  <Typography variant="body2" fontWeight="bold" align="right">Discount %</Typography>
                  <Typography variant="body2" fontWeight="bold" align="right">Total</Typography>
                  <Typography variant="body2" fontWeight="bold" align="center">Action</Typography>
                </Box>

                {/* Table Rows */}
                {items.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '3fr 1fr 1fr 1fr 1fr 0.5fr',
                      gap: 1,
                      p: 2,
                      alignItems: 'center',
                      borderBottom: index < items.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    {/* Product Info - Would come from API in real app */}
                    <Typography variant="body2">Product #{item.productId.substring(0, 8)}...</Typography>
                    
                    {/* Unit Price */}
                    <TextField
                      size="small"
                      type="number"
                      value={item.unitPrice || ''}
                      onChange={(e) => handlePriceChange(index, parseFloat(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">AED</InputAdornment>
                        ),
                      }}
                      sx={{ maxWidth: 120 }}
                    />
                    
                    {/* Quantity */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </IconButton>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        sx={{ width: 70, mx: 1 }}
                        inputProps={{ min: 1 }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => handleQuantityChange(index, item.quantity + 1)}
                      >
                        +
                      </IconButton>
                    </Box>
                    
                    {/* Discount */}
                    <TextField
                      size="small"
                      type="number"
                      value={item.discountPercent || 0}
                      onChange={(e) => handleDiscountChange(index, parseFloat(e.target.value) || 0)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                        inputProps: { min: 0, max: 100, step: 0.1 }
                      }}
                      sx={{ maxWidth: 120 }}
                    />
                    
                    {/* Total */}
                    <Typography variant="body2" align="right" fontWeight="medium">
                      {UAEUtils.formatCurrency(calculateItemTotal(item))}
                    </Typography>
                    
                    {/* Remove */}
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
            
            {/* Totals Footer */}
            <Box sx={{ 
              p: 2, 
              bgcolor: 'grey.50',
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: 2
            }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Items: {items.length} | Subtotal: {UAEUtils.formatCurrency(totals.subtotal)}
                </Typography>
              </Box>
              <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Typography variant="body2" color="text.secondary">
                  VAT (5%): {UAEUtils.formatCurrency(totals.taxAmount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Shipping: {UAEUtils.formatCurrency(totals.shipping)}
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                  Total: {UAEUtils.formatCurrency(totals.total)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Invoice Details Section */}
        <Grid container spacing={3}>
          {/* Left Column - Dates */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Invoice Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Invoice Date"
                  value={formData.invoiceDate ? new Date(formData.invoiceDate) : new Date()}
                  onChange={(date) => onFormChange('invoiceDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Due Date"
                  value={formData.dueDate ? new Date(formData.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
                  onChange={(date) => onFormChange('dueDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      InputProps: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarIcon />
                          </InputAdornment>
                        ),
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
            
            {/* Shipping Charges */}
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Shipping Charges (AED)"
                type="number"
                value={formData.shippingCharges || 0}
                onChange={(e) => onFormChange('shippingCharges', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShippingIcon />
                    </InputAdornment>
                  ),
                  inputProps: { min: 0, step: 0.01 }
                }}
                size="small"
              />
            </Box>
          </Grid>

          {/* Right Column - Payment & Notes */}
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom color="primary.main">
              Payment Information
            </Typography>
            
            <FormControl fullWidth size="small" sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentMethod || 'Cash'}
                label="Payment Method"
                onChange={(e) => onFormChange('paymentMethod', e.target.value)}
                startAdornment={
                  <InputAdornment position="start">
                    <MoneyIcon />
                  </InputAdornment>
                }
              >
                <MenuItem value="Cash">Cash</MenuItem>
                <MenuItem value="CreditCard">Credit Card</MenuItem>
                <MenuItem value="BankTransfer">Bank Transfer</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Payment Reference"
              value={formData.paymentReference || ''}
              onChange={(e) => onFormChange('paymentReference', e.target.value)}
              size="small"
              sx={{ mb: 2 }}
            />
            
            <Typography variant="h6" gutterBottom color="primary.main" sx={{ mt: 3 }}>
              Notes
            </Typography>
            
            <TextField
              fullWidth
              label="Invoice Notes"
              value={formData.notes || ''}
              onChange={(e) => onFormChange('notes', e.target.value)}
              multiline
              rows={4}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <NotesIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        {/* Empty State */}
        {items.length === 0 && (
          <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider', borderRadius: 2, mt: 4 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No products added yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use the product search above to add items to this invoice
              </Typography>
            </Box>
          </Paper>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default InvoiceForm;