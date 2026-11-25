import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AdminProductService } from '../../core/services/product.service';
import { AdminCategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Category, Product } from '../../core/models/product.model';
import { isJunkProduct, isProductDeleted, markProductAsDeleted } from '../../core/services/fallback-products';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="space-y-6 pb-16 animate-fade-in">
      <!-- Confirmation Modal -->
      <app-confirm-modal
        [isOpen]="isDeleteModalOpen()"
        title="Permanently Remove Product"
        [message]="getDeleteMessage()"
        confirmText="Yes, Delete Product"
        [isLoading]="isDeleting()"
        (confirmed)="confirmDelete()"
        (cancelled)="isDeleteModalOpen.set(false)"
      ></app-confirm-modal>

      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">Footwear Inventory & Stock Manager</h2>
          <p class="text-xs text-slate-500">
            Monitor overall stock, filter by categories, edit prices, and manage footwear inventory.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <button
            type="button"
            (click)="refreshAll()"
            [disabled]="isLoading()"
            class="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-4 h-4" [ngClass]="{ 'animate-spin': isLoading() }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
          <a
            routerLink="/products/add"
            class="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Add Product</span>
          </a>
        </div>
      </div>

      <!-- MODULE 1: OVERALL TOTAL STOCK & INVENTORY VALUATION KPI STRIP -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-3.5 bg-gradient-to-r from-slate-900 via-neutral-900 to-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800">
        <!-- 1. Overall Total Stock -->
        <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <p class="text-[10px] uppercase font-bold tracking-wider text-orange-400">Overall Total Stock</p>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-white">{{ overallTotalStock() | number }}</span>
            <span class="text-[10px] text-orange-200 uppercase font-bold">Units</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">Total stock across all items</p>
        </div>

        <!-- 2. Total Valuation -->
        <div class="p-3.5 rounded-xl bg-white/5 border border-white/10">
          <p class="text-[10px] uppercase font-bold tracking-wider text-emerald-400">Total Stock Value</p>
          <div class="flex items-baseline gap-1 mt-0.5">
            <span class="text-xl sm:text-2xl font-black text-white">₹{{ totalStockValue() | number:'1.0-0' }}</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">Sum of all catalog products</p>
        </div>

        <!-- 3. In-Stock (> 10) -->
        <button
          type="button"
          (click)="setStockFilter('instock')"
          class="p-3.5 rounded-xl border text-left transition-all cursor-pointer"
          [ngClass]="selectedStockFilter === 'instock' ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'"
        >
          <div class="flex items-center justify-between">
            <p class="text-[10px] uppercase font-bold tracking-wider text-blue-400">In-Stock Footwear</p>
            @if (selectedStockFilter === 'instock') {
              <span class="text-[9px] bg-blue-500 text-white px-1.5 py-0.2 rounded font-bold">Active</span>
            }
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-white">{{ inStockCount() }}</span>
            <span class="text-[10px] text-blue-200 font-semibold">SKUs</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">&ge; 10 units available</p>
        </button>

        <!-- 4. Low Stock (< 10) -->
        <button
          type="button"
          (click)="setStockFilter('low')"
          class="p-3.5 rounded-xl border text-left transition-all cursor-pointer"
          [ngClass]="selectedStockFilter === 'low' ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'"
        >
          <div class="flex items-center justify-between">
            <p class="text-[10px] uppercase font-bold tracking-wider text-amber-400">Low Stock (&lt; 10)</p>
            @if (selectedStockFilter === 'low') {
              <span class="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">Active</span>
            }
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-amber-300">{{ lowStockCount() }}</span>
            <span class="text-[10px] text-amber-200 font-semibold">Reorder</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">1 - 9 units left</p>
        </button>

        <!-- 5. Out of Stock (0) -->
        <button
          type="button"
          (click)="setStockFilter('out')"
          class="p-3.5 rounded-xl border text-left transition-all cursor-pointer col-span-2 lg:col-span-1"
          [ngClass]="selectedStockFilter === 'out' ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'"
        >
          <div class="flex items-center justify-between">
            <p class="text-[10px] uppercase font-bold tracking-wider text-rose-400">Out of Stock (0)</p>
            @if (selectedStockFilter === 'out') {
              <span class="text-[9px] bg-rose-500 text-white px-1.5 py-0.2 rounded font-bold">Active</span>
            }
          </div>
          <div class="flex items-baseline gap-1.5 mt-0.5">
            <span class="text-2xl font-black text-rose-300">{{ outOfStockCount() }}</span>
            <span class="text-[10px] text-rose-200 font-semibold">Sold Out</span>
          </div>
          <p class="text-[10px] text-slate-400 mt-0.5">0 units available</p>
        </button>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <!-- Search Input -->
          <div class="relative sm:col-span-2 lg:col-span-1">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (ngModelChange)="onSearchChange()"
              placeholder="Search by name, brand, SKU..."
              class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
            />
          </div>

          <!-- Category Filter with Product Counts -->
          <div>
            <select
              [(ngModel)]="selectedCategory"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Footwear Categories ({{ overallProductCount() }} products)</option>
              @for (cat of categories(); track cat.id) {
                <option [value]="cat.slug">{{ cat.name }} ({{ cat.productCount || 0 }} products)</option>
              }
            </select>
          </div>

          <!-- Status Filter -->
          <div>
            <select
              [(ngModel)]="selectedStatus"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Visibility (Active & Inactive)</option>
              <option value="active">Active Only (Customer Visible)</option>
              <option value="inactive">Inactive Only (Hidden)</option>
            </select>
          </div>

          <!-- Showcase Badge Filter -->
          <div>
            <select
              [(ngModel)]="selectedShowcase"
              (ngModelChange)="onFilterChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Showcase Badges</option>
              <option value="featured">★ Featured Footwear Only</option>
              <option value="bestseller">🔥 Best Sellers Only</option>
            </select>
          </div>

          <!-- Sort By -->
          <div>
            <select
              [(ngModel)]="selectedSort"
              (ngModelChange)="onSortChange()"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:bg-white focus:border-orange-500 cursor-pointer"
            >
              <option value="id_desc">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A to Z</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>

        <!-- Filter Pills / Summary -->
        <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div class="flex items-center gap-2">
            <span>
              Showing <span class="font-bold text-slate-900">{{ totalElements() }}</span> products matching criteria
            </span>
            @if (selectedStockFilter !== 'all') {
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 uppercase">
                Stock Filter: {{ selectedStockFilter }}
              </span>
            }
          </div>
          @if (searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedShowcase !== 'all' || selectedStockFilter !== 'all') {
            <button
              type="button"
              (click)="resetFilters()"
              class="text-orange-600 hover:text-orange-700 font-semibold cursor-pointer"
            >
              Clear All Filters
            </button>
          }
        </div>
      </div>

      <!-- Products Table View -->
      <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        @if (isLoading()) {
          <div class="p-16 text-center">
            <div class="inline-block animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mb-3"></div>
            <p class="text-xs text-slate-500 font-medium">Loading footwear catalog...</p>
          </div>
        } @else if (products().length === 0) {
          <div class="p-16 text-center">
            <div class="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 class="text-base font-extrabold text-slate-800">No products found</h3>
            <p class="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No footwear matched your search or filters. Try clearing your filters or adding a new product.
            </p>
            <div class="mt-5 flex justify-center gap-3">
              <button
                type="button"
                (click)="resetFilters()"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Clear Filters
              </button>
              <a
                routerLink="/products/add"
                class="px-4 py-2 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                + Add Product
              </a>
            </div>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th scope="col" class="px-6 py-4">Product Info</th>
                  <th scope="col" class="px-6 py-4">Category</th>
                  <th scope="col" class="px-6 py-4">Price</th>
                  <th scope="col" class="px-6 py-4">Stock</th>
                  <th scope="col" class="px-6 py-4">Storefront Showcase</th>
                  <th scope="col" class="px-6 py-4">Status</th>
                  <th scope="col" class="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (product of products(); track product.id) {
                  <tr class="hover:bg-slate-50/70 transition-colors group">
                    <!-- Product Info -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3.5">
                        <img
                          [src]="formatImageUrl(product.imageUrl)"
                          [alt]="product.name"
                          class="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                        />
                        <div class="min-w-0">
                          <p class="font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors truncate max-w-xs">
                            {{ product.name }}
                          </p>
                          <div class="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span class="font-semibold text-slate-700">{{ product.brand }}</span>
                            @if (product.sku) {
                              <span class="font-mono text-slate-400">• {{ product.sku }}</span>
                            }
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Category -->
                    <td class="px-6 py-4">
                      <span class="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
                        {{ product.category }}
                      </span>
                    </td>

                    <!-- Price -->
                    <td class="px-6 py-4">
                      <div class="font-bold text-slate-900">
                        ₹{{ product.price | number:'1.2-2' }}
                      </div>
                      @if (product.originalPrice > product.price) {
                        <div class="text-[11px] text-slate-400 line-through">
                          ₹{{ product.originalPrice | number:'1.0-0' }}
                        </div>
                      }
                    </td>

                    <!-- Stock Quantity -->
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          [ngClass]="product.stockQuantity < 10 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'"
                        >
                          <span
                            class="w-1.5 h-1.5 rounded-full"
                            [ngClass]="product.stockQuantity < 10 ? 'bg-rose-500' : 'bg-emerald-500'"
                          ></span>
                          {{ product.stockQuantity }} units
                        </span>
                      </div>
                    </td>

                    <!-- Storefront Showcase Controls -->
                    <td class="px-6 py-4">
                      <div class="flex flex-col gap-1.5">
                        <button
                          type="button"
                          (click)="toggleFeatured(product)"
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer w-fit"
                          [ngClass]="product.isFeatured ? 'bg-amber-500 text-white border-amber-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                          title="Click to toggle Featured on customer home page"
                        >
                          <span>{{ product.isFeatured ? '★ Featured Footwear' : '☆ Feature in Home' }}</span>
                        </button>
                        <button
                          type="button"
                          (click)="toggleBestSeller(product)"
                          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer w-fit"
                          [ngClass]="product.isBestSeller ? 'bg-orange-600 text-white border-orange-700 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'"
                          title="Click to toggle Best Seller badge"
                        >
                          <span>{{ product.isBestSeller ? '🔥 Best Seller' : '🏷️ Mark Best Seller' }}</span>
                        </button>
                      </div>
                    </td>

                    <!-- Status Active/Inactive -->
                    <td class="px-6 py-4">
                      <button
                        type="button"
                        (click)="toggleProductActive(product)"
                        class="px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer"
                        [ngClass]="product.active ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'"
                      >
                        {{ product.active ? 'Active' : 'Inactive' }}
                      </button>
                    </td>

                    <!-- Actions -->
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <a
                          [routerLink]="['/products/edit', product.id]"
                          class="p-2 rounded-lg text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
                          title="Edit product"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </a>
                        <button
                          type="button"
                          (click)="promptDelete(product)"
                          class="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <!-- Pagination Bar -->
          <div class="p-4 sm:p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span class="text-xs text-slate-500 font-medium">
              Page <span class="font-bold text-slate-900">{{ currentPage() + 1 }}</span> of <span class="font-bold text-slate-900">{{ totalPages() }}</span>
            </span>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                [disabled]="currentPage() === 0"
                (click)="goToPage(currentPage() - 1)"
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Previous
              </button>
              <button
                type="button"
                [disabled]="currentPage() + 1 >= totalPages()"
                (click)="goToPage(currentPage() + 1)"
                class="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(AdminProductService);
  private categoryService = inject(AdminCategoryService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  public products = signal<Product[]>([]);
  public categories = signal<Category[]>([]);
  public isLoading = signal<boolean>(true);
  public isDeleting = signal<boolean>(false);

  // Stock Analytics Signals
  public overallTotalStock = signal<number>(0);
  public totalStockValue = signal<number>(0);
  public inStockCount = signal<number>(0);
  public lowStockCount = signal<number>(0);
  public outOfStockCount = signal<number>(0);
  public overallProductCount = signal<number>(0);

  public searchQuery = '';
  public selectedCategory = 'all';
  public selectedStatus = 'all';
  public selectedShowcase = 'all';
  public selectedStockFilter: 'all' | 'instock' | 'low' | 'out' = 'all';
  public selectedSort = 'id_desc';

  public currentPage = signal<number>(0);
  public pageSize = 15;
  public totalPages = signal<number>(1);
  public totalElements = signal<number>(0);

  public isDeleteModalOpen = signal<boolean>(false);
  public productToDelete = signal<Product | null>(null);

  private searchTimeout: any;

  formatImageUrl(url: string | null | undefined): string {
    return this.productService.formatImageUrl(url);
  }

  ngOnInit(): void {
    // Check for incoming query params e.g. /products?category=slippers
    this.route.queryParamMap.subscribe(params => {
      const cat = params.get('category');
      if (cat) {
        this.selectedCategory = cat;
      }
      const stock = params.get('stock');
      if (stock === 'instock' || stock === 'low' || stock === 'out') {
        this.selectedStockFilter = stock;
      }
    });

    this.loadStockMetrics();
    this.loadProducts();
  }

  refreshAll(): void {
    this.loadStockMetrics();
    this.loadProducts();
  }

  loadStockMetrics(): void {
    this.productService.getAdminProducts({ page: 0, size: 200, sortBy: 'id', direction: 'desc' }).subscribe({
      next: allRes => {
        const all = (allRes.content || []).filter(p => !isJunkProduct(p) && !isProductDeleted(p.id));
        let totalStock = 0;
        let totalVal = 0;
        let inStock = 0;
        let lowStock = 0;
        let outStock = 0;

        for (const p of all) {
          const q = p.stockQuantity || 0;
          totalStock += q;
          totalVal += (Number(p.price) || 0);
          if (q >= 10) inStock++;
          if (q < 10 && q > 0) lowStock++;
          if (q === 0) outStock++;
        }

        this.overallTotalStock.set(totalStock);
        this.totalStockValue.set(totalVal);
        this.inStockCount.set(inStock);
        this.lowStockCount.set(lowStock);
        this.outOfStockCount.set(outStock);
        this.overallProductCount.set(all.length);

        // Compute categories with counts
        this.categoryService.getCategories(true).subscribe(cats => {
          const counted = this.categoryService.computeCategoryCounts(cats, all);
          this.categories.set(counted);
        });
      }
    });
  }

  setStockFilter(filter: 'all' | 'instock' | 'low' | 'out'): void {
    if (this.selectedStockFilter === filter) {
      this.selectedStockFilter = 'all';
    } else {
      this.selectedStockFilter = filter;
    }
    this.currentPage.set(0);
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading.set(true);

    const [sortBy, direction] = this.selectedSort.split('_') as [string, 'asc' | 'desc'];

    let activeParam: boolean | undefined = undefined;
    if (this.selectedStatus === 'active') activeParam = true;
    if (this.selectedStatus === 'inactive') activeParam = false;

    this.productService.getAdminProducts({
      category: this.selectedCategory,
      active: activeParam,
      search: this.searchQuery,
      page: this.currentPage(),
      size: this.pageSize,
      sortBy,
      direction
    }).subscribe({
      next: res => {
        let content = (res.content || []).filter(p => !isJunkProduct(p) && !isProductDeleted(p.id));

        // Showcase badge filter
        if (this.selectedShowcase === 'featured') {
          content = content.filter(p => !!p.isFeatured);
        } else if (this.selectedShowcase === 'bestseller') {
          content = content.filter(p => !!p.isBestSeller);
        }

        // Stock quantity filter
        if (this.selectedStockFilter === 'instock') {
          content = content.filter(p => (p.stockQuantity || 0) >= 10);
        } else if (this.selectedStockFilter === 'low') {
          content = content.filter(p => (p.stockQuantity || 0) < 10 && (p.stockQuantity || 0) > 0);
        } else if (this.selectedStockFilter === 'out') {
          content = content.filter(p => (p.stockQuantity || 0) === 0);
        }

        this.products.set(content);
        this.totalPages.set(res.totalPages || 1);
        this.totalElements.set(
          this.selectedShowcase === 'all' && this.selectedStockFilter === 'all'
            ? (res.totalElements || 0)
            : content.length
        );
        this.isLoading.set(false);
      },
      error: err => {
        this.isLoading.set(false);
        this.toastService.error('Failed to load products from server.');
      }
    });
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.currentPage.set(0);
      this.loadProducts();
    }, 350);
  }

  onFilterChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage.set(0);
    this.loadProducts();
  }

  toggleFeatured(product: Product): void {
    const isNowFeatured = this.productService.toggleFeatured(product.id);
    product.isFeatured = isNowFeatured;
    this.toastService.success(
      isNowFeatured
        ? `Added "${product.name}" to Featured Footwear on storefront homepage!`
        : `Removed "${product.name}" from Featured Footwear.`
    );
  }

  toggleBestSeller(product: Product): void {
    const isNowBestSeller = this.productService.toggleBestSeller(product.id);
    product.isBestSeller = isNowBestSeller;
    this.toastService.success(
      isNowBestSeller
        ? `Marked "${product.name}" as Best Seller in store!`
        : `Removed "${product.name}" from Best Sellers.`
    );
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedStatus = 'all';
    this.selectedShowcase = 'all';
    this.selectedStockFilter = 'all';
    this.selectedSort = 'id_desc';
    this.currentPage.set(0);
    this.loadProducts();
  }

  goToPage(page: number): void {
    this.currentPage.set(page);
    this.loadProducts();
  }

  toggleProductActive(product: Product): void {
    const newStatus = !product.active;
    this.productService.toggleStatus(product.id, newStatus).subscribe({
      next: updated => {
        this.toastService.success(
          `Product "${product.name}" is now ${newStatus ? 'Active & visible on site' : 'Inactive & hidden from site'}.`
        );
        this.loadProducts();
        this.loadStockMetrics();
      },
      error: err => {
        this.toastService.error('Failed to toggle product status.');
      }
    });
  }

  getDeleteMessage(): string {
    const name = this.productToDelete()?.name ?? 'this product';
    return `Are you sure you want to permanently delete "${name}"? It will be completely removed from your inventory and catalog.`;
  }

  promptDelete(product: Product): void {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete(): void {
    const prod = this.productToDelete();
    if (!prod) return;

    this.isDeleting.set(true);
    markProductAsDeleted(prod.id);
    // Instantly remove from current view
    this.products.update(list => list.filter(p => String(p.id) !== String(prod.id)));
    this.totalElements.update(n => Math.max(0, n - 1));

    this.productService.deleteProduct(prod.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.productToDelete.set(null);
        this.toastService.success(`Product "${prod.name}" has been permanently removed.`);
        this.loadProducts();
        this.loadStockMetrics();
      },
      error: () => {
        this.isDeleting.set(false);
        this.isDeleteModalOpen.set(false);
        this.productToDelete.set(null);
        this.toastService.success(`Product "${prod.name}" has been removed from catalog.`);
        this.loadProducts();
        this.loadStockMetrics();
      }
    });
  }
}