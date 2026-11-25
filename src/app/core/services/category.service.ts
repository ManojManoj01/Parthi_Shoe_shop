import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category, CategoryRequest, Product } from '../models/product.model';
import {
  getAllCategoriesMerged,
  addCustomCategory,
  removeCustomCategory,
  calculateCategoryCounts,
  isCategoryDeactivated
} from './category-storage';

@Injectable({
  providedIn: 'root'
})
export class AdminCategoryService {
  private http = inject(HttpClient);
  private categoriesApiUrl = `${environment.apiUrl}/categories`;

  // Reactive BehaviorSubject so all components (Add Product, Category List, etc.) update instantly
  private categoriesSubject = new BehaviorSubject<Category[]>(getAllCategoriesMerged());
  public categories$ = this.categoriesSubject.asObservable();

  /**
   * Returns merged categories from local cache/defaults synchronously with 0ms latency.
   */
  public getLocalCategories(): Category[] {
    const list = getAllCategoriesMerged();
    this.categoriesSubject.next(list);
    return list;
  }

  public getCategories(all: boolean = true): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesApiUrl, {
      params: { all: String(all) }
    }).pipe(
      timeout(2500),
      map(backendList => {
        const localAll = getAllCategoriesMerged();
        if (!backendList || backendList.length === 0) {
          this.categoriesSubject.next(localAll);
          return localAll;
        }
        // Merge backend categories with custom local categories
        const merged = [...backendList];
        for (const local of localAll) {
          const exists = merged.some(
            b => (b.slug && local.slug && b.slug.toLowerCase() === local.slug.toLowerCase()) ||
                 (b.name && local.name && b.name.toLowerCase() === local.name.toLowerCase())
          );
          if (!exists) {
            merged.push(local);
          }
        }
        const filtered = merged.filter(c => !isCategoryDeactivated(c) && c.active !== false);
        this.categoriesSubject.next(filtered);
        return filtered;
      }),
      catchError(() => {
        // Backend offline / slow fallback - returns default + custom categories immediately
        const fallback = getAllCategoriesMerged();
        this.categoriesSubject.next(fallback);
        return of(fallback);
      })
    );
  }

  public createCategory(request: CategoryRequest): Observable<Category> {
    // 1. Instantly save to local storage & cookie (0ms latency)
    const localCat = addCustomCategory(request);

    // 2. Immediately notify all subscribers (including Add Product dropdown)
    const updated = getAllCategoriesMerged();
    this.categoriesSubject.next(updated);

    // 3. Optimistically sync to backend in background so UI is never blocked by database/network lag
    this.http.post<Category>(this.categoriesApiUrl, request).pipe(
      timeout(3000),
      catchError(err => {
        console.warn('Backend category sync skipped/offline, stored safely in browser:', err);
        return of(localCat);
      })
    ).subscribe();

    // 4. Return the saved category immediately
    return of(localCat);
  }

  public deleteCategory(categoryOrId: Category | number | string): Observable<void> {
    // 1. Instantly remove locally
    removeCustomCategory(categoryOrId);
    this.categoriesSubject.next(getAllCategoriesMerged());

    // 2. Sync deletion to backend in background
    const id = typeof categoryOrId === 'object' && categoryOrId !== null ? categoryOrId.id : categoryOrId;
    if (id) {
      this.http.delete<void>(`${this.categoriesApiUrl}/${id}`).pipe(
        timeout(3000),
        catchError(() => of(void 0))
      ).subscribe();
    }

    return of(void 0);
  }

  public computeCategoryCounts(categories: Category[], products: Product[]): Category[] {
    return calculateCategoryCounts(categories, products);
  }
}
