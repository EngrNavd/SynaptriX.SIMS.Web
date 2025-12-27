import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  Badge,
  Tooltip,
  Paper,
  Divider,
  Stack,
  Grid,
  Skeleton
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Inventory,
  Warning,
  CheckCircle,
  Cancel,
  MoreVert,
  Visibility,
  FileDownload,
  FileUpload,
  TrendingUp
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import { productsApi } from '@/api';
import ProductForm from '../../components/products/ProductForm';
import StockAdjustmentDialog from '../../components/products/StockAdjustmentDialog';
import { Product } from '../../types';

const Products: React.FC = () => {
  console.log('🚀 Products component rendering');
  console.log('🔑 Token exists:', !!localStorage.getItem('token'));
  
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openForm, setOpenForm] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionProduct, setActionProduct] = useState<Product | null>(null);
  
  // Refs for focus management
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const addProductButtonRef = useRef<HTMLButtonElement>(null);

  // Debug useEffect
  useEffect(() => {
    console.log('=== PRODUCTS PAGE DEBUG ===');
    console.log('1. Token:', localStorage.getItem('token'));
    console.log('2. Page state:', { page, rowsPerPage, searchTerm, statusFilter });
    
    // Test if API endpoint exists
    const testApiEndpoint = async () => {
      try {
        console.log('3. Testing direct fetch to /api/products...');
        const response = await fetch('/api/products?page=1&pageSize=5');
        console.log('4. Fetch response status:', response.status);
        const data = await response.json();
        console.log('5. Fetch response data structure:', Object.keys(data));
        console.log('6. Fetch response:', data);
      } catch (error) {
        console.error('7. Direct fetch failed:', error);
      }
    };
    
    testApiEndpoint();
  }, []);

  // Debounce search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setPage(0);
    }, 500),
    []
  );

  // MAIN PRODUCTS QUERY - SIMPLIFIED VERSION
  const {
    data: productsData = { products: [], totalCount: 0, page: 1, pageSize: 10 },
    isLoading: productsLoading,
    error: productsError,
    isFetching: productsFetching
  } = useQuery({
    queryKey: ['products', page, rowsPerPage, debouncedSearchTerm, statusFilter],
    queryFn: async () => {
      console.log('🔄 [useQuery] Fetching products...');
      
      const params: any = {
        page: page + 1,
        pageSize: rowsPerPage,
      };
      
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      console.log('🔄 [useQuery] Params:', params);
      
      try {
        console.log('🔄 [useQuery] Calling productsApi.getProducts()...');
        const response = await productsApi.getProducts(params);
        console.log('🔄 [useQuery] Raw API Response:', response);
        
        // Handle different response structures
        let products = [];
        let totalCount = 0;
        
        if (response && response.products && Array.isArray(response.products)) {
          // Structure: { products: [], totalCount: number }
          products = response.products;
          totalCount = response.totalCount || response.products.length;
          console.log('📊 [useQuery] Using products/totalCount structure');
        } else if (response && response.data && Array.isArray(response.data)) {
          // Structure: { data: [], totalCount: number }
          products = response.data;
          totalCount = response.totalCount || response.data.length;
          console.log('📊 [useQuery] Using data/totalCount structure');
        } else if (Array.isArray(response)) {
          // Structure: [] (array directly)
          products = response;
          totalCount = response.length;
          console.log('📊 [useQuery] Using array structure');
        } else if (response && response.data && response.data.products) {
          // Structure: { data: { products: [], totalCount: number } }
          products = response.data.products;
          totalCount = response.data.totalCount || response.data.products.length;
          console.log('📊 [useQuery] Using nested data.products structure');
        } else {
          console.warn('⚠️ [useQuery] Unknown response structure:', response);
          products = [];
          totalCount = 0;
        }
        
        console.log('✅ [useQuery] Normalized:', { 
          productsCount: products.length, 
          totalCount,
          sampleProduct: products[0] 
        });
        
        return {
          products,
          totalCount,
          page: page + 1,
          pageSize: rowsPerPage
        };
      } catch (error: any) {
        console.error('❌ [useQuery] Error:', error);
        console.error('❌ [useQuery] Error message:', error.message);
        console.error('❌ [useQuery] Error response:', error.response);
        
        // Return empty data structure to prevent crashes
        return {
          products: [],
          totalCount: 0,
          page: page + 1,
          pageSize: rowsPerPage
        };
      }
    },
    staleTime: 30000,
    gcTime: 60000,
    retry: 1,
  });

  // SEPARATE QUERIES for stats - with error handling
  const { data: inventoryValue = 0, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventoryValue'],
    queryFn: async () => {
      try {
        return await productsApi.getInventoryValue();
      } catch (error) {
        console.error('Inventory value error:', error);
        return 0;
      }
    },
    staleTime: 300000,
    gcTime: 600000,
    retry: 1,
  });

  const { data: lowStockProducts = [], isLoading: lowStockLoading } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: async () => {
      try {
        return await productsApi.getLowStockProducts();
      } catch (error) {
        console.error('Low stock products error:', error);
        return [];
      }
    },
    staleTime: 60000,
    gcTime: 300000,
    retry: 1,
  });

  // Calculate stats
  const stats = useMemo(() => {
    console.log('📈 Calculating stats...');
    console.log('📈 Current productsData:', productsData);
    
    const currentProducts = productsData.products || [];
    const outOfStockCount = currentProducts.filter(p => (p.quantity || 0) === 0).length;
    
    return {
      totalProducts: productsData.totalCount || 0,
      totalValue: inventoryValue,
      totalValueUSD: inventoryValue * 0.27,
      lowStockCount: lowStockProducts.length || 0,
      outOfStockCount
    };
  }, [productsData, inventoryValue, lowStockProducts]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventoryValue'] });
      queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      if (error.response?.status === 401) {
        toast.error('Unauthorized - Please login again');
      } else {
        toast.error('Failed to delete product');
      }
    }
  });

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  // Handle filter menu
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const openFilterMenu = Boolean(filterAnchorEl);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPage(0);
    handleFilterClose();
  };

  // Handle form dialog
  const handleFormOpen = (product: Product | null = null) => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    setSelectedProduct(product);
    setOpenForm(true);
  };

  const handleFormClose = () => {
    setOpenForm(false);
    setSelectedProduct(null);
    
    setTimeout(() => {
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus();
      } else if (addProductButtonRef.current) {
        addProductButtonRef.current.focus();
      }
    }, 100);
  };

  // Handle stock dialog
  const handleStockDialogOpen = (product: Product) => {
    lastFocusedElementRef.current = document.activeElement as HTMLElement;
    setSelectedProduct(product);
    setOpenStockDialog(true);
  };

  const handleStockDialogClose = () => {
    setOpenStockDialog(false);
    
    setTimeout(() => {
      if (lastFocusedElementRef.current) {
        lastFocusedElementRef.current.focus();
      }
    }, 100);
  };

  // Handle row actions menu
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, product: Product) => {
    setActionProduct(product);
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActionProduct(null);
  };

  const handleEdit = () => {
    if (actionProduct) {
      handleFormOpen(actionProduct);
    }
    handleActionClose();
  };

  const handleDelete = () => {
    if (actionProduct && window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(actionProduct.id.toString());
    }
    handleActionClose();
  };

  const handleAdjustStock = () => {
    if (actionProduct) {
      handleStockDialogOpen(actionProduct);
    }
    handleActionClose();
  };

  const handleAddProduct = () => {
    handleFormOpen(null);
  };

  const getStockStatus = useCallback((quantity: number, minStockLevel: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (quantity <= minStockLevel) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  }, []);

  const formatCurrency = useCallback((amount: number, currency: string = 'AED') => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }, []);

  // Loading skeleton for stats cards
  const renderStatsSkeleton = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {[1, 2, 3, 4].map((index) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="circular" width={24} height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="40%" height={40} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  // Show error if query failed
  if (productsError) {
    console.error('Products query error:', productsError);
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading products: {productsError.message}
        </Alert>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => queryClient.refetchQueries({ queryKey: ['products'] })}
        >
          Retry Loading Products
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" fontWeight={600}>
            Product Management
          </Typography>
          <Button
            ref={addProductButtonRef}
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Manage your inventory, track stock levels, and update product information.
        </Typography>
      </Box>

      {/* Stats Cards */}
      {(productsLoading || inventoryLoading || lowStockLoading) && renderStatsSkeleton()}

      {!(productsLoading || inventoryLoading || lowStockLoading) && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Inventory color="primary" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Products
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {stats.totalProducts.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {productsData.products.length} loaded
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="success" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Inventory Value
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600}>
                  {formatCurrency(stats.totalValue)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ≈ ${stats.totalValueUSD.toFixed(2)} USD
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Warning color="warning" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Low Stock
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="warning.main">
                  {stats.lowStockCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Cancel color="error" sx={{ mr: 1 }} />
                  <Typography variant="subtitle2" color="text.secondary">
                    Out of Stock
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight={600} color="error.main">
                  {stats.outOfStockCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <Tooltip title="Filter products">
              <IconButton onClick={handleFilterClick}>
                <Badge
                  badgeContent={statusFilter !== 'all' ? 1 : 0}
                  color="primary"
                >
                  <FilterList />
                </Badge>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={filterAnchorEl}
              open={openFilterMenu}
              onClose={handleFilterClose}
            >
              <MenuItem
                onClick={() => handleStatusFilter('all')}
                selected={statusFilter === 'all'}
              >
                All Products
              </MenuItem>
              <MenuItem
                onClick={() => handleStatusFilter('in-stock')}
                selected={statusFilter === 'in-stock'}
              >
                In Stock
              </MenuItem>
              <MenuItem
                onClick={() => handleStatusFilter('low-stock')}
                selected={statusFilter === 'low-stock'}
              >
                Low Stock
              </MenuItem>
              <MenuItem
                onClick={() => handleStatusFilter('out-of-stock')}
                selected={statusFilter === 'out-of-stock'}
              >
                Out of Stock
              </MenuItem>
            </Menu>

            <Button startIcon={<FileUpload />} variant="outlined">
              Import
            </Button>
            <Button startIcon={<FileDownload />} variant="outlined">
              Export
            </Button>
          </Box>

          {/* Active Filters */}
          {(statusFilter !== 'all' || debouncedSearchTerm) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
              {debouncedSearchTerm && (
                <Chip
                  label={`Search: "${debouncedSearchTerm}"`}
                  size="small"
                  onDelete={() => {
                    setSearchTerm('');
                    setDebouncedSearchTerm('');
                  }}
                />
              )}
              {statusFilter !== 'all' && (
                <Chip
                  label={`Status: ${statusFilter.replace('-', ' ')}`}
                  size="small"
                  onDelete={() => setStatusFilter('all')}
                />
              )}
              <Button size="small" onClick={() => {
                setSearchTerm('');
                setDebouncedSearchTerm('');
                setStatusFilter('all');
              }}>
                Clear all
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Product Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell align="right">Stock</TableCell>
                <TableCell align="right">Purchase Price</TableCell>
                <TableCell align="right">Selling Price</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productsLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Loading products...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : productsData.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Inventory sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        {debouncedSearchTerm
                          ? `No products matching "${debouncedSearchTerm}"`
                          : 'No products found'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {!debouncedSearchTerm && 'Add your first product to get started'}
                      </Typography>
                      {!debouncedSearchTerm && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={handleAddProduct}
                        >
                          Add Product
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                productsData.products.map((product) => {
                  const quantity = product.quantity || 0;
                  const minStockLevel = product.minStockLevel || 0;
                  const purchasePrice = product.purchasePrice || 0;
                  const sellingPrice = product.sellingPrice || 0;
                  const stockStatus = getStockStatus(quantity, minStockLevel);
                  const marginPercentage = purchasePrice > 0 
                    ? (((sellingPrice - purchasePrice) / purchasePrice) * 100).toFixed(1)
                    : '0.0';
                  
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.sku || 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {product.name || 'Unnamed Product'}
                          </Typography>
                          {product.description && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {product.description}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {product.categoryName || (
                          <Typography variant="body2" color="text.secondary">
                            Uncategorized
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <Typography variant="body1" fontWeight={500}>
                            {quantity}
                          </Typography>
                          {minStockLevel > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Min: {minStockLevel}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(purchasePrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${(purchasePrice * 0.27).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(sellingPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${(sellingPrice * 0.27).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(quantity * sellingPrice)}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          +{marginPercentage}%
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={stockStatus.label}
                          size="small"
                          color={stockStatus.color}
                          icon={stockStatus.color === 'error' ? <Cancel /> :
                                stockStatus.color === 'warning' ? <Warning /> :
                                <CheckCircle />}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionClick(e, product)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {productsData && productsData.products.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={productsData.totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </Card>

      {/* Product Form Dialog */}
      <ProductForm
        open={openForm}
        onClose={handleFormClose}
        onSubmit={async (values) => {
          try {
            if (selectedProduct) {
              await productsApi.updateProduct(selectedProduct.id, values);
              toast.success('Product updated successfully');
            } else {
              await productsApi.createProduct(values);
              toast.success('Product created successfully');
            }
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryValue'] });
            queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] });
            handleFormClose();
          } catch (error: any) {
            console.error('Save product error:', error);
            if (error.response?.status === 401) {
              toast.error('Unauthorized - Please login again');
            } else {
              toast.error('Failed to save product');
            }
            throw error;
          }
        }}
        initialData={selectedProduct}
        isEdit={!!selectedProduct}
      />

      {/* Stock Adjustment Dialog */}
      {selectedProduct && (
        <StockAdjustmentDialog
          open={openStockDialog}
          onClose={handleStockDialogClose}
          product={selectedProduct}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventoryValue'] });
            queryClient.invalidateQueries({ queryKey: ['lowStockProducts'] });
            handleStockDialogClose();
          }}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleActionClose}>
          <Visibility fontSize="small" sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Product
        </MenuItem>
        <MenuItem onClick={handleAdjustStock}>
          <Inventory fontSize="small" sx={{ mr: 1 }} />
          Adjust Stock
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Product
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Products;