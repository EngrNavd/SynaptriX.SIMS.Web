import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Breadcrumbs,
  Link,
  LinearProgress,
  IconButton,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Inventory,
  LocalShipping,
  Warning,
  CheckCircle,
  Category,
  Business,
  ColorLens,
  Straighten,
  LocationOn,
  AccessTime,
  AttachMoney,
  TrendingUp
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import productsApi from '../../api/products.api';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lowStockWarning, setLowStockWarning] = useState(false);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id!),
    enabled: !!id
  });

  useEffect(() => {
    if (product && product.quantity <= product.minStockLevel) {
      setLowStockWarning(true);
    }
  }, [product]);

  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <LinearProgress />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 2 }}>
          Product not found or failed to load.
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/products')}
          sx={{ mt: 2 }}
        >
          Back to Products
        </Button>
      </Container>
    );
  }

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { label: 'Out of Stock', color: 'error', icon: <Warning /> };
    }
    if (product.quantity <= product.minStockLevel) {
      return { label: 'Low Stock', color: 'warning', icon: <Warning /> };
    }
    return { label: 'In Stock', color: 'success', icon: <CheckCircle /> };
  };

  const status = getStockStatus();

  const profit = product.sellingPrice - product.purchasePrice;
  const profitMargin = (profit / product.purchasePrice) * 100;
  const stockValue = product.quantity * product.purchasePrice;
  const retailValue = product.quantity * product.sellingPrice;

  return (
    <Container maxWidth="lg">
      {/* Breadcrumbs */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs>
          <Link
            underline="hover"
            color="inherit"
            onClick={() => navigate('/products')}
            sx={{ cursor: 'pointer' }}
          >
            Products
          </Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Typography variant="h4" component="h1" fontWeight={600}>
              {product.name}
            </Typography>
            <Chip
              label={status.label}
              color={status.color}
              icon={status.icon}
              size="small"
            />
          </Box>
          <Typography variant="body1" color="text.secondary">
            SKU: {product.sku} | Category: {product.categoryName || 'Uncategorized'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/products')}
          >
            Back
          </Button>
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => navigate(`/products/edit/${product.id}`)}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {/* Low Stock Warning */}
      {lowStockWarning && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" startIcon={<Inventory />}>
              Restock
            </Button>
          }
        >
          Low stock alert! Only {product.quantity} units left (minimum: {product.minStockLevel})
        </Alert>
      )}

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column - Product Info */}
        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Product Information
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Category sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Category
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {product.categoryName || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Manufacturer
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {product.manufacturer || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ColorLens sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Color
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {product.color || 'Not specified'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Straighten sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Size
                    </Typography>
                  </Box>
                  <Typography variant="body1">
                    {product.size || 'Not specified'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Description
              </Typography>
              <Typography variant="body1" paragraph>
                {product.description || 'No description available.'}
              </Typography>

              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Location
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn color="action" />
                <Typography variant="body1">
                  {product.location || 'Storage location not specified'}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Inventory History */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Recent Stock Movements
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Last 5 inventory transactions
              </Typography>
              <List>
                {/* Mock data - replace with actual API */}
                {[1, 2, 3, 4, 5].map((item) => (
                  <ListItem key={item}>
                    <ListItemIcon>
                      <Inventory />
                    </ListItemIcon>
                    <ListItemText
                      primary="Stock adjustment"
                      secondary={`Added 10 units • Yesterday at 14:30 • Reason: Purchase order #PO-${item}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column - Pricing & Stock */}
        <Grid item xs={12} md={4}>
          {/* Stock Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Stock Information
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Typography variant="h2" align="center" gutterBottom>
                  {product.quantity}
                </Typography>
                <Typography variant="body1" align="center" color="text.secondary">
                  Units in Stock
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Minimum Level:</Typography>
                <Typography variant="body2" fontWeight={500}>
                  {product.minStockLevel}
                </Typography>
              </Box>
              
              {product.maxStockLevel && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2">Maximum Level:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {product.maxStockLevel}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                fullWidth
                startIcon={<Inventory />}
                onClick={() => navigate(`/products/${product.id}/stock`)}
              >
                Manage Stock
              </Button>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Pricing Information
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <AttachMoney color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`AED ${product.purchasePrice.toFixed(2)}`}
                    secondary="Purchase Price"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={`AED ${product.sellingPrice.toFixed(2)}`}
                    secondary="Selling Price"
                  />
                </ListItem>

                <Divider sx={{ my: 1 }} />

                <ListItem>
                  <ListItemText
                    primary={`AED ${profit.toFixed(2)}`}
                    secondary={`Profit (${profitMargin.toFixed(1)}% margin)`}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: profit >= 0 ? 'success.main' : 'error.main'
                    }}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Value Summary
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Stock Value:</Typography>
                  <Typography variant="body2" fontWeight={500}>
                    AED {stockValue.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Retail Value:</Typography>
                  <Typography variant="body2" fontWeight={500} color="primary.main">
                    AED {retailValue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Product Details */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Product Details
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Brand
                </Typography>
                <Typography variant="body1">
                  {product.brand || 'Not specified'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Model
                </Typography>
                <Typography variant="body1">
                  {product.model || 'Not specified'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">
                  {new Date(product.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetails;