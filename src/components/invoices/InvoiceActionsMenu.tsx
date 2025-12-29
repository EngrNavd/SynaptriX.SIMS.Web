import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Paid as PaidIcon,
  Cancel as CancelIcon,
  FileDownload as ExportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '@/api/invoices.api';
import toast from 'react-hot-toast';
import { InvoiceStatus } from '@/types';

interface InvoiceActionsMenuProps {
  invoiceId: string;
  invoiceNumber: string;
  currentStatus: InvoiceStatus;
  onActionComplete?: () => void;
}

const InvoiceActionsMenu: React.FC<InvoiceActionsMenuProps> = ({
  invoiceId,
  invoiceNumber,
  currentStatus,
  onActionComplete,
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [reason, setReason] = useState('');
  
  const open = Boolean(anchorEl);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { status: string; reason?: string }) =>
      invoicesApi.updateInvoiceStatus(invoiceId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['invoice-statistics'] });
        toast.success(`Invoice status updated to ${newStatus}`);
        setStatusDialogOpen(false);
        setNewStatus('');
        setReason('');
        onActionComplete?.();
      } else {
        toast.error(response.message || 'Failed to update status');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update status');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => invoicesApi.deleteInvoice(invoiceId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        queryClient.invalidateQueries({ queryKey: ['invoice-statistics'] });
        toast.success('Invoice deleted successfully');
        setDeleteDialogOpen(false);
        onActionComplete?.();
      } else {
        toast.error(response.message || 'Failed to delete invoice');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete invoice');
    },
  });

  // Download PDF mutation
  const downloadPdfMutation = useMutation({
    mutationFn: () => invoicesApi.getInvoicePdf(invoiceId),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('PDF downloaded successfully');
    },
    onError: (error: any) => {
      toast.error('Failed to download PDF');
    },
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    navigate(`/invoices/${invoiceId}`);
    handleMenuClose();
  };

  const handleEdit = () => {
    navigate(`/invoices/${invoiceId}/edit`);
    handleMenuClose();
  };

  const handlePrint = () => {
    downloadPdfMutation.mutate();
    handleMenuClose();
  };

  const handleDownload = () => {
    downloadPdfMutation.mutate();
    handleMenuClose();
  };

  const handleStatusChange = () => {
    setStatusDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmStatusChange = () => {
    if (newStatus) {
      updateStatusMutation.mutate({ status: newStatus, reason });
    }
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate();
  };

  const getStatusOptions = () => {
    const allStatuses = Object.values(InvoiceStatus);
    return allStatuses.filter(status => status !== currentStatus);
  };

  return (
    <>
      <IconButton
        aria-label="invoice-actions"
        onClick={handleMenuOpen}
        size="small"
      >
        <MoreIcon />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleView}>
          <ListItemIcon>
            <ViewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Invoice</ListItemText>
        </MenuItem>

        <MenuItem onClick={handlePrint}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Print Invoice</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDownload}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download PDF</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleStatusChange}>
          <ListItemIcon>
            <PaidIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Change Status</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Status Change Dialog */}
      <Dialog 
        open={statusDialogOpen} 
        onClose={() => !updateStatusMutation.isPending && setStatusDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Invoice Status</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Current Status: <strong>{currentStatus}</strong>
          </Alert>
          
          <TextField
            select
            fullWidth
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            sx={{ mb: 2 }}
            disabled={updateStatusMutation.isPending}
            SelectProps={{
              native: false,
            }}
          >
            <MenuItem value="">
              <em>Select Status</em>
            </MenuItem>
            {getStatusOptions().map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Reason (Optional)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            multiline
            rows={3}
            placeholder="Enter reason for status change..."
            disabled={updateStatusMutation.isPending}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setStatusDialogOpen(false)}
            disabled={updateStatusMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmStatusChange} 
            variant="contained"
            disabled={!newStatus || updateStatusMutation.isPending}
            startIcon={updateStatusMutation.isPending ? <Box sx={{ width: 16, height: 16 }} /> : null}
          >
            {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => !deleteMutation.isPending && setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Invoice</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete invoice <strong>{invoiceNumber}</strong>?
            <br />
            <br />
            <strong>Warning:</strong> This action cannot be undone. The invoice will be permanently removed from the system.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleteMutation.isPending}
            startIcon={deleteMutation.isPending ? <Box sx={{ width: 16, height: 16 }} /> : null}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete Invoice'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceActionsMenu;