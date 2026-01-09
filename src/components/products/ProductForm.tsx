import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Typography,
  InputAdornment,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { Close, AttachFile } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { productsApi } from '@/api';

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  initialData?: any;
  isEdit?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const firstInputRef = useRef<HTMLInputElement>(null);
  const dialogTitleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        if (firstInputRef.current) {
          firstInputRef.current.focus();
        } else if (dialogTitleRef.current) {
          dialogTitleRef.current.focus();
        }
      }, 100);
    }
  }, [open]);

  const validationSchema = Yup.object({
    IMEI: Yup.string()
      .required('IMEI is required')
      .matches(/^[A-Z0-9-]+$/, 'IMEI can only contain uppercase letters, numbers, and hyphens'),
    name: Yup.string()
      .required('Product name is required')
      .min(3, 'Product name must be at least 3 characters'),
    purchasePrice: Yup.number()
      .required('Purchase price is required')
      .positive('Purchase price must be positive'),
    sellingPrice: Yup.number()
      .required('Selling price is required')
      .positive('Selling price must be positive')
      .test(
        'greater-than-purchase',
        'Selling price must be greater than or equal to purchase price',
        function(value) {
          return value >= this.parent.purchasePrice;
        }
      ),
    costPrice: Yup.number()
      .required('Cost price is required')
      .positive('Cost price must be positive'),
    quantity: Yup.number()
      .required('Quantity is required')
      .integer('Quantity must be a whole number')
      .min(0, 'Quantity cannot be negative'),
    minStockLevel: Yup.number()
      .required('Minimum stock level is required')
      .integer('Must be a whole number')
      .min(0, 'Cannot be negative'),
    maxStockLevel: Yup.number()
      .integer('Must be a whole number')
      .min(Yup.ref('minStockLevel'), 'Maximum must be greater than minimum')
      .nullable(),
    categoryId: Yup.number().nullable()
  });

  const formik = useFormik({
    initialValues: {
      IMEI: initialData?.IMEI || '',
      name: initialData?.name || '',
      description: initialData?.description || '',
      purchasePrice: initialData?.purchasePrice || 0,
      sellingPrice: initialData?.sellingPrice || 0,
      costPrice: initialData?.costPrice || 0,
      quantity: initialData?.quantity || 0,
      minStockLevel: initialData?.minStockLevel || 10,
      maxStockLevel: initialData?.maxStockLevel || undefined,
      manufacturer: initialData?.manufacturer || '',
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      color: initialData?.color || '',
      size: initialData?.size || '',
      location: initialData?.location || '',
      categoryId: initialData?.categoryId || undefined
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await onSubmit(values);
        formik.resetForm();
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
      } finally {
        setLoading(false);
      }
    }
  });

  useEffect(() => {
    if (!isEdit && !initialData) {
      const generateIMEI = () => {
        const random1 = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        const random2 = Math.floor(Math.random() * 10000).toString().padStart(5, '0');
        return `${random1}${random2}${random1}`;
      };
      formik.setFieldValue('IMEI', generateIMEI());
    }

    const loadCategories = async () => {
      const mockCategories = [
        { id: 1, name: 'Phones' },
        { id: 2, name: 'Tablets' },
        { id: 3, name: 'Laptops' },
        { id: 4, name: 'Desktops' },
        { id: 5, name: 'Accessories' }
      ];
      setCategories(mockCategories);
    };
    loadCategories();
  }, [isEdit, initialData]);

  useEffect(() => {
    if (initialData) {
      formik.setValues({
        IMEI: initialData.IMEI,
        name: initialData.name,
        description: initialData.description,
        purchasePrice: initialData.purchasePrice,
        sellingPrice: initialData.sellingPrice,
        costPrice: initialData.costPrice,
        quantity: initialData.quantity,
        minStockLevel: initialData.minStockLevel,
        maxStockLevel: initialData.maxStockLevel,
        manufacturer: initialData.manufacturer || '',
        brand: initialData.brand || '',
        model: initialData.model || '',
        color: initialData.color || '',
        size: initialData.size || '',
        location: initialData.location || '',
        categoryId: initialData.categoryId
      });
      if (initialData.imageUrl) {
        setImagePreview(initialData.imageUrl);
      }
    }
  }, [initialData]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateProfit = () => {
    const selling = formik.values.sellingPrice || 0;
    const cost = formik.values.costPrice || 0;
    return selling - cost;
  };

  const calculateProfitMargin = () => {
    const selling = formik.values.sellingPrice || 0;
    const cost = formik.values.costPrice || 0;
    if (selling === 0) return 0;
    return ((selling - cost) / selling) * 100;
  };

  const handleDialogClose = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    onClose();
  };

  // Theme-aware styling with blue/navy theme
  const sectionBackground = theme.palette.mode === 'dark' 
    ? alpha(theme.palette.primary.dark, 0.2)
    : alpha(theme.palette.primary.light, 0.1);
  
  const cardBackground = theme.palette.mode === 'dark'
    ? alpha(theme.palette.background.paper, 0.8)
    : theme.palette.background.paper;
  
  const borderColor = theme.palette.mode === 'dark'
    ? alpha(theme.palette.primary.main, 0.3)
    : alpha(theme.palette.primary.main, 0.2);

  return (
    <Dialog 
      open={open} 
      onClose={handleDialogClose} 
      maxWidth="lg" 
      fullWidth
      aria-labelledby="product-form-title"
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
        id="product-form-title"
        ref={dialogTitleRef}
        tabIndex={-1}
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: theme.palette.mode === 'dark' 
            ? alpha(theme.palette.primary.dark, 0.8)
            : theme.palette.primary.main,
          color: theme.palette.mode === 'dark' 
            ? theme.palette.getContrastText(alpha(theme.palette.primary.dark, 0.8))
            : 'white'
        }}
      >
        {isEdit ? 'Edit Product' : 'Add New Product'}
        <IconButton 
          onClick={handleDialogClose} 
          size="small"
          aria-label="Close"
          sx={{ color: 'inherit' }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers sx={{ bgcolor: theme.palette.background.default }}>
          <Grid container spacing={3}>
            {/* Left Column - Basic Info */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    inputRef={firstInputRef}
                    fullWidth
                    label="IMEI *"
                    name="IMEI"
                    value={formik.values.IMEI}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.IMEI && Boolean(formik.errors.IMEI)}
                    helperText={formik.touched.IMEI && formik.errors.IMEI}
                    disabled={isEdit}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">#</InputAdornment>,
                    }}
                  />
                </Grid>
                
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      name="categoryId"
                      value={formik.values.categoryId || ''}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      label="Category"
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Product Name *"
                    name="name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>

                {/* Pricing Section */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      bgcolor: 'primary.main',
                      borderRadius: 1 
                    }} />
                    Pricing Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Purchase Price (AED) *"
                    name="purchasePrice"
                    type="number"
                    value={formik.values.purchasePrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.purchasePrice && Boolean(formik.errors.purchasePrice)}
                    helperText={formik.touched.purchasePrice && formik.errors.purchasePrice}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Selling Price (AED) *"
                    name="sellingPrice"
                    type="number"
                    value={formik.values.sellingPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.sellingPrice && Boolean(formik.errors.sellingPrice)}
                    helperText={formik.touched.sellingPrice && formik.errors.sellingPrice}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Cost Price (AED) *"
                    name="costPrice"
                    type="number"
                    value={formik.values.costPrice}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.costPrice && Boolean(formik.errors.costPrice)}
                    helperText={formik.touched.costPrice && formik.errors.costPrice}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">AED</InputAdornment>,
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: sectionBackground, 
                    borderRadius: 2,
                    border: `1px solid ${borderColor}`
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Profit: <strong style={{ 
                        color: calculateProfit() >= 0 
                          ? theme.palette.success.main 
                          : theme.palette.error.main 
                      }}>
                        AED {calculateProfit().toFixed(2)}
                      </strong>
                    </Typography>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: sectionBackground, 
                    borderRadius: 2,
                    border: `1px solid ${borderColor}`
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Profit Margin: <strong style={{ 
                        color: calculateProfitMargin() >= 0 
                          ? theme.palette.success.main 
                          : theme.palette.error.main 
                      }}>
                        {calculateProfitMargin().toFixed(2)}%
                      </strong>
                    </Typography>
                  </Box>
                </Grid>

                {/* Stock Information */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      bgcolor: 'primary.main',
                      borderRadius: 1 
                    }} />
                    Stock Information
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Current Quantity *"
                    name="quantity"
                    type="number"
                    value={formik.values.quantity}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                    helperText={formik.touched.quantity && formik.errors.quantity}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Min Stock Level *"
                    name="minStockLevel"
                    type="number"
                    value={formik.values.minStockLevel}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.minStockLevel && Boolean(formik.errors.minStockLevel)}
                    helperText={formik.touched.minStockLevel && formik.errors.minStockLevel}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Max Stock Level"
                    name="maxStockLevel"
                    type="number"
                    value={formik.values.maxStockLevel || ''}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.maxStockLevel && Boolean(formik.errors.maxStockLevel)}
                    helperText={formik.touched.maxStockLevel && formik.errors.maxStockLevel}
                  />
                </Grid>

                {/* Product Details */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ 
                    color: 'primary.main', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      width: 4, 
                      height: 20, 
                      bgcolor: 'primary.main',
                      borderRadius: 1 
                    }} />
                    Product Details
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Manufacturer"
                    name="manufacturer"
                    value={formik.values.manufacturer}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Brand"
                    name="brand"
                    value={formik.values.brand}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Model"
                    name="model"
                    value={formik.values.model}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Color"
                    name="color"
                    value={formik.values.color}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Size"
                    name="size"
                    value={formik.values.size}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    name="description"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Location/Storage"
                    name="location"
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="e.g., Warehouse A, Shelf 3, Bin 5"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Right Column - Image Upload & Stock Status */}
            <Grid size={{ xs: 12, md: 4 }}>
              {/* Image Upload */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Product Image
                </Typography>
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: borderColor,
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    cursor: 'pointer',
                    bgcolor: sectionBackground,
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                  {imagePreview ? (
                    <Box>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 1 }}
                      />
                      <Button
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImagePreview(null);
                        }}
                        sx={{ mt: 1 }}
                      >
                        Change Image
                      </Button>
                    </Box>
                  ) : (
                    <>
                      <AttachFile sx={{ fontSize: 48, color: 'primary.light', mb: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload product image
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        PNG, JPG, GIF up to 5MB
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>

              {/* Stock Status Preview */}
              <Box sx={{ 
                p: 2.5, 
                bgcolor: sectionBackground, 
                borderRadius: 2, 
                mb: 3,
                border: `1px solid ${borderColor}`
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 3, 
                    height: 16, 
                    bgcolor: 'primary.main',
                    borderRadius: 0.5 
                  }} />
                  Stock Status Preview
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Current Stock:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        color: formik.values.quantity === 0 ? 'error.main' :
                               formik.values.quantity <= formik.values.minStockLevel ? 'warning.main' :
                               'success.main'
                      }}
                    >
                      {formik.values.quantity} units
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Min Level:</Typography>
                    <Typography variant="body2">{formik.values.minStockLevel}</Typography>
                  </Box>
                  {formik.values.maxStockLevel && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Max Level:</Typography>
                      <Typography variant="body2">{formik.values.maxStockLevel}</Typography>
                    </Box>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2">Status:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        color: formik.values.quantity === 0 ? 'error.main' :
                               formik.values.quantity <= formik.values.minStockLevel ? 'warning.main' :
                               'success.main'
                      }}
                    >
                      {formik.values.quantity === 0 ? 'Out of Stock' :
                       formik.values.quantity <= formik.values.minStockLevel ? 'Low Stock' :
                       'In Stock'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Financial Summary */}
              <Box sx={{ 
                p: 2.5, 
                bgcolor: sectionBackground, 
                borderRadius: 2,
                border: `1px solid ${borderColor}`
              }}>
                <Typography variant="subtitle2" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box sx={{ 
                    width: 3, 
                    height: 16, 
                    bgcolor: 'primary.main',
                    borderRadius: 0.5 
                  }} />
                  Financial Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Cost Value:</Typography>
                    <Typography variant="body2">
                      AED {(formik.values.quantity * formik.values.costPrice).toFixed(2)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Total Retail Value:</Typography>
                    <Typography variant="body2">
                      AED {(formik.values.quantity * formik.values.sellingPrice).toFixed(2)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1, borderColor: borderColor }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" fontWeight="bold">Potential Profit:</Typography>
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: calculateProfit() >= 0 ? 'success.main' : 'error.main' }}
                    >
                      AED {(formik.values.quantity * calculateProfit()).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ 
          p: 3, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: theme.palette.background.default 
        }}>
          <Button 
            onClick={handleDialogClose} 
            disabled={loading}
            aria-label="Cancel"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            aria-label={isEdit ? 'Update Product' : 'Create Product'}
            sx={{
              bgcolor: theme.palette.mode === 'dark' 
                ? alpha(theme.palette.primary.dark, 0.9)
                : theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' 
                  ? theme.palette.primary.dark
                  : theme.palette.primary.dark
              }
            }}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProductForm;