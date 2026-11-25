import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductRequest,
  ProductPageResponse,
  DashboardStats,
  ImageUploadResponse
} from '../models/product.model';
import {
  isProductFeatured,
  isProductBestSeller,
  toggleProductFeatured,
  toggleProductBestSeller
} from './showcase-storage';
import { clearStoredProducts, isJunkProduct, isProductDeleted, markProductAsDeleted } from './fallback-products';

export interface AdminProductFilterParams {
  category?: string;
  active?: boolean;
  search?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export interface OverallStockMetrics {
  overallTotalStock: number;
  totalStockValue: number;
  totalInventoryValue?: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalProductsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminProductService {
  private http = inject(HttpClient);

  // Base API URL stripped of any trailing '/api' to avoid duplicate paths like /api/api/...
  private apiUrl = (environment.apiUrl || 'http://localhost:8080').replace(/\/api\/?$/, '');
  private productsApiUrl = `${this.apiUrl}/api/products`;
  private adminApiUrl = `${this.apiUrl}/api/admin`;

  public calculateOverallStockMetrics(products: Product[]): OverallStockMetrics {
    const list = (products || []).filter(p => !isJunkProduct(p) && !isProductDeleted(p?.id));
    let overallTotalStock = 0;
    let totalStockValue = 0;
    let totalInventoryValue = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const prod of list) {
      const qty = Number(prod.stockQuantity) || 0;
      const price = Number(prod.price) || 0;

      overallTotalStock += qty;
      totalStockValue += price;
      totalInventoryValue += price;

      if (qty <= 0) {
        outOfStockCount++;
      } else if (qty < 10) {
        lowStockCount++;
        inStockCount++;
      } else {
        inStockCount++;
      }
    }

    return {
      overallTotalStock,
      totalStockValue,
      totalInventoryValue,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalProductsCount: list.length
    };
  }

  public getEnrichedProducts(): Product[] {
    return [];
  }

  public getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.adminApiUrl}/stats`).pipe(
      catchError(() => this.http.get<DashboardStats>(`${this.apiUrl}/api/dashboard/stats`)),
      map(stats => ({
        totalProducts: Number(stats?.totalProducts ?? 0),
        totalShoes: Number(stats?.totalShoes ?? 0),
        totalChappalsAndSlippers: Number(stats?.totalChappalsAndSlippers ?? 0),
        totalCategories: Number(stats?.totalCategories ?? 0),
        lowStockCount: Number(stats?.lowStockCount ?? 0),
        chappalsInStock: Number(stats?.chappalsInStock ?? 0),
        overallTotalStock: Number((stats as any)?.overallTotalStock ?? 0),
        totalStockValue: Number((stats as any)?.totalStockValue ?? 0),
        totalInventoryValue: Number((stats as any)?.totalStockValue ?? 0),
        inStockCount: Number((stats as any)?.inStockCount ?? 0),
        outOfStockCount: Number((stats as any)?.outOfStockCount ?? 0)
      })),
      catchError(err => {
        console.warn('Backend stats endpoint unavailable:', err);
        return of({
          totalProducts: 0,
          totalShoes: 0,
          totalChappalsAndSlippers: 0,
          totalCategories: 0,
          lowStockCount: 0,
          chappalsInStock: 0,
          overallTotalStock: 0,
          totalStockValue: 0,
          totalInventoryValue: 0,
          inStockCount: 0,
          outOfStockCount: 0
        });
      })
    );
  }

  public getAdminProducts(params: AdminProductFilterParams): Observable<ProductPageResponse> {
    let httpParams = new HttpParams()
      .set('page', String(params.page ?? 0))
      .set('size', String(params.size ?? 15))
      .set('sortBy', params.sortBy ?? 'id')
      .set('direction', params.direction ?? 'desc');

    if (params.category && params.category !== 'all') {
      httpParams = httpParams.set('category', params.category);
    }
    if (params.active !== undefined && params.active !== null) {
      httpParams = httpParams.set('active', String(params.active));
    }
    if (params.search && params.search.trim()) {
      httpParams = httpParams.set('search', params.search.trim());
    }

    clearStoredProducts();

    return this.http.get<ProductPageResponse>(`${this.adminApiUrl}/products`, { params: httpParams }).pipe(
      timeout(5000),
      catchError(() => this.http.get<ProductPageResponse>(this.productsApiUrl, { params: httpParams }).pipe(timeout(5000))),
      map(res => {
        if (res && Array.isArray(res.content)) {
          res.content = res.content
            .filter(p => !isJunkProduct(p) && !isProductDeleted(p?.id))
            .map(p => this.enrichProduct(p));
        }
        return res || {
          content: [],
          pageNumber: params.page ?? 0,
          pageSize: params.size ?? 15,
          totalElements: 0,
          totalPages: 0,
          last: true
        };
      }),
      catchError(err => {
        console.warn('Backend products endpoint unavailable:', err);
        return of({
          content: [],
          pageNumber: params.page ?? 0,
          pageSize: params.size ?? 15,
          totalElements: 0,
          totalPages: 0,
          last: true
        });
      })
    );
  }

  public getProductById(id: number | string): Observable<Product> {
    return this.http.get<Product>(`${this.productsApiUrl}/${id}`).pipe(
      map(p => this.enrichProduct(p)),
      catchError(() => of({} as Product))
    );
  }

  public enrichProduct(product: Product): Product {
    if (!product || !product.id) return product;
    const id = String(product.id);
    return {
      ...product,
      isFeatured: product.isFeatured === true || isProductFeatured(id),
      isBestSeller: product.isBestSeller === true || isProductBestSeller(id)
    };
  }

  public toggleFeatured(id: number | string): boolean {
    return toggleProductFeatured(id);
  }

  public toggleBestSeller(id: number | string): boolean {
    return toggleProductBestSeller(id);
  }

  public setProductShowcase(id: number | string, isFeatured: boolean, isBestSeller: boolean): void {
    toggleProductFeatured(id, isFeatured);
    toggleProductBestSeller(id, isBestSeller);
  }

  /**
   * Sanitizes the product payload before sending it to the backend REST API
   * (ProductRequestDto), stripping UI showcase flags and internal IDs to prevent
   * Jackson "Unrecognized field" deserialization errors.
   */
  private prepareBackendPayload(product: ProductRequest): Record<string, any> {
    if (!product) return {};
    const { isFeatured, isBestSeller, id, createdAt, updatedAt, ...backendPayload } = (product as any);
    return backendPayload;
  }

  public createProduct(product: ProductRequest): Observable<Product> {
    const isFeatured = product?.isFeatured;
    const isBestSeller = product?.isBestSeller;
    const payload = this.prepareBackendPayload(product);

    return this.http.post<Product>(`${this.apiUrl}/api/admin/products`, payload).pipe(
      catchError(() => this.http.post<Product>(`${this.apiUrl}/api/products`, payload)),
      map(created => {
        if (created && created.id) {
          if (isFeatured !== undefined || isBestSeller !== undefined) {
            this.setProductShowcase(created.id, !!isFeatured, !!isBestSeller);
          }
        }
        return this.enrichProduct(created);
      })
    );
  }

  public updateProduct(id: number | string, product: ProductRequest): Observable<Product> {
    const isFeatured = product?.isFeatured;
    const isBestSeller = product?.isBestSeller;
    const payload = this.prepareBackendPayload(product);

    return this.http.put<Product>(`${this.apiUrl}/api/admin/products/${id}`, payload).pipe(
      catchError(() => this.http.put<Product>(`${this.apiUrl}/api/products/${id}`, payload)),
      map(updated => {
        if (isFeatured !== undefined || isBestSeller !== undefined) {
          this.setProductShowcase(id, !!isFeatured, !!isBestSeller);
        }
        return this.enrichProduct(updated);
      })
    );
  }

  public deleteProduct(id: number | string): Observable<void> {
    clearStoredProducts();
    markProductAsDeleted(id);
    return this.http.delete<void>(`${this.apiUrl}/api/admin/products/${id}`).pipe(
      catchError(() => this.http.delete<void>(`${this.apiUrl}/api/products/${id}`)),
      map(() => void 0)
    );
  }

  public toggleStatus(id: number | string, active: boolean): Observable<Product> {
    return this.http.patch<Product>(`${this.apiUrl}/api/products/${id}/status`, { active });
  }

  public uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.apiUrl}/api/admin/products/upload-image`, formData).pipe(
      catchError(() => this.http.post<ImageUploadResponse>(`${this.apiUrl}/api/products/upload-image`, formData))
    );
  }

  public uploadProductImage(id: number | string, file: File): Observable<Product> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Product>(`${this.productsApiUrl}/${id}/image`, formData);
  }

  public formatImageUrl(url?: string | null): string {
    if (!url || !url.trim()) {
      return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80';
    }
    const trimmed = url.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
      return trimmed;
    }
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    return `http://localhost:8080${cleanPath}`;
  }
}
