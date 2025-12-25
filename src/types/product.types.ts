export interface ProductDto {
  id: string;
  sku: string;
  name: string;
  description: string;
  purchasePrice: number;
  purchasePriceUSD: number;
  sellingPrice: number;
  sellingPriceUSD: number;
  costPrice: number;
  costPriceUSD: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  manufacturer?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  location?: string;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  currency: string;
  createdAt: string;
}

export interface CreateProductDto {
  sku: string;
  name: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  costPrice: number;
  quantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  manufacturer?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  location?: string;
  categoryId?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  sellingPrice?: number;
  quantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  location?: string;
  categoryId?: number;
}

export interface ProductListDto {
  products: ProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface PagedRequestDto {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface UpdateStockRequest {
  productId: string;
  quantity: number;
  reason: string;
}

export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  totalValueUSD: number;
  lowStockCount: number;
  outOfStockCount: number;
}