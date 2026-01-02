import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Snackbar,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  Print,
  Refresh,
  Receipt,
  Download,
  Email,
  Edit,
  Delete,
  Visibility,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { invoicesApi } from '@/api/invoices.api';
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';
import { InvoiceDto, PaymentStatus, InvoiceStatus, ApiResponse } from '@/types';
import { UAEUtils } from '@/utils/uae.utils';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info',
  });
  
  // Dialog states
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (id) {
      fetchInvoice();
    }
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ApiResponse<InvoiceDto> = await invoicesApi.getInvoice(id!);
      
      if (response.success && response.data) {
        setInvoice(response.data);
      } else {
        setError(response.message || 'Failed to load invoice');
      }
    } catch (err: any) {
      console.error('Error fetching invoice:', err);
      setError(err.message || 'Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    setPrintDialogOpen(true);
  };

  const handlePrintConfirm = async () => {
    try {
      if (!invoice) return;
      
      const blob = await invoicesApi.getInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      setPrintDialogOpen(false);
      showSnackbar('Invoice PDF opened for printing', 'success');
    } catch (err: any) {
      console.error('Error printing invoice:', err);
      showSnackbar('Failed to generate PDF for printing', 'error');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      if (!invoice) return;
      
      const blob = await invoicesApi.getInvoicePdf(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Invoice PDF downloaded successfully', 'success');
    } catch (err: any) {
      console.error('Error downloading PDF:', err);
      showSnackbar('Failed to download PDF', 'error');
    }
  };

  const handleSendEmail = async () => {
    try {
      if (!invoice) return;
      
      // TODO: Implement email sending API
      // For now, just show success message
      showSnackbar(`Invoice sent to ${emailAddress || invoice.customerEmail || 'customer'}`, 'success');
      setEmailDialogOpen(false);
    } catch (err: any) {
      console.error('Error sending email:', err);
      showSnackbar('Failed to send email', 'error');
    }
  };

  const handleDeleteInvoice = async () => {
    try {
      if (!invoice) return;
      
      const response = await invoicesApi.deleteInvoice(invoice.id);
      
      if (response.success) {
        showSnackbar('Invoice deleted successfully', 'success');
        navigate('/invoices');
      } else {
        showSnackbar(response.message || 'Failed to delete invoice', 'error');
      }
    } catch (err: any) {
      console.error('Error deleting invoice:', err);
      showSnackbar('Failed to delete invoice', 'error');
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleUpdateStatus = async (newStatus: InvoiceStatus) => {
    try {
      if (!invoice) return;
      
      const response = await invoicesApi.updateInvoiceStatus(invoice.id, {
        status: newStatus,
        reason: `Status changed from ${invoice.status} to ${newStatus}`,
      });
      
      if (response.success) {
        showSnackbar(`Invoice status updated to ${newStatus}`, 'success');
        fetchInvoice(); // Refresh data
      } else {
        showSnackbar(response.message || 'Failed to update status', 'error');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      showSnackbar('Failed to update invoice status', 'error');
    }
  };

  const handleEdit = () => {
    if (invoice) {
      navigate(`/invoices/edit/${invoice.id}`);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, hh:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const calculateItemTotal = (item: any) => {
    return (item.quantity * item.unitPrice) - item.discountAmount + item.taxAmount;
  };

  const getStatusActions = () => {
    if (!invoice) return [];
    
    switch (invoice.status) {
      case InvoiceStatus.Draft:
        return [
          {
            label: 'Mark as Pending',
            action: () => handleUpdateStatus(InvoiceStatus.Pending),
            color: 'info' as const,
          },
          {
            label: 'Mark as Paid',
            action: () => handleUpdateStatus(InvoiceStatus.Paid),
            color: 'success' as const,
          },
        ];
      case InvoiceStatus.Pending:
        return [
          {
            label: 'Mark as Paid',
            action: () => handleUpdateStatus(InvoiceStatus.Paid),
            color: 'success' as const,
          },
          {
            label: 'Mark as Cancelled',
            action: () => handleUpdateStatus(InvoiceStatus.Cancelled),
            color: 'error' as const,
          },
        ];
      case InvoiceStatus.PartiallyPaid:
        return [
          {
            label: 'Mark as Paid',
            action: () => handleUpdateStatus(InvoiceStatus.Paid),
            color: 'success' as const,
          },
          {
            label: 'Mark as Cancelled',
            action: () => handleUpdateStatus(InvoiceStatus.Cancelled),
            color: 'error' as const,
          },
        ];
      case InvoiceStatus.Paid:
        return [
          {
            label: 'Refund Payment',
            action: () => navigate(`/invoices/refund/${invoice.id}`),
            color: 'warning' as const,
          },
        ];
      default:
        return [];
    }
  };

  const isEditable = invoice && [InvoiceStatus.Draft, InvoiceStatus.Pending].includes(invoice.status as InvoiceStatus);
  const isDeletable = invoice && invoice.status !== InvoiceStatus.Cancelled;

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error || !invoice) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchInvoice}>
              Retry
            </Button>
          }
        >
          {error || 'Invoice not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/invoices')}>
          Back to Invoices
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <IconButton onClick={() => navigate('/invoices')} size="small">
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" component="h1">
              Invoice #{invoice.invoiceNumber}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <InvoiceStatusBadge status={invoice.status} type="invoice" size="medium" />
              <InvoiceStatusBadge status={invoice.paymentStatus} type="payment" size="medium" />
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Date:</strong> {formatDate(invoice.invoiceDate)}
            </Typography>
            {invoice.dueDate && (
              <Typography variant="body2" color="text.secondary">
                <strong>Due Date:</strong> {formatDate(invoice.dueDate)}
              </Typography>
            )}
            {invoice.paymentDate && (
              <Typography variant="body2" color="text.secondary">
                <strong>Payment Date:</strong> {formatDate(invoice.paymentDate)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            startIcon={<Refresh />}
            onClick={fetchInvoice}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
          
          <Button
            startIcon={<Download />}
            onClick={handleDownloadPdf}
            variant="outlined"
            size="small"
          >
            PDF
          </Button>
          
          <Button
            startIcon={<Print />}
            onClick={handlePrint}
            variant="outlined"
            size="small"
          >
            Print
          </Button>
          
          <Button
            startIcon={<Email />}
            onClick={() => {
              setEmailAddress(invoice.customerEmail || '');
              setEmailDialogOpen(true);
            }}
            variant="outlined"
            size="small"
          >
            Email
          </Button>
          
          {isEditable && (
            <Button
              startIcon={<Edit />}
              onClick={handleEdit}
              variant="contained"
              size="small"
              color="primary"
            >
              Edit
            </Button>
          )}
          
          {isDeletable && (
            <Button
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              variant="outlined"
              size="small"
              color="error"
            >
              Delete
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Left Column - Invoice Details */}
        <Grid item xs={12} md={8}>
          {/* Customer Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <strong>Customer Information</strong>
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1">{invoice.customerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Mobile</Typography>
                <Typography variant="body1">
                  {UAEUtils.formatMobileForDisplay(invoice.customerMobile)}
                </Typography>
              </Grid>
              {invoice.customerEmail && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{invoice.customerEmail}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Items Table */}
          <Paper sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
            <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6">
                <strong>Invoice Items</strong>
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell><strong>Product</strong></TableCell>
                    <TableCell align="right"><strong>Price</strong></TableCell>
                    <TableCell align="right"><strong>Qty</strong></TableCell>
                    <TableCell align="right"><strong>Discount</strong></TableCell>
                    <TableCell align="right"><strong>Tax</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoice.items.map((item, index) => (
                    <TableRow key={item.id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            SKU: {item.productSKU}
                          </Typography>
                          {item.warranty && (
                            <Typography variant="caption" color="success.main" display="block">
                              Warranty: {item.warranty}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        {UAEUtils.formatCurrency(item.unitPrice)}
                      </TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        -{UAEUtils.formatCurrency(item.discountAmount)}
                      </TableCell>
                      <TableCell align="right">
                        {UAEUtils.formatCurrency(item.taxAmount)}
                      </TableCell>
                      <TableCell align="right" fontWeight="bold">
                        {UAEUtils.formatCurrency(calculateItemTotal(item))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Notes Section */}
          {invoice.notes && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <strong>Notes</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {invoice.notes}
              </Typography>
            </Paper>
          )}
        </Grid>

        {/* Right Column - Summary & Actions */}
        <Grid item xs={12} md={4}>
          {/* Invoice Summary */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <strong>Invoice Summary</strong>
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                <Typography variant="body2">{UAEUtils.formatCurrency(invoice.subTotal)}</Typography>
              </Box>
              
              {invoice.discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Discount</Typography>
                  <Typography variant="body2" color="error.main">
                    -{UAEUtils.formatCurrency(invoice.discountAmount)}
                  </Typography>
                </Box>
              )}
              
              {invoice.taxAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Tax ({invoice.taxAmount / invoice.subTotal * 100}%)</Typography>
                  <Typography variant="body2">{UAEUtils.formatCurrency(invoice.taxAmount)}</Typography>
                </Box>
              )}
              
              {invoice.shippingCharges > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  <Typography variant="body2">{UAEUtils.formatCurrency(invoice.shippingCharges)}</Typography>
                </Box>
              )}
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body1" fontWeight="bold">Total Amount</Typography>
                <Typography variant="h6" fontWeight="bold" color="primary.main">
                  {UAEUtils.formatCurrency(invoice.totalAmount)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
                <Typography variant="body2" color="success.main">
                  {UAEUtils.formatCurrency(invoice.amountPaid)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Amount Due</Typography>
                <Typography variant="body2" fontWeight="medium" color={invoice.amountDue > 0 ? 'error.main' : 'success.main'}>
                  {UAEUtils.formatCurrency(invoice.amountDue)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Payment Information */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <strong>Payment Information</strong>
            </Typography>
            <Grid container spacing={1}>
              {invoice.paymentMethod && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body2">{invoice.paymentMethod}</Typography>
                </Grid>
              )}
              {invoice.paymentReference && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Reference Number</Typography>
                  <Typography variant="body2" fontFamily="monospace">
                    {invoice.paymentReference}
                  </Typography>
                </Grid>
              )}
              {invoice.paymentDate && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Payment Date</Typography>
                  <Typography variant="body2">{formatDate(invoice.paymentDate)}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          {/* Status Actions */}
          {getStatusActions().length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <strong>Status Actions</strong>
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {getStatusActions().map((action, index) => (
                  <Button
                    key={index}
                    variant="contained"
                    color={action.color}
                    onClick={action.action}
                    size="small"
                    fullWidth
                  >
                    {action.label}
                  </Button>
                ))}
              </Box>
            </Paper>
          )}

          {/* Invoice Metadata */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              <strong>Invoice Details</strong>
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Invoice ID</Typography>
                <Typography variant="body2" fontFamily="monospace">{invoice.id}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Created At</Typography>
                <Typography variant="body2">{formatDate(invoice.createdAt)}</Typography>
              </Grid>
              {invoice.updatedAt && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                  <Typography variant="body2">{formatDate(invoice.updatedAt)}</Typography>
                </Grid>
              )}
              {invoice.updatedBy && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Updated By</Typography>
                  <Typography variant="body2">{invoice.updatedBy}</Typography>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Print Dialog */}
      <Dialog open={printDialogOpen} onClose={() => setPrintDialogOpen(false)}>
        <DialogTitle>Print Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Print invoice #{invoice.invoiceNumber}?
          </Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            A PDF will be generated and opened in a new window for printing.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPrintDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePrintConfirm} variant="contained" color="primary">
            Print
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Email Invoice</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Send invoice #{invoice.invoiceNumber} to customer email
          </Typography>
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            margin="normal"
            placeholder="customer@example.com"
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            The invoice PDF will be attached to the email.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSendEmail} variant="contained" color="primary">
            Send Email
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete invoice #{invoice.invoiceNumber}?
            This action cannot be undone.
          </Alert>
          <TextField
            fullWidth
            label="Reason for deletion (optional)"
            multiline
            rows={2}
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteInvoice} variant="contained" color="error">
            Delete Invoice
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InvoiceDetailPage;