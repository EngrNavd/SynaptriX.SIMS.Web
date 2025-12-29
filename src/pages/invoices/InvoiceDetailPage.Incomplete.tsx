import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import InvoiceStatusBadge from '@/components/invoices/InvoiceStatusBadge';
import { UAEUtils } from '@/utils/uae.utils';
import { format } from 'date-fns';

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: invoiceResponse, isLoading, error } = useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoicesApi.getInvoice(id!),
    enabled: !!id,
  });

  const invoice = invoiceResponse?.success ? invoiceResponse.data : null;

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  if (error || !invoice) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error?.message || 'Invoice not found'}
          <Button onClick={() => navigate('/invoices')} sx={{ ml: 2 }} size="small">
            Back to Invoices
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/invoices')}
            sx={{ mb: 2 }}
          >
            Back to Invoices
          </Button>
          <Typography variant="h4" fontWeight="bold" color="primary.main">
            Invoice #{invoice.invoiceNumber}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Created on {format(new Date(invoice.invoiceDate), 'MMMM dd, yyyy')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button startIcon={<PrintIcon />} variant="outlined">
            Print
          </Button>
          <Button startIcon={<DownloadIcon />} variant="outlined">
            Download PDF
          </Button>
          <Button startIcon={<EditIcon />} variant="contained">
            Edit
          </Button>
        </Box>
      </Box>

      {/* Status Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Invoice Status
              </Typography>
              <InvoiceStatusBadge status={invoice.status} type="invoice" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Payment Status
              </Typography>
              <InvoiceStatusBadge status={invoice.paymentStatus} type="payment" />
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Amount
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {UAEUtils.formatCurrency(invoice.totalAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Amount Due
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold"
                color={invoice.amountDue > 0 ? 'error.main' : 'success.main'}
              >
                {UAEUtils.formatCurrency(invoice.amountDue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Invoice Details */}
      <Grid container spacing={4}>
        {/* Left Column - Customer & Invoice Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Invoice Details
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            {/* Customer Information */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Customer Information
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1" fontWeight="medium">{invoice.customerName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Mobile</Typography>
                  <Typography variant="body1">{UAEUtils.formatPhoneForDisplay(invoice.customerMobile)}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">{invoice.customerEmail || 'Not provided'}</Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Items Table */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Items ({invoice.items.length})
              </Typography>
              <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#F8FAFC' }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>Product</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>Qty</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>Price</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #E2E8F0' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={item.id} style={{ borderBottom: index < invoice.items.length - 1 ? '1px solid #E2E8F0' : 'none' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <Typography variant="body2" fontWeight="medium">{item.productName}</Typography>
                            <Typography variant="caption" color="text.secondary">{item.productSKU}</Typography>
                          </td>