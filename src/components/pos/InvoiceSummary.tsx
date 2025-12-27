import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Divider,
  Button,
  Grid,
  Chip,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';

interface InvoiceSummaryProps {
  subtotal: number;
  vat: number;
  total: number;
  itemCount: number;
  showCreateButton?: boolean;
  onCreate?: () => void;
  loading?: boolean;
}

const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  subtotal,
  vat,
  total,
  itemCount,
  showCreateButton = false,
  onCreate,
  loading = false,
}) => {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <ReceiptIcon sx={{ mr: 1 }} />
        Invoice Summary
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Items:
            </Typography>
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Chip
              label={`${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              size="small"
              icon={<ShoppingCartIcon />}
              variant="outlined"
            />
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="body1">Subtotal:</Typography>
        </Grid>
        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
          <Typography variant="body1">AED {subtotal.toFixed(2)}</Typography>
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Typography variant="body1">VAT (5%):</Typography>
        </Grid>
        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
          <Typography variant="body1">AED {vat.toFixed(2)}</Typography>
        </Grid>

        <Grid size={{ xs: 6 }}>
          <Typography variant="body1" color="text.secondary">
            Discount:
          </Typography>
        </Grid>
        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
          <Typography variant="body1" color="text.secondary">
            AED 0.00
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={1}>
        <Grid size={{ xs: 6 }}>
          <Typography variant="h6" fontWeight="bold">
            Total Amount:
          </Typography>
        </Grid>
        <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
          <Typography variant="h5" fontWeight="bold" color="primary">
            AED {total.toFixed(2)}
          </Typography>
        </Grid>
      </Grid>

      {showCreateButton && onCreate && (
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={onCreate}
            disabled={loading || itemCount === 0}
            startIcon={<ReceiptIcon />}
          >
            {loading ? 'Creating Invoice...' : 'Create Invoice'}
          </Button>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Invoice will be generated and PDF will be downloaded automatically.
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default InvoiceSummary;