import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Box,
  Grid,
  TextField,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
  ShoppingCart as ShoppingCartIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

// Components
import CustomerLookupDialog from '../../components/pos/CustomerLookupDialog';
import ProductSearchDialog from '../../components/pos/ProductSearchDialog';
import InvoiceSummary from '../../components/pos/InvoiceSummary';

// API Services
import { posApi } from '../../api';
import { Customer, Product, InvoiceItem } from '../../types';

// Types
interface CustomerFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address?: string;
}

interface CartItem extends InvoiceItem {
  productName: string;
  productCode: string;
  warranty: boolean;
  warrantyDays?: number;
}

const steps = ['Customer Details', 'Add Products', 'Review & Create'];

// UAE VAT rate (5% as per UAE regulations)
const UAE_VAT_RATE = 0.05;

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    address: '',
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerLookupOpen, setCustomerLookupOpen] = useState(false);
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const vat = subtotal * UAE_VAT_RATE; // 5% UAE VAT
  const total = subtotal + vat;

  // Customer lookup mutation
  const lookupCustomerMutation = useMutation({
    mutationFn: (mobile: string) => posApi.lookupCustomer(mobile),
    onSuccess: (data) => {
      if (data) {
        setCustomer(data);
        setCustomerForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          mobile: data.mobile,
          address: data.address || '',
        });
      }
    },
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (invoiceData: any) => posApi.createInvoice(invoiceData),
    onSuccess: (data) => {
      // Generate and download PDF
      if (data?.id) {
        window.open(`/api/pos/invoice/${data.id}/pdf`, '_blank');
        navigate('/invoices');
      }
    },
  });

  const handleCustomerLookup = (mobile: string) => {
    lookupCustomerMutation.mutate(mobile);
  };

  const handleCreateCustomer = () => {
    // Validate UAE mobile number (start with 05, 10 digits total)
    const uaeMobileRegex = /^(05)\d{8}$/;
    if (!uaeMobileRegex.test(customerForm.mobile)) {
      alert('Please enter a valid UAE mobile number (05XXXXXXXX)');
      return;
    }

    const newCustomer: Customer = {
      id: 0,
      firstName: customerForm.firstName,
      lastName: customerForm.lastName,
      email: customerForm.email,
      mobile: customerForm.mobile,
      address: customerForm.address,
      createdAt: new Date().toISOString(),
    };
    setCustomer(newCustomer);
  };

  const handleAddProduct = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      const newItem: CartItem = {
        id: 0,
        invoiceId: 0,
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        description: product.description,
        quantity: 1,
        price: product.price,
        warranty: product.warranty,
        warrantyDays: product.warrantyDays,
        createdAt: new Date().toISOString(),
      };
      setCart([...cart, newItem]);
    }
  };

  const handleRemoveProduct = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      handleRemoveProduct(productId);
      return;
    }
    setCart(cart.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const handleNext = () => {
    if (activeStep === 0 && !customer) {
      alert('Please select or create a customer first');
      return;
    }
    if (activeStep === 1 && cart.length === 0) {
      alert('Please add at least one product');
      return;
    }
    setActiveStep(prevStep => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const handleCreateInvoice = () => {
    if (!customer) return;

    const invoiceData = {
      customerId: customer.id,
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        warranty: item.warranty,
        warrantyDays: item.warrantyDays,
      })),
      paymentMethod,
      notes,
    };

    createInvoiceMutation.mutate(invoiceData);
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Customer Information
            </Typography>

            {!customer ? (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  Enter customer UAE mobile number to lookup existing customer or create a new one.
                </Alert>

                <Button
                  variant="outlined"
                  onClick={() => setCustomerLookupOpen(true)}
                  startIcon={<SearchIcon />}
                  sx={{ mb: 3 }}
                >
                  Lookup Customer by Mobile
                </Button>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3, mb: 2 }}>
                  Or create new customer:
                </Typography>

                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="First Name *"
                      value={customerForm.firstName}
                      onChange={(e) => setCustomerForm({ ...customerForm, firstName: e.target.value })}
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={customerForm.lastName}
                      onChange={(e) => setCustomerForm({ ...customerForm, lastName: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="UAE Mobile Number *"
                      placeholder="05XXXXXXXX"
                      value={customerForm.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setCustomerForm({ ...customerForm, mobile: value });
                      }}
                      required
                      helperText="Enter 10-digit UAE mobile number (05XXXXXXXX)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      multiline
                      rows={2}
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    onClick={handleCreateCustomer}
                    disabled={!customerForm.firstName || !customerForm.mobile}
                    startIcon={<PersonIcon />}
                  >
                    Create Customer
                  </Button>
                </Box>
              </>
            ) : (
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6">
                        {customer.firstName} {customer.lastName}
                      </Typography>
                      <Typography color="textSecondary">
                        {/* ✅ FIXED: Added null check */}
                        📱 {customer.mobile ? `+971 ${customer.mobile.substring(1)}` : 'N/A'}
                      </Typography>
                      {customer.email && (
                        <Typography color="textSecondary">
                          ✉️ {customer.email}
                        </Typography>
                      )}
                      {customer.address && (
                        <Typography color="textSecondary">
                          📍 {customer.address}
                        </Typography>
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      onClick={() => setCustomer(null)}
                    >
                      Change Customer
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              <ShoppingCartIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Add Products
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  fullWidth
                  label="Search Products"
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setProductSearchOpen(true)}
                  startIcon={<AddIcon />}
                >
                  Browse Products
                </Button>
              </Grid>
            </Grid>

            {cart.length === 0 ? (
              <Alert severity="info">
                No products added yet. Click "Browse Products" to add items to the cart.
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell>Price (AED)</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Total (AED)</TableCell>
                      <TableCell>Warranty</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="bold">
                              {item.productName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {item.productCode}
                            </Typography>
                            {item.description && (
                              <Typography variant="caption" display="block" color="textSecondary">
                                {item.description}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>AED {item.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                            >
                              -
                            </IconButton>
                            <TextField
                              size="small"
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.productId, parseInt(e.target.value) || 1)}
                              sx={{ width: 60 }}
                              inputProps={{ style: { textAlign: 'center' } }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>AED {(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          {item.warranty ? (
                            <Chip
                              size="small"
                              label={`${item.warrantyDays} days`}
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="caption" color="textSecondary">
                              No warranty
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveProduct(item.productId)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {cart.length > 0 && (
              <InvoiceSummary
                subtotal={subtotal}
                vat={vat}
                total={total}
                itemCount={cart.length}
              />
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Review & Create Invoice
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Customer Details
                  </Typography>
                  {customer && (
                    <Box>
                      <Typography>
                        <strong>Name:</strong> {customer.firstName} {customer.lastName}
                      </Typography>
                      <Typography>
                        {/* ✅ FIXED: Added null check */}
                        <strong>Mobile:</strong> {customer.mobile ? `+971 ${customer.mobile.substring(1)}` : 'N/A'}
                      </Typography>
                      {customer.email && (
                        <Typography>
                          <strong>Email:</strong> {customer.email}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                    Products ({cart.length} items)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Qty</TableCell>
                          <TableCell align="right">Price (AED)</TableCell>
                          <TableCell align="right">Total (AED)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>
                              <Typography variant="body2">{item.productName}</Typography>
                              {item.warranty && (
                                <Typography variant="caption" color="success.main">
                                  Warranty: {item.warrantyDays} days
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">AED {item.price.toFixed(2)}</TableCell>
                            <TableCell align="right">AED {(item.price * item.quantity).toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      select
                      label="Payment Method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    >
                      <MenuItem value="cash">Cash</MenuItem>
                      <MenuItem value="card">Credit/Debit Card</MenuItem>
                      <MenuItem value="apple_pay">Apple Pay</MenuItem>
                      <MenuItem value="google_pay">Google Pay</MenuItem>
                      <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Invoice Notes"
                      multiline
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special instructions or notes..."
                    />
                  </Grid>
                </Grid>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <InvoiceSummary
                  subtotal={subtotal}
                  vat={vat}
                  total={total}
                  itemCount={cart.length}
                  showCreateButton
                  onCreate={handleCreateInvoice}
                  loading={createInvoiceMutation.isPending}
                />
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Create New Invoice
        </Typography>
        <Typography color="textSecondary" paragraph>
          Complete the following steps to create a new invoice for your customer.
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 3 }}>
          {getStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Back
          </Button>

          {activeStep === steps.length - 1 ? (
            <Box>
              <Button
                variant="outlined"
                onClick={handleBack}
                sx={{ mr: 2 }}
              >
                Edit
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={<ArrowForwardIcon />}
              disabled={
                (activeStep === 0 && !customer) ||
                (activeStep === 1 && cart.length === 0)
              }
            >
              {activeStep === steps.length - 2 ? 'Review' : 'Next'}
            </Button>
          )}
        </Box>
      </Paper>

      {/* Dialogs */}
      <CustomerLookupDialog
        open={customerLookupOpen}
        onClose={() => setCustomerLookupOpen(false)}
        onLookup={handleCustomerLookup}
      />

      <ProductSearchDialog
        open={productSearchOpen}
        onClose={() => setProductSearchOpen(false)}
        onAddProduct={handleAddProduct}
      />
    </Container>
  );
};

export default CreateInvoicePage;