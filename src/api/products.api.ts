import { api } from './index';
import type { Product, ProductDto, CreateProductDto, UpdateProductDto } from '../types/product.types';
import type { ApiResponse, PaginatedResponse } from '../types/api.types';

// Define product search parameters
interface ProductSearchParams {
  searchTerm?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  lowStockOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Define product statistics interface
interface ProductStatistics {
  totalProducts: number;
  outOfStock: number;
  lowStock: number;
  totalInventoryValue: number;
  categories: Array<{
    name: string;
    count: number;
    value: number;
  }>;
}

// Get products with pagination and filtering
export const getProducts = async (
  params?: ProductSearchParams
): Promise<ApiResponse<PaginatedResponse<Product>>> => {
  try {
    console.log('[Products API] Fetching products with params:', params);
    
    const response = await api.get<ApiResponse<PaginatedResponse<Product>>>('/products', { 
      params: {
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        searchTerm: params?.searchTerm,
        category: params?.category,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        inStockOnly: params?.inStockOnly,
        lowStockOnly: params?.lowStockOnly,
        sortBy: params?.sortBy || 'name',
        sortOrder: params?.sortOrder || 'asc'
      }
    });
    
    console.log('[Products API] Products fetched successfully');
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error fetching products:', error);
    
    // Return consistent error response
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch products',
      data: {
        items: [],
        totalCount: 0,
        page: params?.page || 1,
        pageSize: params?.pageSize || 20,
        totalPages: 0
      },
      errors: error.response?.data?.errors || ['Network error']
    };
  }
};

// Get product by ID
export const getProduct = async (id: number): Promise<ApiResponse<Product>> => {
  try {
    console.log(`[Products API] Fetching product ${id}`);
    
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    console.log(`[Products API] Product ${id} fetched successfully`);
    
    return response.data;
  } catch (error: any) {
    console.error(`[Products API] Error fetching product ${id}:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || `Failed to fetch product ${id}`,
      data: {} as Product,
      errors: error.response?.data?.errors || ['Product not found']
    };
  }
};

// Create new product
export const createProduct = async (product: CreateProductDto): Promise<ApiResponse<Product>> => {
  try {
    console.log('[Products API] Creating product:', product.name);
    
    const response = await api.post<ApiResponse<Product>>('/products', product);
    console.log('[Products API] Product created successfully:', response.data.data?.id);
    
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error creating product:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create product',
      data: {} as Product,
      errors: error.response?.data?.errors || ['Validation failed']
    };
  }
};

// Update product
export const updateProduct = async (
  id: number, 
  product: UpdateProductDto
): Promise<ApiResponse<Product>> => {
  try {
    console.log(`[Products API] Updating product ${id}`);
    
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
    console.log(`[Products API] Product ${id} updated successfully`);
    
    return response.data;
  } catch (error: any) {
    console.error(`[Products API] Error updating product ${id}:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || `Failed to update product ${id}`,
      data: {} as Product,
      errors: error.response?.data?.errors || ['Update failed']
    };
  }
};

// Delete product
export const deleteProduct = async (id: number): Promise<ApiResponse<void>> => {
  try {
    console.log(`[Products API] Deleting product ${id}`);
    
    const response = await api.delete<ApiResponse<void>>(`/products/${id}`);
    console.log(`[Products API] Product ${id} deleted successfully`);
    
    return response.data;
  } catch (error: any) {
    console.error(`[Products API] Error deleting product ${id}:`, error);
    
    return {
      success: false,
      message: error.response?.data?.message || `Failed to delete product ${id}`,
      data: undefined,
      errors: error.response?.data?.errors || ['Delete failed']
    };
  }
};

// Search products (quick search for POS)
export const searchProducts = async (
  searchTerm: string, 
  limit: number = 20
): Promise<ApiResponse<Product[]>> => {
  try {
    if (!searchTerm || searchTerm.trim().length < 1) {
      return {
        success: true,
        message: 'Search term is empty',
        data: []
      };
    }
    
    console.log(`[Products API] Searching products: "${searchTerm}"`);
    
    const response = await api.get<ApiResponse<Product[]>>('/products/search', {
      params: {
        term: searchTerm.trim(),
        limit
      }
    });
    
    console.log(`[Products API] Found ${response.data.data?.length || 0} products`);
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error searching products:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to search products',
      data: [],
      errors: error.response?.data?.errors || ['Search failed']
    };
  }
};

// Get inventory value
export const getInventoryValue = async (): Promise<ApiResponse<number>> => {
  try {
    console.log('[Products API] Getting inventory value');
    
    const response = await api.get<ApiResponse<number>>('/products/inventory/value');
    console.log('[Products API] Inventory value retrieved:', response.data.data);
    
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error getting inventory value:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get inventory value',
      data: 0,
      errors: error.response?.data?.errors || ['Calculation failed']
    };
  }
};

// Get low stock products
export const getLowStockProducts = async (
  threshold: number = 10
): Promise<ApiResponse<Product[]>> => {
  try {
    console.log(`[Products API] Getting low stock products (threshold: ${threshold})`);
    
    const response = await api.get<ApiResponse<Product[]>>('/products/low-stock', {
      params: { threshold }
    });
    
    console.log(`[Products API] Found ${response.data.data?.length || 0} low stock products`);
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error getting low stock products:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get low stock products',
      data: [],
      errors: error.response?.data?.errors || ['Request failed']
    };
  }
};

// Get out of stock products
export const getOutOfStockProducts = async (): Promise<ApiResponse<Product[]>> => {
  try {
    console.log('[Products API] Getting out of stock products');
    
    const response = await api.get<ApiResponse<Product[]>>('/products/out-of-stock');
    console.log(`[Products API] Found ${response.data.data?.length || 0} out of stock products`);
    
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error getting out of stock products:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get out of stock products',
      data: [],
      errors: error.response?.data?.errors || ['Request failed']
    };
  }
};

// Get product statistics
export const getProductStatistics = async (): Promise<ApiResponse<ProductStatistics>> => {
  try {
    console.log('[Products API] Getting product statistics');
    
    const response = await api.get<ApiResponse<ProductStatistics>>('/products/statistics');
    console.log('[Products API] Product statistics retrieved');
    
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error getting product statistics:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get product statistics',
      data: {
        totalProducts: 0,
        outOfStock: 0,
        lowStock: 0,
        totalInventoryValue: 0,
        categories: []
      },
      errors: error.response?.data?.errors || ['Request failed']
    };
  }
};

// Bulk update product stock
export const bulkUpdateStock = async (
  updates: Array<{ productId: number; quantity: number; reason?: string }>
): Promise<ApiResponse<void>> => {
  try {
    console.log(`[Products API] Bulk updating stock for ${updates.length} products`);
    
    const response = await api.post<ApiResponse<void>>('/products/bulk/update-stock', { updates });
    console.log('[Products API] Bulk stock update completed');
    
    return response.data;
  } catch (error: any) {
    console.error('[Products API] Error in bulk stock update:', error);
    
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update stock',
      data: undefined,
      errors: error.response?.data?.errors || ['Bulk update failed']
    };
  }
};

// Export all methods
export const productsApi = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getInventoryValue,
  getLowStockProducts,
  getOutOfStockProducts,
  getProductStatistics,
  bulkUpdateStock,
};

export type {
  Product,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  ProductSearchParams,
  ProductStatistics
};