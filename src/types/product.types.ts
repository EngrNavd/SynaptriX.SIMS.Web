// ============================================
// PRODUCT CORE INTERFACES
// ============================================

/**
 * Base Product interface matching database entity
 */
export interface Product {
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
  stockQuantity: number;
  reservedQuantity: number;
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
  imageUrls?: string[];
  categoryId?: number;
  categoryName?: string;
  supplierId?: number;
  supplierName?: string;
  currency: string;
  status: 'Active' | 'Inactive' | 'Discontinued';
  isTaxable: boolean;
  taxRate: number;
  discountRate: number;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  tenantId?: string;
}

/**
 * Product DTO for API responses (extends base Product)
 */
export interface ProductDto extends Product {
  // Calculated fields for display
  totalValue: number;
  totalValueUSD: number;
  isLowStock: boolean;
  isOutOfStock: boolean;
  stockStatus: 'In Stock' | 'Low Stock' | 'Out of Stock';
  profitMargin: number;
  profitPerUnit: number;
  reorderSuggested: boolean;
  lastSoldDate?: string;
  monthlySales?: number;
}

/**
 * Create Product DTO for creating new products
 */
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
  supplierId?: number;
  currency: string;
  isTaxable?: boolean;
  taxRate?: number;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  tags?: string[];
  imageUrls?: string[];
}

/**
 * Update Product DTO for modifying existing products
 */
export interface UpdateProductDto {
  name?: string;
  description?: string;
  sellingPrice?: number;
  costPrice?: number;
  quantity?: number;
  stockAdjustment?: number;
  adjustmentReason?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  warranty?: string;
  warrantyDays?: number;
  manufacturer?: string;
  brand?: string;
  model?: string;
  color?: string;
  size?: string;
  location?: string;
  categoryId?: number;
  supplierId?: number;
  status?: 'Active' | 'Inactive' | 'Discontinued';
  isTaxable?: boolean;
  taxRate?: number;
  discountRate?: number;
  weight?: number;
  dimensions?: string;
  barcode?: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
  tags?: string[];
  imageUrls?: string[];
}

// ============================================
// PRODUCT LISTING & PAGINATION
// ============================================

/**
 * Paginated product list response
 */
export interface ProductListDto {
  products: ProductDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Pagination request parameters
 */
export interface PagedRequestDto {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  categoryId?: number;
  supplierId?: number;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  sortBy?: ProductSortField;
  sortOrder?: 'asc' | 'desc';
  lowStockOnly?: boolean;
  outOfStockOnly?: boolean;
}

/**
 * Product sortable fields
 */
export type ProductSortField = 
  | 'name'
  | 'sku'
  | 'sellingPrice'
  | 'quantity'
  | 'categoryName'
  | 'createdAt'
  | 'updatedAt'
  | 'totalValue';

// ============================================
// PRODUCT SEARCH & FILTERS
// ============================================

/**
 * Product search parameters for quick search (POS)
 */
export interface ProductSearchParams {
  searchTerm: string;
  categoryId?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
}

/**
 * Advanced product filter options
 */
export interface ProductFilter {
  categories?: number[];
  suppliers?: number[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  maxStock?: number;
  status?: string[];
  tags?: string[];
  location?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// ============================================
// STOCK MANAGEMENT
// ============================================

/**
 * Stock update request for single product
 */
export interface UpdateStockRequest {
  productId: string;
  quantity: number;
  adjustment: number;
  reason: string;
  referenceType?: 'Purchase' | 'Sale' | 'Adjustment' | 'Return' | 'Damage';
  referenceId?: string;
  notes?: string;
}

/**
 * Bulk stock update request
 */
export interface BulkStockUpdateRequest {
  updates: UpdateStockRequest[];
  batchNumber?: string;
  adjustmentDate: string;
}

/**
 * Stock movement record
 */
export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  previousQuantity: number;
  newQuantity: number;
  adjustment: number;
  reason: string;
  referenceType: string;
  referenceId?: string;
  adjustedBy: string;
  adjustedAt: string;
  notes?: string;
}

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Product statistics for dashboard
 */
export interface ProductStats {
  totalProducts: number;
  totalValue: number;
  totalValueUSD: number;
  lowStockCount: number;
  outOfStockCount: number;
  averageStockValue: number;
  totalCategories: number;
  topSellingProducts: ProductSaleStat[];
  lowStockProducts: ProductDto[];
  recentStockMovements: StockMovement[];
  categoryDistribution: CategoryDistribution[];
}

/**
 * Product sales statistics
 */
export interface ProductSaleStat {
  productId: string;
  productName: string;
  sku: string;
  totalSold: number;
  totalRevenue: number;
  profit: number;
  averageSalePrice: number;
  lastSoldDate: string;
}

/**
 * Category distribution for statistics
 */
export interface CategoryDistribution {
  categoryId: number;
  categoryName: string;
  productCount: number;
  totalValue: number;
  percentage: number;
}

/**
 * Inventory valuation report
 */
export interface InventoryValuation {
  totalValue: number;
  totalValueUSD: number;
  categoryBreakdown: Array<{
    categoryId: number;
    categoryName: string;
    value: number;
    valueUSD: number;
    percentage: number;
  }>;
  stockStatusBreakdown: {
    inStock: { count: number; value: number };
    lowStock: { count: number; value: number };
    outOfStock: { count: number; value: number };
  };
}

// ============================================
// PRODUCT CATEGORIES
// ============================================

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  parentCategoryId?: number;
  parentCategoryName?: string;
  productCount: number;
  totalValue: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  parentCategoryId?: number;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  parentCategoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
  timestamp?: string;
  statusCode?: number;
}

/**
 * Paginated API response
 */
export interface PagedApiResponse<T> extends ApiResponse<T> {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// ============================================
// EXPORT ALL TYPES
// ============================================

export type {
  // Core
  Product,
  ProductDto,
  CreateProductDto,
  UpdateProductDto,
  
  // Listing
  ProductListDto,
  PagedRequestDto,
  ProductSortField,
  
  // Search & Filters
  ProductSearchParams,
  ProductFilter,
  
  // Stock Management
  UpdateStockRequest,
  BulkStockUpdateRequest,
  StockMovement,
  
  // Statistics
  ProductStats,
  ProductSaleStat,
  CategoryDistribution,
  InventoryValuation,
  
  // Categories
  ProductCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  
  // API Responses
  ApiResponse,
  PagedApiResponse
};