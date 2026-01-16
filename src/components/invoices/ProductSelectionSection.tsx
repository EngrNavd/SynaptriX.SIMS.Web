import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Badge,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  Inventory as InventoryIcon,
  AttachMoney as AttachMoneyIcon,
  LocalOffer as LocalOfferIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/products.api';
import { UAEUtils } from '../../utils/uae.utils';
import type { ProductDto } from '../../types/product.types';

interface ProductSelectionSectionProps {
  selectedProducts: Array<{
    product: ProductDto;
    quantity: number;
  }>;
  setSelectedProducts: (products: Array<{
    product: ProductDto;
    quantity: number;
  }>) => void;
  onProductSelect: (product: ProductDto) => void;
  onQuantityChange: (productId: string, quantity: number) => void;
  onProductRemove: (productId: string) => void;
}

const ProductSelectionSection: React.FC<ProductSelectionSectionProps> = ({
  selectedProducts,
  setSelectedProducts,
  onProductSelect,
  onQuantityChange,
  onProductRemove
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<ProductDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string>('');

  // Fetch default trending products
  const { data: trendingProducts, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['trending-products'],
    queryFn: async () => {
      try {
        const response = await productsApi.getProducts({
          page: 1,
          pageSize: 10,
          sortBy: 'quantity',
          sortOrder: 'desc'
        });
        
        // SAFETY CHECK: Ensure data exists and is an array
        if (response.success && response.data?.items) {
          return response.data.items;
        } else if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        return [];
      } catch (error) {
        console.error('Error fetching trending products:', error);
        return [];
      }
    }
  });

  // Handle search
  const handleSearch = async () => {
    if (!searchTerm.trim() || searchTerm.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError('');

    try {
      const response = await productsApi.searchProducts(searchTerm.trim());
      
      // SAFETY CHECK: Handle different response structures
      let products: ProductDto[] = [];
      
      if (response.success) {
        if (Array.isArray(response.data)) {
          products = response.data;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          products = response.data.items;
        } else if (response.data?.products && Array.isArray(response.data.products)) {
          products = response.data.products;
        }
      }
      
      setSearchResults(products);
      
      if (products.length === 0) {
        setSearchError('No products found matching your search');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Error searching for products. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Get products to display (search results or trending products)
  const displayProducts = searchTerm.trim().length >= 2 ? searchResults : (trendingProducts || []);

  // Calculate totals
  const calculateTotals = () => {
    return selectedProducts.reduce(
      (totals, item) => {
        const itemTotal = item.product.sellingPrice * item.quantity;
        return {
          totalItems: totals.totalItems + item.quantity,
          subtotal: totals.subtotal + itemTotal,
          vatAmount: totals.vatAmount + (itemTotal * 0.05), // 5% VAT
        };
      },
      { totalItems: 0, subtotal: 0, vatAmount: 0 }
    );
  };

  const { totalItems, subtotal, vatAmount } = calculateTotals();
  const total = subtotal + vatAmount;

  // Handle quantity increment
  const handleIncrement = (product: ProductDto) => {
    const existingItem = selectedProducts.find(item => item.product.id === product.id);
    if (existingItem) {
      onQuantityChange(product.id, existingItem.quantity + 1);
    } else {
      onProductSelect(product);
    }
  };

  // Handle quantity decrement
  const handleDecrement = (productId: string) => {
    const existingItem = selectedProducts.find(item => item.product.id === productId);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        onQuantityChange(productId, existingItem.quantity - 1);
      } else {
        onProductRemove(productId);
      }
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError('');
  };

  // Get stock status color
  const getStockStatusColor = (quantity: number, minStockLevel: number = 10) => {
    if (quantity <= 0) return 'error';
    if (quantity <= minStockLevel) return 'warning';
    return 'success';
  };

  // Get stock status text
  const getStockStatusText = (quantity: number, minStockLevel: number = 10) => {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= minStockLevel) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <Box>
      {/* Product Search Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Products
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search Products"
              placeholder="Type product name, SKU, or barcode (min. 2 characters)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                    >
                      ✕
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText="Press Enter to search"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={isSearching || searchTerm.trim().length < 2}
              startIcon={isSearching ? <CircularProgress size={20} /> : <SearchIcon />}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </Button>
          </Grid>
        </Grid>

        {searchError && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {searchError}
          </Alert>
        )}
      </Paper>

      {/* Products Grid */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {searchTerm.trim().length >= 2 ? 'Search Results' : 'Trending Products'}
          </Typography>
          <Chip
            icon={<ShoppingCartIcon />}
            label={`${selectedProducts.length} items selected`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* SAFETY CHECK: Ensure displayProducts exists and is an array */}
        {isLoadingTrending ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : !displayProducts || displayProducts.length === 0 ? (
          <Alert severity="info">
            {searchTerm.trim().length >= 2 
              ? 'No products found. Try a different search term.'
              : 'Loading trending products...'}
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {displayProducts.map((product) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card 
                  variant="outlined"
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        {product.sku}
                      </Typography>
                      <Chip
                        label={getStockStatusText(product.stockQuantity || product.quantity)}
                        color={getStockStatusColor(product.stockQuantity || product.quantity)}
                        size="small"
                      />
                    </Box>
                    
                    <Typography variant="h6" gutterBottom noWrap>
                      {product.name}
                    </Typography>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {product.description?.substring(0, 60)}...
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h5" color="primary">
                        {UAEUtils.formatCurrency(product.sellingPrice)}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Stock: {product.stockQuantity || product.quantity} units
                      </Typography>
                    </Box>
                    
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={() => handleIncrement(product)}
                      disabled={(product.stockQuantity || product.quantity) <= 0}
                      startIcon={<AddIcon />}
                    >
                      Add to Invoice
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Selected Products Table */}
      {selectedProducts.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Selected Products ({selectedProducts.length})
          </Typography>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell align="center">Quantity</TableCell>
                  <TableCell align="right">Total</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedProducts.map((item) => (
                  <TableRow key={item.product.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{item.product.name}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          SKU: {item.product.sku}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {UAEUtils.formatCurrency(item.product.sellingPrice)}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconButton
                          size="small"
                          onClick={() => handleDecrement(item.product.id)}
                          disabled={item.quantity <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleIncrement(item.product)}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {UAEUtils.formatCurrency(item.product.sellingPrice * item.quantity)}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onProductRemove(item.product.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Total Items</Typography>
                <Typography variant="h6">{totalItems}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Subtotal</Typography>
                <Typography variant="h6">{UAEUtils.formatCurrency(subtotal)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">VAT (5%)</Typography>
                <Typography variant="h6">{UAEUtils.formatCurrency(vatAmount)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="body2" color="textSecondary">Total</Typography>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {UAEUtils.formatCurrency(total)}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      )}

      {/* Empty State */}
      {selectedProducts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }}>📦</Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No products selected
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Search for products above and click "Add to Invoice" to add them to your invoice
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ProductSelectionSection;