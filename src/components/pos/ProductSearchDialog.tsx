import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Add as AddIcon,
  LocalOffer as LocalOfferIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { searchProducts } from '../../api/products.api'; // Adjust path if needed
import { Product } from '../../types';

interface ProductSearchDialogProps {
  open: boolean;
  onClose: () => void;
  onAddProduct: (product: Product) => void;
}

const ProductSearchDialog: React.FC<ProductSearchDialogProps> = ({
  open,
  onClose,
  onAddProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch products with debounced search term
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', debouncedSearchTerm],
    queryFn: () => {
      // Only search if term has at least 2 characters
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        return Promise.resolve([]);
      }
      return searchProducts(debouncedSearchTerm);
    },
    enabled: false,
  });

  // Refetch when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm.length >= 2) {
      refetch();
    }
  }, [debouncedSearchTerm, refetch]);

  const handleSearch = () => {
    if (searchTerm.trim().length >= 2) {
      refetch();
    }
  };

  const handleAdd = (product: Product) => {
    onAddProduct(product);
    onClose();
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' },
      }}
    >
      <DialogTitle sx={{ borderBottom: 1, borderColor: 'divider', py: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span" fontWeight={600}>
            Search Products
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 3 }}>
        {/* Search Box */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search products by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {searchTerm.length > 0 && searchTerm.length < 2 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Type at least 2 characters to search
            </Typography>
          )}
        </Box>

        {/* Results */}
        <Box sx={{ height: 'calc(80vh - 200px)', overflow: 'auto' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading products. Please try again.
            </Alert>
          ) : debouncedSearchTerm.length >= 2 && products.length === 0 ? (
            <Alert severity="info">
              No products found for "{debouncedSearchTerm}". Try a different search term.
            </Alert>
          ) : debouncedSearchTerm.length < 2 ? (
            <Alert severity="info">
              Start typing to search products. Minimum 2 characters required.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {products.map((product) => (
                <Grid size={{ xs: 12, sm: 6 }} key={product.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {product.name}
                        </Typography>
                        <Chip
                          label={`AED ${product.price.toFixed(2)}`}
                          color="primary"
                          size="small"
                        />
                      </Box>

                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Code: {product.code}
                      </Typography>

                      {product.description && (
                        <Typography variant="body2" paragraph sx={{ mb: 1 }}>
                          {product.description}
                        </Typography>
                      )}

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          {product.warranty ? (
                            <Chip
                              icon={<LocalOfferIcon />}
                              label={`${product.warrantyDays || 0} days warranty`}
                              color="success"
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No warranty
                            </Typography>
                          )}
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                            Stock: {product.stockQuantity || 0}
                          </Typography>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={() => handleAdd(product)}
                            disabled={product.stockQuantity === 0}
                          >
                            Add
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', py: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        {products.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
            {products.length} product(s) found
          </Typography>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ProductSearchDialog;