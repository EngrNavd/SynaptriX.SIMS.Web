import React from 'react';
import { Grid, Box, Typography, Button } from '@mui/material';
import { Add } from '@mui/icons-material';
import ProductCard from './ProductCard';

interface ProductsGridViewProps {
  products: any[];
  isLoading: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
  onAdjustStock: (product: any) => void;
}

const ProductsGridView: React.FC<ProductsGridViewProps> = ({
  products,
  isLoading,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onAdjustStock
}) => {
  if (isLoading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography>Loading products...</Typography>
      </Box>
    );
  }

  if (products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No products found
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddProduct}
          sx={{ mt: 2 }}
        >
          Add Your First Product
        </Button>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
          <ProductCard
            product={product}
            onEdit={onEditProduct}
            onDelete={onDeleteProduct}
            onAdjustStock={onAdjustStock}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProductsGridView;