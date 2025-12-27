import { api } from './index';
import { Product } from '../types';
import { ApiResponse } from '../types/api';

// Get products - SIMPLER VERSION
export const getProducts = async (params?: any): Promise<any> => {
  try {
    console.log('🔧 getProducts called with params:', params);
    
    // Try different endpoint structures
    const response = await api.get('/products', { params });
    console.log('🔧 getProducts response:', response.data);
    
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
    console.error('❌ getProducts error:', error);
    console.error('❌ Error status:', error.response?.status);
    console.error('❌ Error data:', error.response?.data);
    
    // Return empty structure to prevent crash
    return {
      products: [],
      totalCount: 0,
      page: 1,
      pageSize: 10
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