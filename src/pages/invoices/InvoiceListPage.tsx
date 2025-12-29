import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Breadcrumbs,
  Link,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  FileDownload as ExportIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Paid as PaidIcon,
  Pending as PendingIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { invoicesApi } from '@/api/invoices.api';
import InvoiceTable from '@/components/invoices/InvoiceTable';
import InvoiceFilters from '@/components/invoices/InvoiceFilters';
import InvoiceSummaryCard from '@/components/invoices/InvoiceSummaryCard';
import { UAEUtils } from '@/utils/uae.utils';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { 
  InvoiceDto, 
  InvoiceStatisticsDto,
  ExportInvoicesRequestDto 
} from '@/types';

export default function InvoiceListPage() {
  const navigate = useNavigate();
  
  // State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    fromDate: null as Date | null,
    toDate: null as Date | null,
  });
  const [sortModel, setSortModel] = useState<{ field: string; sort: 'asc' | 'desc' }>({
    field: 'invoiceDate',
    sort: 'desc',
  });
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch invoices
  const { 
    data: invoicesResponse, 
    isLoading: invoicesLoading, 
    error: invoicesError,
    refetch: refetchInvoices 
  } = useQuery({
    queryKey: ['invoices', page, pageSize, debouncedSearch, filters, sortModel],
    queryFn: () => invoicesApi.getInvoices({
      page: page + 1,
      pageSize,
      search: debouncedSearch || undefined,
      sortBy: sortModel.field,
      sortDescending: sortModel.sort === 'desc',
    }),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch statistics
  const { 
    data: statsResponse, 
    isLoading: statsLoading,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['invoice-statistics', filters.fromDate, filters.toDate],
    queryFn: () => invoicesApi.getStatistics(filters.fromDate || undefined, filters.toDate || undefined),
    staleTime: 2 * 60 * 1000,
  });

  // Export mutation
  const exportMutation = useMutation({
    mutationFn: (params: ExportInvoicesRequestDto) => invoicesApi.exportInvoices(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoices_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Export completed successfully');
      setExportDialogOpen(false);
      setExportLoading(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Export failed');
      setExportLoading(false);
    },
  });

  const invoices = invoicesResponse?.success && Array.isArray(invoicesResponse.data) 
    ? invoicesResponse.data 
    : [];
  
  const totalCount = invoicesResponse?.data?.length || 0;
  const stats = statsResponse?.success ? statsResponse.data : {} as InvoiceStatisticsDto;

  // Calculate additional stats
  const calculateAdditionalStats = () => {
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const averageInvoice = invoices.length > 0 ? totalAmount / invoices.length : 0;
    const paidAmount = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const dueAmount = invoices.reduce((sum, inv) => sum + inv.amountDue, 0);
    
    return {
      totalAmount,
      averageInvoice,
      paidAmount,
      dueAmount,
      paidPercentage: totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0,
    };
  };

  const additionalStats = calculateAdditionalStats();

  // Handlers
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      paymentStatus: '',
      fromDate: null,
      toDate: null,
    });
    setSearch('');
    setPage(0);
  };

  const handleRefresh = () => {
    refetchInvoices();
    refetchStats();
  };

  const handleCreateInvoice = () => {
    navigate('/invoices/create');
  };

  const handleRowClick = (invoiceId: string) => {
    navigate(`/invoices/${invoiceId}`);
  };

  const handleExport = () => {
    setExportDialogOpen(true);
  };

  const handleConfirmExport = () => {
    setExportLoading(true);
    exportMutation.mutate({
      search: debouncedSearch || undefined,
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    });
  };

  const handleSortChange = (model: any) => {
    if (model.length > 0) {
      setSortModel({
        field: model[0].field,
        sort: model[0].sort,
      });
    }
  };

  // Check if filters are active
  const isFilterActive = 
    filters.status || 
    filters.paymentStatus || 
    filters.fromDate || 
    filters.toDate;

  if (invoicesError) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Error loading invoices: {invoicesError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link color="inherit" href="/" underline="hover">
          Dashboard
        </Link>
        <Typography color="text.primary">Invoices</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary.main" gutterBottom>
            Invoice Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track all your customer invoices
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ExportIcon />}
            onClick={handleExport}
            disabled={invoices.length === 0 || exportLoading}
          >
            {exportLoading ? 'Exporting...' : 'Export'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateInvoice}
            disabled={invoicesLoading}
            sx={{
              background: 'linear-gradient(135deg, #0A2463 0%, #1E3A8A 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #07163E 0%, #0A2463 100%)',
              },
            }}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      {/* Loading Overlay */}
      {invoicesLoading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InvoiceSummaryCard
            title="Total Invoices"
            value={stats.totalInvoices || 0}
            icon={<ReceiptIcon />}
            color="primary"
            tooltip="Total number of invoices"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InvoiceSummaryCard
            title="Total Amount"
            value={stats.totalAmount || 0}
            icon={<TrendingUpIcon />}
            color="success"
            isCurrency
            tooltip="Total invoice amount"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InvoiceSummaryCard
            title="Paid Invoices"
            value={stats.paidInvoices || 0}
            icon={<PaidIcon />}
            color="success"
            subtitle={`${stats.paidInvoices ? ((stats.paidInvoices / stats.totalInvoices) * 100).toFixed(1) : 0}% of total`}
            tooltip="Fully paid invoices"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InvoiceSummaryCard
            title="Pending Invoices"
            value={stats.pendingInvoices || 0}
            icon={<PendingIcon />}
            color="warning"
            subtitle={`${UAEUtils.formatCurrency(additionalStats.dueAmount)} due`}
            tooltip="Invoices pending payment"
          />
        </Grid>
      </Grid>

      {/* Payment Status Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <InvoiceSummaryCard
            title="Unpaid"
            value={stats.unpaidInvoices || 0}
            color="error"
            progress={stats.totalInvoices ? ((stats.unpaidInvoices || 0) / stats.totalInvoices) * 100 : 0}
            tooltip="Invoices with no payment"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <InvoiceSummaryCard
            title="Partially Paid"
            value={stats.partiallyPaidPaymentInvoices || 0}
            color="warning"
            progress={stats.totalInvoices ? ((stats.partiallyPaidPaymentInvoices || 0) / stats.totalInvoices) * 100 : 0}
            tooltip="Invoices with partial payment"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <InvoiceSummaryCard
            title="Paid"
            value={stats.paidPaymentInvoices || 0}
            color="success"
            progress={stats.totalInvoices ? ((stats.paidPaymentInvoices || 0) / stats.totalInvoices) * 100 : 0}
            tooltip="Fully paid invoices"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <InvoiceSummaryCard
            title="Overdue"
            value={stats.overduePaymentInvoices || 0}
            color="error"
            icon={<WarningIcon />}
            tooltip="Invoices past due date"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <InvoiceSummaryCard
            title="Avg. Invoice"
            value={additionalStats.averageInvoice}
            color="info"
            isCurrency
            tooltip="Average invoice amount"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <InvoiceFilters
        filters={{ ...filters, search }}
        onFilterChange={(newFilters) => {
          if (newFilters.search !== undefined) {
            setSearch(newFilters.search);
          }
          handleFilterChange(newFilters);
        }}
        onClear={handleClearFilters}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Invoice Table */}
      <Box sx={{ mb: 4 }}>
        <InvoiceTable
          invoices={invoices}
          isLoading={invoicesLoading}
          error={invoicesError}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={(model) => {
            setPage(model.page);
            setPageSize(model.pageSize);
          }}
          totalCount={totalCount}
          onRefresh={handleRefresh}
          onRowClick={handleRowClick}
          sortModel={sortModel}
          onSortModelChange={handleSortChange}
        />
      </Box>

      {/* Quick Actions */}
      {invoices.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ReceiptIcon />}
              onClick={() => navigate('/invoices/create')}
            >
              Create New Invoice
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExportIcon />}
              onClick={handleExport}
              disabled={exportLoading}
            >
              Export All Invoices
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={invoicesLoading}
            >
              Refresh Data
            </Button>
          </Box>
        </Paper>
      )}

      {/* Export Dialog */}
      <Dialog 
        open={exportDialogOpen} 
        onClose={() => !exportLoading && setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Export Invoices</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Exporting {totalCount} invoices with current filters applied.
            {isFilterActive && ' Filters will be applied to the export.'}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            The export will include:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mt: 1, color: 'text.secondary' }}>
            <li>Invoice number and date</li>
            <li>Customer information</li>
            <li>Amounts and payment status</li>
            <li>Invoice and payment status</li>
            <li>Payment method and reference</li>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setExportDialogOpen(false)}
            disabled={exportLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmExport} 
            variant="contained"
            disabled={exportLoading}
            startIcon={<ExportIcon />}
          >
            {exportLoading ? 'Exporting...' : 'Export to CSV'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}