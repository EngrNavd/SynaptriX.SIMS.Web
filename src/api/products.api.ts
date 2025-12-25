import axios from 'axios';
import { 
  ProductDto, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductListDto, 
  PagedRequestDto,
  UpdateStockRequest,
  ProductStats 
} from '../types/product.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const productsApi = {
  // Get all products with pagination
  getProducts: async (params: PagedRequestDto): Promise<ProductListDto> => {
    const response = await axios.get<ApiResponse<ProductListDto>>(`${API_BASE_URL}/products`, {
      params,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data.data;
  },

  // Get single product
  getProductById: async (id: string): Promise<ProductDto> => {
    const response = await axios.get<ApiResponse<ProductDto>>(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
    return response.data.data;
  },

  // Create product
  createProduct: async (productData: CreateProductDto): Promise<ProductDto> => {
    const response = await axios.post<ApiResponse<ProductDto>>(
      `${API_BASE_URL}/products`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data;
  },

  // Update product
  updateProduct: async (id: string, productData: UpdateProductDto): Promise<ProductDto> => {
    const response = await axios.put<ApiResponse<ProductDto>>(
      `${API_BASE_URL}/products/${id}`,
      productData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.data;
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await axios.delete<ApiResponse<void>>(`${API_BASE_URL}/products/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });
  },

  // Get low stock products
  getLowStockProducts: async (): Promise<ProductDto[]> => {
    const response = await axios.get<ApiResponse<ProductDto[]>>(
      `${API_BASE_URL}/products/low-stock`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Search products
  searchProducts: async (term: string): Promise<ProductDto[]> => {
    const response = await axios.get<ApiResponse<ProductDto[]>>(
      `${API_BASE_URL}/products/search`,
      {
        params: { term },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data;
  },

  // Get inventory value
  getInventoryValue: async (): Promise<number> => {
    const response = await axios.get<ApiResponse<{ totalValue: number }>>(
      `${API_BASE_URL}/products/inventory-value`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      }
    );
    return response.data.data.totalValue;
  },

  // Update stock
  updateStock: async (id: string, quantity: number, reason: string): Promise<void> => {
    await axios.post<ApiResponse<void>>(
      `${API_BASE_URL}/products/${id}/update-stock`,
      { quantity, reason },
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      }
    );
  },

  // Get product statistics
  getProductStats: async (): Promise<ProductStats> => {
    const [productsResponse, valueResponse, lowStockResponse] = await Promise.all([
      axios.get<ApiResponse<ProductListDto>>(`${API_BASE_URL}/products`, {
        params: { page: 1, pageSize: 1 },
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      }),
      this.getInventoryValue(),
      this.getLowStockProducts()
    ]);

    const allProducts = await this.getProducts({ page: 1, pageSize: 1000 });
    const outOfStock = allProducts.products.filter(p => p.quantity === 0);

    return {
      totalProducts: productsResponse.data.data.totalCount,
      totalValue: valueResponse,
      totalValueUSD: valueResponse * 0.27, // Convert AED to USD (approximate)
      lowStockCount: lowStockResponse.length,
      outOfStockCount: outOfStock.length
    };
  }
};

export default productsApi;