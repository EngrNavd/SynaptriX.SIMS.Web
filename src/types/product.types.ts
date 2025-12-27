// Remove or comment out ProductStats since we're not using it anymore
// Or keep it if you want but update the calculation

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
  warranty: string;
  warrantyDays?: number;
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
  warranty: string;
  warrantyDays?: number;
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
  warranty?: string;
  warrantyDays?: number;
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

// Optional: Keep ProductStats but it won't be fetched from API
export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  totalValueUSD: number;
  lowStockCount: number;
  outOfStockCount: number;
}