// frontend/components/invoices/ProductSelection.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Paper,
  Typography,
  CircularProgress,
  Grid, // CHANGED BACK to regular Grid
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Inventory as InventoryIcon,
  LocalOffer as BarcodeIcon,
  Clear as ClearIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getProducts, searchProducts } from '@/api/products.api';
import { UAEUtils } from '@/utils/uae.utils';
import type { ProductDto } from '@/types';

interface ProductSelectionProps {
  onProductSelected: (product: ProductDto) => void;
  disabled?: boolean;
  existingItems?: Array<{ productId: string; quantity: number }>; // For inventory checking
}

const ProductSelection: React.FC<ProductSelectionProps> = ({
  onProductSelected,
  disabled = false,
  existingItems = [],
}) => {
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchError, setSearchError] = useState<string>('');

  // Fetch products with better error handling
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ['products', { search: searchTerm }],
    queryFn: async () => {
      try {
        if (searchTerm && searchTerm.trim().length >= 2) {
          // Use search endpoint for specific searches
          const results = await searchProducts(searchTerm);
          return { products: results, totalCount: results.length };
        } else {
          // Get all products for browsing
          const response = await getProducts({ 
            page: 1, 
            pageSize: 50,
            search: searchTerm || undefined 
          });
          
          // Handle different response structures
          if (Array.isArray(response)) {
            return { products: response, totalCount: response.length };
          } else if (response?.products) {
            return { 
              products: response.products, 
              totalCount: response.totalCount || response.products.length 
            };
          } else if (response?.data?.products) {
            return { 
              products: response.data.products, 
              totalCount: response.data.totalCount || response.data.products.length 
            };
          }
          
          return { products: [], totalCount: 0 };
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        setSearchError(error.message || 'Failed to load products');
        return { products: [], totalCount: 0 };
      }
    },
    enabled: !disabled,
    retry: 1,
  });

  // Calculate available stock considering existing invoice items
  const calculateAvailableStock = (product: ProductDto): number => {
    const existingItem = existingItems.find(item => item.productId === product.id);
    const reservedQuantity = existingItem ? existingItem.quantity : 0;
    return Math.max(0, product.quantity - reservedQuantity);
  };

  // Handle product search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSearchError('');
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setBarcodeInput('');
    setSelectedProduct(null);
    setSearchError('');
  };

  // Handle barcode input
  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBarcodeInput(value);
    
    // Auto-search when barcode length is sufficient (usually 8+ for barcodes)
    if (value.length >= 8) {
      setSearchTerm(value);
      // Auto-clear after 2 seconds for next scan
      setTimeout(() => {
        setBarcodeInput('');
      }, 2000);
    }
  };

  // Handle product selection with inventory check
  const handleProductSelect = (product: ProductDto) => {
    const availableStock = calculateAvailableStock(product);
    
    if (availableStock <= 0) {
      setSearchError(`Product "${product.name}" is out of stock. Available: 0`);
      return;
    }
    
    setSelectedProduct(product);
    onProductSelected(product);
    
    // Show success feedback
    setTimeout(() => {
      setSelectedProduct(null);
    }, 1500);
  };

  // Get products from response
  const products = productsResponse?.products || [];
  const totalCount = productsResponse?.totalCount || 0;
  
  // Filter and categorize products
  const outOfStockProducts = products.filter(p => calculateAvailableStock(p) === 0);
  const lowStockProducts = products.filter(p => {
    const available = calculateAvailableStock(p);
    return available > 0 && available <= p.minStockLevel;
  });
  const inStockProducts = products.filter(p => calculateAvailableStock(p) > p.minStockLevel);
  
  // Calculate inventory stats
  const inventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.sellingPrice), 0);
  const availableValue = products.reduce((sum, p) => sum + (calculateAvailableStock(p) * p.sellingPrice), 0);

  return (
    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" color="primary.main">
            Product Selection
          </Typography>
          <Chip
            icon={<InventoryIcon />}
            label={`${totalCount} Products`}
            size="small"
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Search and select products to add to the invoice
        </Typography>
      </Box>

      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search Products"
              placeholder="Search by name, SKU, or barcode..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              disabled={disabled || isLoadingProducts}
              error={!!searchError}
              helperText={searchError || "Type at least 2 characters to search"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: (searchTerm || isLoadingProducts) && (
                  <InputAdornment position="end">
                    {isLoadingProducts ? (
                      <CircularProgress size={20} />
                    ) : (
                      <IconButton size="small" onClick={handleClearSearch} disabled={isLoadingProducts}>
                        <ClearIcon />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Barcode Scanner"
              placeholder="Scan barcode..."
              value={barcodeInput}
              onChange={handleBarcodeInput}
              disabled={disabled}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BarcodeIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Inventory Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Tooltip title="Products with sufficient stock">
          <Chip
            icon={<CheckIcon />}
            label={`${inStockProducts.length} In Stock`}
            color="success"
            variant="outlined"
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Products below minimum stock level">
          <Chip
            icon={<WarningIcon />}
            label={`${lowStockProducts.length} Low Stock`}
            color="warning"
            variant="outlined"
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Products out of stock">
          <Chip
            icon={<ErrorIcon />}
            label={`${outOfStockProducts.length} Out of Stock`}
            color="error"
            variant="outlined"
            size="small"
          />
        </Tooltip>
        
        <Tooltip title="Total available inventory value">
          <Chip
            label={`Available: ${UAEUtils.formatCurrency(availableValue)}`}
            variant="outlined"
            size="small"
          />
        </Tooltip>
      </Box>

      {/* Products Loading State */}
      {isLoadingProducts ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
            Loading products...
          </Typography>
        </Box>
      ) : productsError ? (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button size="small" color="inherit" onClick={() => refetchProducts()}>
              Retry
            </Button>
          }
        >
          Error loading products. Please try again.
        </Alert>
      ) : products.length === 0 ? (
        <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '2px dashed', borderColor: 'divider' }}>
          <InventoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No products found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm 
              ? `No products matching "${searchTerm}"`
              : 'No products available. Add products in inventory first.'
            }
          </Typography>
          {!searchTerm && (
            <Button 
              variant="outlined" 
              sx={{ mt: 2 }}
              onClick={() => window.open('/products', '_blank')}
            >
              Go to Products
            </Button>
          )}
        </Paper>
      ) : (
        <>
          {/* Products Grid */}
          <Grid container spacing={2}>
            {products.map((product) => {
              const availableStock = calculateAvailableStock(product);
              const isOutOfStock = availableStock === 0;
              const isLowStock = availableStock > 0 && availableStock <= product.minStockLevel;
              const isInStock = availableStock > product.minStockLevel;
              
              // Check if product is already in invoice
              const existingItem = existingItems.find(item => item.productId === product.id);
              const alreadyInInvoice = !!existingItem;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderColor: isOutOfStock ? 'error.main' : isLowStock ? 'warning.main' : 'success.main',
                      opacity: isOutOfStock ? 0.7 : 1,
                      position: 'relative',
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 2,
                      }
                    }}
                  >
                    {/* Stock Status Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        zIndex: 1,
                      }}
                    >
                      {alreadyInInvoice ? (
                        <Tooltip title={`Already in invoice: ${existingItem?.quantity} units`}>
                          <Badge badgeContent={existingItem?.quantity} color="primary">
                            <Chip
                              label="In Invoice"
                              color="primary"
                              size="small"
                            />
                          </Badge>
                        </Tooltip>
                      ) : isOutOfStock ? (
                        <Chip
                          label="Out of Stock"
                          color="error"
                          size="small"
                        />
                      ) : isLowStock ? (
                        <Tooltip title={`Low stock: ${availableStock} available`}>
                          <Chip
                            label={`Low: ${availableStock}`}
                            color="warning"
                            size="small"
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          label={`Stock: ${availableStock}`}
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, pt: 4 }}>
                      {/* Product Name */}
                      <Tooltip title={product.name}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="bold" 
                          gutterBottom 
                          noWrap
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {product.name}
                        </Typography>
                      </Tooltip>
                      
                      {/* SKU */}
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        SKU: {product.sku}
                      </Typography>

                      {/* Category */}
                      {product.categoryName && (
                        <Chip
                          label={product.categoryName}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                      )}

                      {/* Stock Information */}
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Available:</strong> {availableStock} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Stock:</strong> {product.quantity} units
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Min Required:</strong> {product.minStockLevel} units
                        </Typography>
                      </Box>

                      {/* Pricing */}
                      <Box sx={{ mt: 'auto' }}>
                        <Typography variant="h6" color="primary.main" fontWeight="bold">
                          {UAEUtils.formatCurrency(product.sellingPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cost: {UAEUtils.formatCurrency(product.costPrice)}
                          {product.quantity > 0 && (
                            <> | Margin: {((product.sellingPrice - product.costPrice) / product.costPrice * 100).toFixed(1)}%</>
                          )}
                        </Typography>
                      </Box>
                    </CardContent>

                    <Divider />

                    <CardActions>
                      <Button
                        fullWidth
                        variant={alreadyInInvoice ? "outlined" : "contained"}
                        size="small"
                        startIcon={alreadyInInvoice ? <CheckIcon /> : <AddIcon />}
                        onClick={() => handleProductSelect(product)}
                        disabled={disabled || isOutOfStock || alreadyInInvoice}
                        color={
                          alreadyInInvoice ? "success" : 
                          isLowStock ? "warning" : 
                          "primary"
                        }
                        sx={{
                          opacity: isOutOfStock ? 0.7 : 1,
                        }}
                      >
                        {alreadyInInvoice 
                          ? `Added (${existingItem?.quantity})` 
                          : isOutOfStock 
                            ? 'Out of Stock' 
                            : 'Add to Invoice'
                        }
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Load More Button (if paginated) */}
          {totalCount > products.length && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Button 
                variant="outlined"
                onClick={() => {
                  // In a real app, you would load more products
                  console.log('Load more products');
                }}
              >
                Load More Products ({totalCount - products.length} more)
              </Button>
            </Box>
          )}
        </>
      )}

      {/* Selected Product Feedback */}
      {selectedProduct && (
        <Alert 
          severity="success" 
          sx={{ mt: 3 }}
          icon={<CheckIcon />}
          onClose={() => setSelectedProduct(null)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <strong>{selectedProduct.name}</strong> added to invoice
              <Typography variant="body2">
                Price: {UAEUtils.formatCurrency(selectedProduct.sellingPrice)} | 
                Available Stock: {calculateAvailableStock(selectedProduct)}
              </Typography>
            </Box>
            <Button 
              size="small" 
              color="inherit"
              onClick={() => {
                // Add another of the same product
                handleProductSelect(selectedProduct);
              }}
            >
              Add Another
            </Button>
          </Box>
        </Alert>
      )}
    </Paper>
  );
};

export default ProductSelection;