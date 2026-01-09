import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  useTheme
} from '@mui/material';
import {
  MoreVert,
  Inventory,
  Warning,
  CheckCircle,
  Cancel,
  Edit,
  Delete,
  QrCode
} from '@mui/icons-material';

interface ProductCardProps {
  product: any;
  onEdit: (product: any) => void;
  onDelete: (product: any) => void;
  onAdjustStock: (product: any) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onAdjustStock
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getStockStatus = () => {
    if (product.quantity === 0) {
      return { label: 'Out of Stock', color: 'error', icon: <Cancel /> };
    }
    if (product.quantity <= product.minStockLevel) {
      return { label: 'Low Stock', color: 'warning', icon: <Warning /> };
    }
    return { label: 'In Stock', color: 'success', icon: <CheckCircle /> };
  };

  const status = getStockStatus();

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Product Image */}
      <Box sx={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="160"
          image={product.imageUrl || '/api/placeholder/400/300'}
          alt={product.name}
          sx={{ objectFit: 'cover' }}
        />
        <Chip
          label={status.label}
          size="small"
          color={status.color}
          icon={status.icon}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: theme.palette.mode === 'dark' 
              ? 'rgba(0, 0, 0, 0.7)' 
              : 'rgba(255, 255, 255, 0.8)'
          }}
        >
          <QrCode fontSize="small" />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* SKU */}
        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
          #{product.sku}
        </Typography>

        {/* Product Name */}
        <Typography variant="h6" component="h3" noWrap gutterBottom>
          {product.name}
        </Typography>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 40, overflow: 'hidden' }}>
          {product.description || 'No description'}
        </Typography>

        {/* Stock and Price Info */}
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Stock:</Typography>
            <Typography variant="body2" fontWeight="bold">
              {product.quantity} units
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Price:</Typography>
            <Typography variant="body2" fontWeight="bold" color="primary">
              AED {product.sellingPrice.toFixed(2)}
            </Typography>
          </Box>
        </Stack>

        {/* Category */}
        {product.categoryName && (
          <Chip
            label={product.categoryName}
            size="small"
            variant="outlined"
            sx={{ mb: 1 }}
          />
        )}
      </CardContent>

      {/* Actions */}
      <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
        <IconButton size="small" onClick={() => onAdjustStock(product)} title="Adjust Stock">
          <Inventory />
        </IconButton>
        <IconButton size="small" onClick={() => onEdit(product)} title="Edit">
          <Edit />
        </IconButton>
        <IconButton size="small" onClick={handleClick} title="More Actions">
          <MoreVert />
        </IconButton>
      </Box>

      {/* More Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => { onEdit(product); handleClose(); }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Product
        </MenuItem>
        <MenuItem onClick={() => { onAdjustStock(product); handleClose(); }}>
          <Inventory fontSize="small" sx={{ mr: 1 }} />
          Adjust Stock
        </MenuItem>
        <MenuItem onClick={() => { onDelete(product); handleClose(); }} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete Product
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default ProductCard;