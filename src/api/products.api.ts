import { api } from './index';

// Define Product interface locally since it's not exported from '../types'
interface Product {
  id: number;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  cost?: number;
  quantity: number;
  category?: string;
  status?: string;
  barcode?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  location?: string;
  supplier?: string;
  weight?: number;
  dimensions?: string;
  expiryDate?: string;
  batchNumber?: string;
  taxRate?: number;
  discountRate?: number;
  imageUrl?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  isActive?: boolean;
  tenantId?: string;
}

// Define ApiResponse interface locally
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

// Get products - SIMPLER VERSION
export const getProducts = async (params?: any): Promise<any> => {
  try {
    console.log('getProducts called with params:', params);
    
    // Try different endpoint structures
    const response = await api.get('/products', { params });
    console.log('getProducts response:', response.data);
    
    // Handle different response structures
    if (response.data.data) {
      // If response has data property
      return response.data.data;
    } else if (response.data.products) {
      // If response has products property
      return response.data;
    } else {
      // Raw response
      return response.data;
    }
  } catch (error: any) {
    console.error('getProducts error:', error);
    console.error('Error status:', error.response?.status);
    console.error('Error data:', error.response?.data);
    
    // Return empty structure to prevent crash
    return {
      products: [],
      totalCount: 0,
      page: 1,
      pageSize: 10
    };
  }
};

// ADD MISSING METHODS that were causing errors
export const getInventoryValue = async (): Promise<ApiResponse<number>> => {
  try {
    const response = await api.get('/products/inventory-value');
    
    // Handle response structure
    if (response.data.data !== undefined) {
      return response.data;
    }
    
    // Return success response with default structure
    return {
      success: true,
      message: 'Inventory value retrieved',
      data: response.data.value || response.data.totalValue || 0,
      errors: []
    };
  } catch (error: any) {
    console.error('Error getting inventory value:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get inventory value',
      data: 0,
      errors: error.response?.data?.errors || []
    };
  }
};

export const getLowStockProducts = async (threshold: number = 10): Promise<ApiResponse<any[]>> => {
  try {
    const response = await api.get('/products/low-stock', {
      params: { threshold }
    });
    
    // Handle response structure
    if (response.data.data) {
      return response.data;
    }
    
    // Return success response with default structure
    return {
      success: true,
      message: 'Low stock products retrieved',
      data: response.data.products || response.data || [],
      errors: []
    };
  } catch (error: any) {
    console.error('Error getting low stock products:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to get low stock products',
      data: [],
      errors: error.response?.data?.errors || []
    };
  }
};

// Search products - SIMPLER
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }
    
    const response = await api.get(`/products/search?term=${encodeURIComponent(searchTerm.trim())}`);
    
    // Handle response structure
    if (response.data.data) {
      return response.data.data;
    }
    return response.data;
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
};

// Other functions remain similar but simpler
export const getProduct = async (id: number): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

export const createProduct = async (product: Partial<Product>): Promise<Product | null> => {
  try {
    const response = await api.post('/products', product);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product | null> => {
  try {
    const response = await api.put(`/products/${id}`, product);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    return null;
  }
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`/products/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    return false;
  }
};

// Export all methods together
export const productsApi = {
  getProducts,
  getInventoryValue,
  getLowStockProducts,
  searchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};