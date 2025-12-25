import React, { useState, useEffect, useCallback } from 'react';
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
  Grid // Changed Grid import
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Edit,
  Delete,
  Inventory,
  LowPriority,
  Warning,
  CheckCircle,
  Cancel,
  MoreVert,
  Visibility,
  FileDownload,
  FileUpload,
  QrCode,
  TrendingUp,
  LocalShipping
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import debounce from 'lodash/debounce';
import productsApi from '../../api/products.api';
import ProductForm from '../../components/products/ProductForm';
import StockAdjustmentDialog from '../../components/products/StockAdjustmentDialog';
import { ProductDto, ProductStats, PagedRequestDto } from '../../types/product.types';

const Products: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openForm, setOpenForm] = useState(false);
  const [openStockDialog, setOpenStockDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionProduct, setActionProduct] = useState<ProductDto | null>(null);

  // Debounce search
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
      setPage(0); // Reset to first page on new search
    }, 500),
    []
  );

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error
  } = useQuery({
    queryKey: ['products', page, rowsPerPage, debouncedSearchTerm, statusFilter],
    queryFn: () => {
      const params: PagedRequestDto = {
        page: page + 1,
        pageSize: rowsPerPage,
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };
      return productsApi.getProducts(params);
    }
  });

  // Fetch stats
  const { data: statsData } = useQuery({
    queryKey: ['productStats'],
    queryFn: () => productsApi.getProductStats()
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete product');
    }
  });

  // Stock adjustment mutation
  const stockAdjustmentMutation = useMutation({
    mutationFn: ({ id, quantity, reason }: { id: string; quantity: number; reason: string }) =>
      productsApi.updateStock(id, quantity, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['productStats'] });
      setOpenStockDialog(false);
      toast.success('Stock updated successfully');
    },
    onError: () => {
      toast.error('Failed to update stock');
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

  // Handle row actions menu
  const handleActionClick = (event: React.MouseEvent<HTMLElement>, product: ProductDto) => {
    setActionProduct(product);
    setAnchorEl(event.currentTarget);
  };

  const handleActionClose = () => {
    setAnchorEl(null);
    setActionProduct(null);
  };

  const handleEdit = () => {
    if (actionProduct) {
      setSelectedProduct(actionProduct);
      setOpenForm(true);
    }
    handleActionClose();
  };

  const handleDelete = () => {
    if (actionProduct && window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(actionProduct.id);
    }
    handleActionClose();
  };

  const handleViewDetails = () => {
    handleActionClose();
  };

  const handleAdjustStock = () => {
    if (actionProduct) {
      setSelectedProduct(actionProduct);
      setOpenStockDialog(true);
    }
    handleActionClose();
  };

  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'error' as const };
    if (quantity <= minStockLevel) return { label: 'Low Stock', color: 'warning' as const };
    return { label: 'In Stock', color: 'success' as const };
  };

  const formatCurrency = (amount: number, currency: string = 'AED') => {
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  if (error) {
    return (
      <Container maxWidth="xl">
        <Alert severity="error" sx={{ mt: 2 }}>
          Error loading products. Please try again.
        </Alert>
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
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedProduct(null);
              setOpenForm(true);
            }}
          >
            Add Product
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Manage your inventory, track stock levels, and update product information.
        </Typography>
      </Box>

      {/* Stats Cards - Fixed Grid v2 syntax */}
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
                {statsData?.totalProducts || 0}
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
                {formatCurrency(statsData?.totalValue || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ≈ ${(statsData?.totalValueUSD || 0).toFixed(2)} USD
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
                {statsData?.lowStockCount || 0}
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
                {statsData?.outOfStockCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : productsData?.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Inventory sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No products found
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {debouncedSearchTerm
                          ? `No products matching "${debouncedSearchTerm}"`
                          : 'Add your first product to get started'}
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => setOpenForm(true)}
                      >
                        Add Product
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                productsData?.products.map((product) => {
                  const stockStatus = getStockStatus(product.quantity, product.minStockLevel);
                  return (
                    <TableRow key={product.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {product.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {product.name}
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
                            {product.quantity}
                          </Typography>
                          {product.minStockLevel > 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Min: {product.minStockLevel}
                            </Typography>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {formatCurrency(product.purchasePrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${product.purchasePriceUSD.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(product.sellingPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ${product.sellingPriceUSD.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={500}>
                          {formatCurrency(product.quantity * product.sellingPrice)}
                        </Typography>
                        <Typography variant="caption" color="success.main">
                          +{(((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)}%
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
        onClose={() => {
          setOpenForm(false);
          setSelectedProduct(null);
        }}
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
            queryClient.invalidateQueries({ queryKey: ['productStats'] });
          } catch (error) {
            toast.error('Failed to save product');
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
          onClose={() => {
            setOpenStockDialog(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['productStats'] });
          }}
        />
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionClose}
      >
        <MenuItem onClick={handleViewDetails}>
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