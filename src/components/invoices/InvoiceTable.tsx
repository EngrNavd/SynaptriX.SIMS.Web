import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import { useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import InvoiceActionsMenu from './InvoiceActionsMenu';
import { UAEUtils } from '@/utils/uae.utils';
import { InvoiceDto, InvoiceStatus, PaymentStatus } from '@/types';
import { format } from 'date-fns';

interface InvoiceTableProps {
  invoices: InvoiceDto[];
  isLoading: boolean;
  error: any;
  paginationModel: { page: number; pageSize: number };
  onPaginationModelChange: (model: any) => void;
  totalCount: number;
  onRefresh: () => void;
  onRowClick: (invoiceId: string) => void;
  sortModel?: { field: string; sort: 'asc' | 'desc' };
  onSortModelChange?: (model: any) => void;
}

const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  isLoading,
  error,
  paginationModel,
  onPaginationModelChange,
  totalCount,
  onRefresh,
  onRowClick,
  sortModel,
  onSortModelChange,
}) => {
  const queryClient = useQueryClient();

  // Handle PDF download
  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    try {
      const blob = await invoicesApi.getInvoicePdf(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download PDF:', error);
    }
  };

  // Columns configuration
  const columns: GridColDef<InvoiceDto>[] = [
    {
      field: 'invoiceNumber',
      headerName: 'Invoice #',
      width: 130,
      renderCell: (params) => (
        <Box onClick={() => onRowClick(params.row.id)} sx={{ cursor: 'pointer' }}>
          <Typography variant="body2" fontWeight="bold" color="primary.main">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {format(new Date(params.row.invoiceDate), 'dd MMM yyyy')}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'customerName',
      headerName: 'Customer',
      width: 200,
      renderCell: (params) => (
        <Box onClick={() => onRowClick(params.row.id)} sx={{ cursor: 'pointer' }}>
          <Typography variant="body2" fontWeight="medium">
            {params.value}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {params.row.customerMobile && UAEUtils.formatPhoneForDisplay(params.row.customerMobile)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'totalAmount',
      headerName: 'Amount',
      width: 140,
      type: 'number',
      renderCell: (params) => (
        <Box onClick={() => onRowClick(params.row.id)} sx={{ cursor: 'pointer' }}>
          <Typography variant="body2" fontWeight="bold">
            {UAEUtils.formatCurrency(params.value)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Due: {UAEUtils.formatCurrency(params.row.amountDue)}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (params) => (
        <InvoiceStatusBadge
          status={params.value as InvoiceStatus}
          type="invoice"
          size="small"
        />
      ),
    },
    {
      field: 'paymentStatus',
      headerName: 'Payment',
      width: 140,
      renderCell: (params) => (
        <InvoiceStatusBadge
          status={params.value as PaymentStatus}
          type="payment"
          size="small"
        />
      ),
    },
    {
      field: 'paymentMethod',
      headerName: 'Method',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" color="text.secondary">
          {params.value || '—'}
        </Typography>
      ),
    },
    {
      field: 'dueDate',
      headerName: 'Due Date',
      width: 120,
      valueGetter: (_, row) => row.dueDate ? format(new Date(row.dueDate), 'dd MMM') : '—',
      renderCell: (params) => (
        <Typography variant="body2">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: '',
      width: 80,
      getActions: (params) => [
        <InvoiceActionsMenu
          invoiceId={params.row.id}
          invoiceNumber={params.row.invoiceNumber}
          currentStatus={params.row.status as InvoiceStatus}
          onActionComplete={onRefresh}
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 2, borderRadius: 2 }}
        action={
          <Button color="inherit" size="small" onClick={onRefresh}>
            Retry
          </Button>
        }
      >
        Error loading invoices: {error.message}
      </Alert>
    );
  }

  return (
    <Paper sx={{ borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
      {/* Loading Overlay */}
      {isLoading && (
        <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />
      )}

      {/* Table Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: 1,
        borderColor: 'divider',
        backgroundColor: 'background.default'
      }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Invoices ({totalCount})
        </Typography>
		<Tooltip title="Refresh">
		  <span>
			<IconButton onClick={onRefresh} size="small" disabled={isLoading}>
			  <RefreshIcon />
			</IconButton>
		  </span>
		</Tooltip>
      </Box>

      {/* DataGrid */}
      <DataGrid
        rows={invoices}
        columns={columns}
        loading={isLoading}
        paginationMode="server"
        rowCount={totalCount}
        pageSizeOptions={[10, 25, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortingMode="server"
        sortModel={sortModel ? [{ field: sortModel.field, sort: sortModel.sort }] : []}
        onSortModelChange={onSortModelChange}
        disableRowSelectionOnClick
        getRowId={(row) => row.id}
        onRowClick={(params) => onRowClick(params.row.id)}
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#F8FAFC',
            borderBottom: '2px solid',
            borderColor: 'divider',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #E2E8F0',
            cursor: 'pointer',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(10, 36, 99, 0.02)',
          },
          '& .MuiDataGrid-virtualScroller': {
            minHeight: 400,
          },
        }}
        slots={{
          toolbar: GridToolbar,
          noRowsOverlay: () => (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              p: 4 
            }}>
              <Box sx={{ 
                width: 80, 
                height: 80, 
                borderRadius: '50%', 
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography variant="h4" color="grey.400">
                  🧾
                </Typography>
              </Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No invoices found
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {invoices.length === 0 
                  ? 'Create your first invoice to get started'
                  : 'Try adjusting your search or filters'}
              </Typography>
            </Box>
          ),
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: false,
            printOptions: { disableToolbarButton: true },
            csvOptions: { disableToolbarButton: true },
          },
        }}
      />
    </Paper>
  );
};

export default InvoiceTable;