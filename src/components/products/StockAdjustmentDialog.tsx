import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Grid,
  useTheme
} from '@mui/material';
import { Close, Add, Remove } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { productsApi } from '@/api';

interface StockAdjustmentDialogProps {
  open: boolean;
  onClose: () => void;
  product: any;
  onSuccess: () => void;
}

const StockAdjustmentDialog: React.FC<StockAdjustmentDialogProps> = ({
  open,
  onClose,
  product,
  onSuccess
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Refs for focus management
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const dialogTitleRef = useRef<HTMLDivElement>(null);

  // Focus management
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (quantityInputRef.current) {
          quantityInputRef.current.focus();
        } else if (dialogTitleRef.current) {
          dialogTitleRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const adjustmentReasons = [
    'Purchase Order Received',
    'Customer Return',
    'Damaged Goods',
    'Stock Count Adjustment',
    'Theft/Loss',
    'Expired Products',
    'Transfer In',
    'Transfer Out',
    'Other'
  ];

  const validationSchema = Yup.object({
    quantity: Yup.number()
      .required('Quantity is required')
      .integer('Must be a whole number')
      .notOneOf([0], 'Quantity cannot be zero'),
    reason: Yup.string().required('Reason is required'),
    notes: Yup.string()
  });

  const formik = useFormik({
    initialValues: {
      quantity: 0,
      reason: '',
      notes: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await productsApi.updateStock(product.id, values.quantity, `${values.reason}: ${values.notes}`);
        onSuccess();
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error('Error adjusting stock:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  const handleQuickAdjust = (amount: number) => {
    formik.setFieldValue('quantity', amount);
  };

  const handleDialogClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  const newStockLevel = product.quantity + (formik.values.quantity || 0);
  const isOutOfStock = newStockLevel <= 0;
  const isLowStock = newStockLevel > 0 && newStockLevel <= product.minStockLevel;

  // Theme-aware background color
  const lightBackground = theme.palette.mode === 'dark' 
    ? theme.palette.grey[800] 
    : theme.palette.grey[50];

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="stock-adjustment-title"
      onTransitionEnd={(node, isAppearing) => {
        if (!isAppearing && !open) {
          const activeElement = document.activeElement as HTMLElement;
          if (activeElement && activeElement.closest('.MuiDialog-root')) {
            activeElement.blur();
          }
        }
      }}
    >
      <DialogTitle 
        id="stock-adjustment-title"
        ref={dialogTitleRef}
        tabIndex={-1}
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Box>
          <Typography variant="h6">Adjust Stock</Typography>
          <Typography variant="body2" color="text.secondary">
            {product.name} ({product.sku})
          </Typography>
        </Box>
        <IconButton 
          onClick={handleDialogClose} 
          size="small"
          aria-label="Close"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ mb: 3 }}>
            <Alert 
              severity="info" 
              sx={{ mb: 2 }}
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label="+10"
                    size="small"
                    onClick={() => handleQuickAdjust(10)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Chip
                    label="-5"
                    size="small"
                    onClick={() => handleQuickAdjust(-5)}
                    sx={{ cursor: 'pointer' }}
                  />
                </Box>
              }
            >
              Current stock: <strong>{product.quantity} units</strong>
            </Alert>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Button
                variant="outlined"
                startIcon={<Remove />}
                onClick={() => formik.setFieldValue('quantity', Math.max(-product.quantity, (formik.values.quantity || 0) - 1))}
              >
                Decrease
              </Button>
              
              <TextField
                inputRef={quantityInputRef}
                sx={{ flex: 1 }}
                label="Adjustment Quantity"
                name="quantity"
                type="number"
                value={formik.values.quantity || ''}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                helperText={formik.touched.quantity && formik.errors.quantity}
                InputProps={{
                  startAdornment: formik.values.quantity > 0 ? (
                    <Add color="success" sx={{ mr: 1 }} />
                  ) : formik.values.quantity < 0 ? (
                    <Remove color="error" sx={{ mr: 1 }} />
                  ) : null
                }}
              />
              
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => formik.setFieldValue('quantity', (formik.values.quantity || 0) + 1)}
              >
                Increase
              </Button>
            </Box>

            <Box sx={{ 
              p: 2, 
              bgcolor: lightBackground, 
              borderRadius: 1, 
              mb: 2,
              border: `1px solid ${theme.palette.divider}` 
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Current Stock:</Typography>
                <Typography variant="body2" fontWeight="bold">{product.quantity}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Adjustment:</Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ color: formik.values.quantity > 0 ? 'success.main' : 'error.main' }}
                >
                  {formik.values.quantity > 0 ? '+' : ''}{formik.values.quantity || 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">New Stock Level:</Typography>
                <Typography 
                  variant="body2" 
                  fontWeight="bold"
                  sx={{ 
                    color: isOutOfStock ? 'error.main' : 
                           isLowStock ? 'warning.main' : 
                           'success.main' 
                  }}
                >
                  {newStockLevel}
                </Typography>
              </Box>
              {product.minStockLevel > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Minimum Level:</Typography>
                  <Typography variant="body2">{product.minStockLevel}</Typography>
                </Box>
              )}
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Reason for Adjustment *</InputLabel>
            <Select
              name="reason"
              value={formik.values.reason}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              label="Reason for Adjustment *"
              error={formik.touched.reason && Boolean(formik.errors.reason)}
            >
              <MenuItem value=""><em>Select a reason</em></MenuItem>
              {adjustmentReasons.map((reason) => (
                <MenuItem key={reason} value={reason}>{reason}</MenuItem>
              ))}
            </Select>
            {formik.touched.reason && formik.errors.reason && (
              <Typography color="error" variant="caption">{formik.errors.reason}</Typography>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Additional Notes"
            name="notes"
            value={formik.values.notes}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            multiline
            rows={2}
            placeholder="Optional: Add details about this adjustment..."
          />

          {/* Status Preview */}
          {(isOutOfStock || isLowStock) && (
            <Alert 
              severity={isOutOfStock ? 'error' : 'warning'} 
              sx={{ mt: 2 }}
            >
              {isOutOfStock 
                ? 'Warning: This adjustment will result in OUT OF STOCK' 
                : `Low Stock Alert: New level (${newStockLevel}) is below minimum (${product.minStockLevel})`}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Button 
            onClick={handleDialogClose} 
            disabled={loading}
            aria-label="Cancel"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || formik.values.quantity === 0}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            color={formik.values.quantity < 0 ? 'error' : 'primary'}
            aria-label="Apply Adjustment"
          >
            {loading ? 'Processing...' : 'Apply Adjustment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default StockAdjustmentDialog;