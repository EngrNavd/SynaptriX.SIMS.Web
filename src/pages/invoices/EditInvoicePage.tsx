// frontend/pages/invoices/EditInvoicePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  Home as HomeIcon,
  Receipt as ReceiptIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  ArrowBack as BackIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import { UAEUtils } from '@/utils/uae.utils';
import InvoiceForm from '@/components/invoices/InvoiceForm';
import type { UpdateInvoiceDto, InvoiceDto, CustomerDto } from '@/types';

const EditInvoicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<Partial<UpdateInvoiceDto>>({});
  const [originalInvoice, setOriginalInvoice] = useState<InvoiceDto | null>(null);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [changes, setChanges] = useState<string[]>([]);

  // Fetch invoice data
  const { 
    data: invoiceResponse, 
    isLoading: isLoadingInvoice, 
    error: invoiceError,
    refetch: refetchInvoice 
  } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getInvoice(id!),
    enabled: !!id,
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: (data: UpdateInvoiceDto) => 
      invoicesApi.updateInvoice(id!, data),
    onSuccess: (response) => {
      if (response.success) {
        setSaveDialogOpen(false);
        navigate(`/invoices/${id}`, {
          state: { 
            success: true, 
            message: 'Invoice updated successfully!' 
          }
        });
      }
    },
    onError: (error: any) => {
      console.error('Failed to update invoice:', error);
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: () => invoicesApi.deleteInvoice(id!),
    onSuccess: (response) => {
      if (response.success) {
        setDeleteDialogOpen(false);
        navigate('/invoices', {
          state: { 
            success: true, 
            message: 'Invoice deleted successfully!' 
          }
        });
      }
    },
    onError: (error: any) => {
      console.error('Failed to delete invoice:', error);
    },
  });

  // Load invoice data when fetched
  useEffect(() => {
    if (invoiceResponse?.success && invoiceResponse.data) {
      const invoice = invoiceResponse.data;
      setOriginalInvoice(invoice);
      
      // Convert invoice to form data
      setFormData({
        items: invoice.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
        })),
        shippingCharges: invoice.shippingCharges,
        dueDate: invoice.dueDate ? new Date(invoice.dueDate) : undefined,
        notes: invoice.notes,
      });

      // Set customer data
      if (invoice.customerId) {
        setCustomer({
          id: invoice.customerId,
          fullName: invoice.customerName,
          mobile: invoice.customerMobile,
          email: invoice.customerEmail || '',
          // Add other customer fields as needed
        } as CustomerDto);
      }
    }
  }, [invoiceResponse]);

  // Handle form data change
  const handleFormChange = (field: keyof UpdateInvoiceDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Track changes for audit trail
    if (originalInvoice) {
      const changeDescription = getChangeDescription(field, value, originalInvoice);
      if (changeDescription) {
        setChanges(prev => [...prev.filter(c => !c.startsWith(field)), changeDescription]);
      }
    }
  };

  // Get change description for audit trail
  const getChangeDescription = (field: string, newValue: any, original: InvoiceDto): string => {
    const oldValue = (original as any)[field];
    
    if (field === 'items') {
      return 'Items modified';
    }
    
    if (field === 'shippingCharges') {
      return `Shipping changed from ${UAEUtils.formatCurrency(oldValue || 0)} to ${UAEUtils.formatCurrency(newValue || 0)}`;
    }
    
    if (field === 'dueDate') {
      const oldDate = oldValue ? new Date(oldValue).toLocaleDateString() : 'Not set';
      const newDate = newValue ? new Date(newValue).toLocaleDateString() : 'Not set';
      return `Due date changed from ${oldDate} to ${newDate}`;
    }
    
    if (field === 'notes') {
      return 'Notes updated';
    }
    
    return `${field} updated`;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;
    
    // Show save dialog with changes summary
    if (changes.length > 0) {
      setSaveDialogOpen(true);
    } else {
      // No changes, just go back
      navigate(`/invoices/${id}`);
    }
  };

  // Confirm save with changes
  const handleConfirmSave = () => {
    const updateData: UpdateInvoiceDto = {
      ...formData,
      items: formData.items?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent,
      })),
    };
    
    updateInvoiceMutation.mutate(updateData);
  };

  // Validate form
  const validateForm = (): boolean => {
    if (!formData.items || formData.items.length === 0) {
      alert('Invoice must have at least one item');
      return false;
    }
    
    const invalidItems = formData.items.filter(item => !item.quantity || item.quantity <= 0);
    if (invalidItems.length > 0) {
      alert('All items must have quantity greater than 0');
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

    const taxRate = 0; // VAT 0%
    const taxAmount = (subtotal * taxRate) / 100;
    const shipping = formData.shippingCharges || 0;
    const total = subtotal + taxAmount + shipping;

    return { subtotal, taxAmount, shipping, total };
  };

  const totals = calculateTotals();

  if (isLoadingInvoice) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
          Loading invoice...
        </Typography>
      </Box>
    );
  }

  if (invoiceError || !originalInvoice) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => refetchInvoice()}>
              Retry
            </Button>
          }
        >
          Error loading invoice: {invoiceError?.message || 'Invoice not found'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/invoices')}
        >
          Back to Invoices
        </Button>
      </Box>
    );
  }

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
          <Link
            underline="hover"
            color="inherit"
            href={`/invoices/${id}`}
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            {originalInvoice.invoiceNumber}
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Edit Invoice
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Page Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Edit Invoice: {originalInvoice.invoiceNumber}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customer: {originalInvoice.customerName} | 
            Status: <strong style={{ color: originalInvoice.status === 'Paid' ? 'green' : 'orange' }}>
              {originalInvoice.status}
            </strong> | 
            Created: {new Date(originalInvoice.createdAt).toLocaleDateString()}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => setAuditDialogOpen(true)}
            disabled={changes.length === 0}
          >
            Changes ({changes.length})
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={() => navigate(`/invoices/${id}/print`)}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Original Invoice Info */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'info.light', border: '1px solid', borderColor: 'info.main' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom color="info.dark">
          Original Invoice Information
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Original Total</Typography>
            <Typography variant="h6">{UAEUtils.formatCurrency(originalInvoice.totalAmount)}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Amount Paid</Typography>
            <Typography variant="h6" color={originalInvoice.amountPaid > 0 ? 'success.main' : 'text.primary'}>
              {UAEUtils.formatCurrency(originalInvoice.amountPaid)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Amount Due</Typography>
            <Typography variant="h6" color={originalInvoice.amountDue > 0 ? 'error.main' : 'success.main'}>
              {UAEUtils.formatCurrency(originalInvoice.amountDue)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Payment Status</Typography>
            <Typography variant="h6">
              {originalInvoice.paymentStatus}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main Form */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <InvoiceForm
          mode="edit"
          formData={formData}
          onFormChange={handleFormChange}
          onCustomerSelected={() => {}} // Customer cannot be changed in edit mode
          initialCustomer={customer}
        />
      </Paper>

      {/* Updated Summary */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: 'primary.light', border: '1px solid', borderColor: 'primary.main' }}>
        <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.dark">
          Updated Invoice Summary
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 3 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Subtotal</Typography>
            <Typography variant="h6" fontWeight="bold">{UAEUtils.formatCurrency(totals.subtotal)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Original: {UAEUtils.formatCurrency(originalInvoice.subTotal)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">VAT (0%)</Typography>
            <Typography variant="h6" fontWeight="bold">{UAEUtils.formatCurrency(totals.taxAmount)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Original: {UAEUtils.formatCurrency(originalInvoice.taxAmount)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Shipping</Typography>
            <Typography variant="h6" fontWeight="bold">{UAEUtils.formatCurrency(totals.shipping)}</Typography>
            <Typography variant="caption" color="text.secondary">
              Original: {UAEUtils.formatCurrency(originalInvoice.shippingCharges)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Total Amount</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main">
              {UAEUtils.formatCurrency(totals.total)}
            </Typography>
            <Typography variant="caption" color={totals.total !== originalInvoice.totalAmount ? 'warning.main' : 'text.secondary'}>
              Original: {UAEUtils.formatCurrency(originalInvoice.totalAmount)}
              {totals.total !== originalInvoice.totalAmount && ` (${totals.total > originalInvoice.totalAmount ? '+' : ''}${UAEUtils.formatCurrency(totals.total - originalInvoice.totalAmount)})`}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={() => navigate(`/invoices/${id}`)}
            disabled={updateInvoiceMutation.isPending}
          >
            Back to View
          </Button>
          
          {originalInvoice.status === 'Draft' && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleteInvoiceMutation.isPending || updateInvoiceMutation.isPending}
            >
              Delete Draft
            </Button>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/invoices')}
            disabled={updateInvoiceMutation.isPending}
          >
            Cancel
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={updateInvoiceMutation.isPending || changes.length === 0}
            startIcon={
              updateInvoiceMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{ minWidth: 150 }}
          >
            {updateInvoiceMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </Box>

      {/* Save Changes Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Save Invoice Changes</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You are about to update invoice <strong>{originalInvoice.invoiceNumber}</strong>.
            {originalInvoice.status !== 'Draft' && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Note:</strong> Editing a non-draft invoice will create an audit trail entry.
              </Typography>
            )}
          </Alert>
          
          <Typography variant="subtitle2" gutterBottom>Changes Summary:</Typography>
          <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
            {changes.map((change, index) => (
              <Typography key={index} variant="body2" sx={{ py: 0.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                • {change}
              </Typography>
            ))}
          </Box>
          
          <Typography variant="subtitle2" gutterBottom>Financial Impact:</Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2">
              Original Total: {UAEUtils.formatCurrency(originalInvoice.totalAmount)}
            </Typography>
            <Typography variant="body2">
              Updated Total: {UAEUtils.formatCurrency(totals.total)}
            </Typography>
            <Typography variant="body2" color={totals.total !== originalInvoice.totalAmount ? 'warning.main' : 'text.primary'}>
              Difference: {UAEUtils.formatCurrency(totals.total - originalInvoice.totalAmount)}
              {totals.total !== originalInvoice.totalAmount && (
                <span style={{ color: totals.total > originalInvoice.totalAmount ? 'green' : 'red' }}>
                  ({totals.total > originalInvoice.totalAmount ? 'Increase' : 'Decrease'})
                </span>
              )}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={updateInvoiceMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSave} 
            variant="contained" 
            disabled={updateInvoiceMutation.isPending}
            startIcon={updateInvoiceMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {updateInvoiceMutation.isPending ? 'Saving...' : 'Confirm Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete invoice <strong>{originalInvoice.invoiceNumber}</strong>?
            <br />
            <br />
            This action cannot be undone. The invoice will be permanently removed from the system.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteInvoiceMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={() => deleteInvoiceMutation.mutate()} 
            variant="contained" 
            color="error"
            disabled={deleteInvoiceMutation.isPending}
            startIcon={deleteInvoiceMutation.isPending ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {deleteInvoiceMutation.isPending ? 'Deleting...' : 'Delete Invoice'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={auditDialogOpen} onClose={() => setAuditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            Changes Audit Trail
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            The following changes will be recorded in the audit trail when you save:
          </Typography>
          
          {changes.length === 0 ? (
            <Alert severity="info">
              No changes detected. The invoice will remain unchanged.
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              {changes.map((change, index) => (
                <Paper
                  key={index}
                  elevation={0}
                  sx={{
                    p: 2,
                    mb: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="caption" fontWeight="bold">{index + 1}</Typography>
                  </Box>
                  <Typography variant="body2">{change}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                    {new Date().toLocaleTimeString()}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAuditDialogOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Alert */}
      {updateInvoiceMutation.isError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to update invoice: {updateInvoiceMutation.error?.message || 'Unknown error'}
        </Alert>
      )}
    </Box>
  );
};

export default EditInvoicePage;
