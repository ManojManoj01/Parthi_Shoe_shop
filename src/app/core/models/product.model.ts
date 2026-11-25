export interface ProductColor {
  name: string;
  hex?: string;
}

export interface Product {
  id: number | string;
  name: string;
  sku?: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  availableSizes: string[] | number[];
  availableColors: string[];
  stockQuantity: number;
  imageUrl?: string;
  additionalImages?: string[];
  discountPercentage?: number;
  rating?: number;
  active: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequest {
  name: string;
  sku?: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  availableSizes: string[];
  availableColors: string[];
  stockQuantity: number;
  imageUrl?: string;
  additionalImages?: string[];
  discountPercentage?: number;
  rating?: number;
  active: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
}

export interface ProductPageResponse {
  content: Product[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  active: boolean;
  productCount?: number;
  itemCount?: number;
  stockCount?: number;
}

export interface CategoryRequest {
  name: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalShoes: number;
  totalChappalsAndSlippers: number;
  totalCategories: number;
  lowStockCount: number;
  chappalsInStock: number;
  overallTotalStock?: number;
  totalStockValue?: number;
  totalInventoryValue?: number;
  inStockCount?: number;
  outOfStockCount?: number;
}

export interface ImageUploadResponse {
  imageUrl: string;
  message: string;
}
