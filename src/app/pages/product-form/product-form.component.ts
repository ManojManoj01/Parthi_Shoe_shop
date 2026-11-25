import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminProductService } from '../../core/services/product.service';
import { AdminCategoryService } from '../../core/services/category.service';
import { ToastService } from '../../core/services/toast.service';
import { Category, ProductColor, ProductRequest } from '../../core/models/product.model';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="space-y-6 max-w-4xl mx-auto pb-16 animate-fade-in">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <a routerLink="/products" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 mb-2 transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Products Catalog
          </a>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight">
            {{ isEditMode ? 'Edit Footwear Product' : 'Add New Footwear Product' }}
          </h2>
          <p class="text-xs text-slate-500">
            {{ isEditMode ? 'Update existing footwear details and stock' : 'Create a new product with live database & storage persistence' }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="resetForm()"
            [disabled]="isSaving()"
            class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Reset Form
          </button>
        </div>
      </div>

      <!-- Main Form Card -->
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="space-y-8">
        <!-- 1. Basic Info Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">1</span>
            Basic Information
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <!-- Product Name -->
            <div class="sm:col-span-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Product Name <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                formControlName="name"
                placeholder="e.g. Palani Heritage Handcrafted Pure Leather Slipper"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('name'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('name')
                }"
              />
              @if (isFieldInvalid('name')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Product name is required (max 150 characters).</p>
              }
            </div>

            <!-- SKU / Product Code -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                SKU / Product Code
              </label>
              <input
                type="text"
                formControlName="sku"
                placeholder="e.g. SS-CHAP-001"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <p class="text-[11px] text-slate-400 mt-1">Unique stock keeping unit identifier</p>
            </div>

            <!-- Brand -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Brand / Manufacturer <span class="text-rose-500">*</span>
              </label>
              <input
                type="text"
                formControlName="brand"
                placeholder="e.g. Palani Craft, StepStyle, Red Chief"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('brand'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('brand')
                }"
              />
              @if (isFieldInvalid('brand')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Brand name is required.</p>
              }
            </div>

            <!-- Category Selection with Quick Add Category -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Category <span class="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  (click)="openQuickCategoryModal()"
                  class="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 transition-colors"
                  title="Create a new footwear category on the fly"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>+ Add New Category</span>
                </button>
              </div>
              <select
                formControlName="category"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer font-medium"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('category'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('category')
                }"
              >
                <option value="" disabled>Select Footwear Category</option>
                @for (cat of categories(); track cat.id) {
                  <option [value]="cat.slug">{{ cat.name }} ({{ cat.slug }})</option>
                }
                @if (productForm.get('category')?.value && !isCategoryInList(productForm.get('category')?.value)) {
                  <option [value]="productForm.get('category')?.value">
                    {{ productForm.get('category')?.value }}
                  </option>
                }
              </select>
              @if (isFieldInvalid('category')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Category selection is required.</p>
              }
            </div>

            <!-- Status Toggle -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Catalog Status
              </label>
              <div class="flex items-center gap-3 pt-2">
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" formControlName="active" class="sr-only peer">
                  <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
                <span class="text-sm font-semibold" [ngClass]="productForm.get('active')?.value ? 'text-emerald-700' : 'text-slate-500'">
                  {{ productForm.get('active')?.value ? 'Active (Visible on Customer Site)' : 'Inactive (Hidden)' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Description <span class="text-rose-500">*</span>
            </label>
            <textarea
              formControlName="description"
              rows="4"
              placeholder="Describe materials (e.g. vegetable tanned leather), sole comfort, occasion wear, and craftsmanship..."
              class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all resize-y"
              [ngClass]="{
                'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('description'),
                'border-slate-200 focus:border-orange-500': !isFieldInvalid('description')
              }"
            ></textarea>
            @if (isFieldInvalid('description')) {
              <p class="text-xs text-rose-600 mt-1 font-medium">Description is required.</p>
            }
          </div>
        </div>

        <!-- 2. Pricing & Stock Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">2</span>
            Pricing & Inventory
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <!-- Price (Sale Price) -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Selling Price (₹ INR) <span class="text-rose-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3.5 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  formControlName="price"
                  (input)="calculateDiscount()"
                  placeholder="899"
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                  [ngClass]="{
                    'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('price'),
                    'border-slate-200 focus:border-orange-500': !isFieldInvalid('price')
                  }"
                />
              </div>
              @if (isFieldInvalid('price')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Valid price (> 0) required.</p>
              }
            </div>

            <!-- Original / MRP Price -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                MRP / Original Price (₹)
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3.5 text-slate-500 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  formControlName="originalPrice"
                  (input)="calculateDiscount()"
                  placeholder="1499"
                  class="w-full pl-8 pr-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                  [ngClass]="{
                    'border-rose-400 focus:border-rose-500 bg-rose-50/20': productForm.hasError('discountInvalid'),
                    'border-slate-200 focus:border-orange-500': !productForm.hasError('discountInvalid')
                  }"
                />
              </div>
              @if (productForm.hasError('discountInvalid')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">MRP cannot be less than sale price.</p>
              } @else if (calculatedDiscount() > 0) {
                <p class="text-xs text-emerald-600 mt-1 font-bold">
                  {{ calculatedDiscount() }}% customer discount
                </p>
              }
            </div>

            <!-- Stock Quantity -->
            <div>
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Stock Quantity <span class="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                formControlName="stockQuantity"
                placeholder="45"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 border text-slate-900 text-sm font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 transition-all"
                [ngClass]="{
                  'border-rose-400 focus:border-rose-500 bg-rose-50/20': isFieldInvalid('stockQuantity'),
                  'border-slate-200 focus:border-orange-500': !isFieldInvalid('stockQuantity')
                }"
              />
              @if (isFieldInvalid('stockQuantity')) {
                <p class="text-xs text-rose-600 mt-1 font-medium">Whole number stock (>= 0) required.</p>
              }
            </div>
          </div>
        </div>

        <!-- 3. Sizes & Colours Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">3</span>
              Available Sizes & Colours
            </h3>
            <span class="text-xs text-slate-400 font-medium">Fully customizable for your store catalog</span>
          </div>

          <!-- Available Sizes -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="text-xs font-bold uppercase tracking-wider text-slate-700">
                Shoe Sizes <span class="text-rose-500">*</span>
              </label>
              <div class="flex items-center gap-2">
                <button type="button" (click)="selectAllSizes()" class="text-xs text-orange-600 hover:underline font-semibold">Select All</button>
                <span class="text-slate-300">•</span>
                <button type="button" (click)="selectStandardSizes()" class="text-xs text-slate-600 hover:underline font-medium">Standard (6-11)</button>
                <span class="text-slate-300">•</span>
                <button type="button" (click)="clearSizes()" class="text-xs text-slate-400 hover:underline">Clear</button>
                <span class="text-slate-300">•</span>
                <button type="button" (click)="restoreDefaultSizes()" class="text-xs text-indigo-600 hover:underline font-semibold" title="Restore default UK 4-12 sizes">Restore Defaults</button>
              </div>
            </div>

            <!-- Size Chips List -->
            @if (allSizes().length === 0) {
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-3 flex items-center justify-between">
                <span>All sizes removed from palette. Add custom sizes below or restore defaults.</span>
                <button type="button" (click)="restoreDefaultSizes()" class="text-xs font-bold text-orange-600 hover:underline">Restore Default Sizes</button>
              </div>
            } @else {
              <div class="flex flex-wrap gap-2 mb-3">
                @for (size of allSizes(); track size) {
                  <div class="inline-flex items-center">
                    <button
                      type="button"
                      (click)="toggleSize(size)"
                      class="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all inline-flex items-center gap-1.5"
                      [ngClass]="selectedSizes().includes(size) ? 'bg-orange-600 text-white border-orange-600 shadow-sm shadow-orange-600/30' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                    >
                      @if (selectedSizes().includes(size)) {
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                      <span>{{ formatSizeDisplay(size) }}</span>
                    </button>
                    <button
                      type="button"
                      (click)="removeSizeFromPalette(size, $event)"
                      title="Remove size {{ size }} from palette"
                      class="ml-1 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }

            <!-- Add Custom Size Input -->
            <div class="flex items-center gap-2 max-w-md">
              <input
                #customSizeInput
                type="text"
                placeholder="Add size (e.g. 6.5, 7.5, EU 42, S, Free Size)..."
                class="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-orange-500"
                (keydown.enter)="$event.preventDefault(); addCustomSize(customSizeInput)"
              />
              <button
                type="button"
                (click)="addCustomSize(customSizeInput)"
                class="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-700 border border-orange-200 transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Size
              </button>
            </div>

            @if (selectedSizes().length === 0 && productForm.touched) {
              <p class="text-xs text-rose-600 mt-2 font-medium">Please select at least one available size.</p>
            }
          </div>

          <!-- Available Colours -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label class="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Available Colours <span class="text-rose-500">*</span>
              </label>
              <div class="flex items-center gap-2">
                <button type="button" (click)="clearColors()" class="text-xs text-slate-400 hover:underline">Clear</button>
                <span class="text-slate-300">•</span>
                <button type="button" (click)="restoreDefaultColors()" class="text-xs text-indigo-600 hover:underline font-semibold" title="Restore default colour palette">Restore Defaults</button>
              </div>
            </div>

            <!-- Color Chips List -->
            @if (availableColors().length === 0) {
              <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 mb-3 flex items-center justify-between">
                <span>All colours removed from palette. Add custom colours below or restore defaults.</span>
                <button type="button" (click)="restoreDefaultColors()" class="text-xs font-bold text-orange-600 hover:underline">Restore Default Colours</button>
              </div>
            } @else {
              <div class="flex flex-wrap gap-2 mb-3">
                @for (color of availableColors(); track color.name) {
                  <div class="inline-flex items-center">
                    <button
                      type="button"
                      (click)="toggleColor(color.name)"
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                      [ngClass]="selectedColors().includes(color.name) ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'"
                    >
                      <span class="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs shrink-0" [style.backgroundColor]="color.hex || '#64748B'"></span>
                      <span>{{ color.name }}</span>
                      @if (selectedColors().includes(color.name)) {
                        <svg class="w-3 h-3 text-emerald-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    </button>
                    <button
                      type="button"
                      (click)="removeColorFromPalette(color.name, $event)"
                      title="Remove colour {{ color.name }} from palette"
                      class="ml-1 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
            }

            <!-- Custom Color Creator (Color Name + Swatch Wheel + Add) -->
            <div class="flex flex-wrap items-center gap-2 max-w-lg">
              <div class="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs" title="Click swatch to pick shade (auto-suggests colour name)">
                <input
                  type="color"
                  [value]="safeColorHex"
                  (input)="onColorPickerChange($event, customColorInput)"
                  class="w-6 h-6 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                />
              </div>
              <input
                #customColorInput
                type="text"
                placeholder="Enter colour name (e.g. Lime Green, Maroon, Beige, Olive)..."
                class="flex-1 min-w-[200px] px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
                (input)="onColorNameInput($event)"
                (keydown.enter)="$event.preventDefault(); addCustomColor(customColorInput)"
              />
              <button
                type="button"
                (click)="addCustomColor(customColorInput)"
                class="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-xs font-bold text-orange-700 border border-orange-200 transition-colors inline-flex items-center gap-1 shrink-0"
              >
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Colour
              </button>
            </div>
            @if (selectedColors().length === 0 && productForm.touched) {
              <p class="text-xs text-rose-600 mt-2 font-medium">Please select at least one available colour.</p>
            }
          </div>
        </div>

        <!-- 4. Photos & Product Image Upload Section -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">4</span>
            Product Images & Storage
          </h3>

          <!-- Main Image Upload -->
          <div>
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Main Product Image
            </label>

            <!-- Image Preview or Upload Zone -->
            @if (mainImagePreview()) {
              <div class="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-lg group">
                <img [src]="formatImageUrl(mainImagePreview())" alt="Preview" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    (click)="removeMainImage()"
                    class="p-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 transition-colors text-xs font-bold flex items-center gap-1"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            } @else {
              <!-- Drag and drop container -->
              <div
                class="border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative"
                [ngClass]="isDragging() ? 'border-orange-500 bg-orange-50/50 scale-[1.01]' : 'border-slate-300 hover:border-orange-500 bg-slate-50/60 hover:bg-orange-50/20'"
                (click)="fileInput.click()"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onFileDropped($event)"
              >
                <input
                  #fileInput
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  class="hidden"
                  (change)="onFileSelected($event)"
                />
                <div class="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                  @if (isUploadingImage()) {
                    <svg class="w-6 h-6 animate-spin text-orange-600" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  } @else {
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                </div>
                <p class="text-sm font-bold text-slate-800">
                  {{ isUploadingImage() ? 'Uploading image...' : (isDragging() ? 'Drop image here to upload' : 'Click or drag photo here to upload') }}
                </p>
                <p class="text-xs text-slate-400 mt-1">JPEG, PNG, WEBP up to 5MB</p>
              </div>
            }

            <!-- Manual Image URL Fallback -->
            <div class="mt-4">
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Or paste public image URL:
              </label>
              <input
                type="url"
                formControlName="imageUrl"
                (input)="onUrlInput($any($event.target).value)"
                placeholder="https://images.unsplash.com/photo-..."
                class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        <!-- 5. Storefront Highlights & Placement (Manual Admin Selection) -->
        <div class="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-6">
          <div class="border-b border-slate-100 pb-3 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span class="w-6 h-6 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-black">5</span>
              Storefront Showcase & Homepage Placement
            </h3>
            <span class="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">Manual Admin Selection</span>
          </div>

          <p class="text-xs text-slate-500">
            Choose whether to pin this footwear item to special showcase sections on the customer homepage. Items are never added automatically.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Feature on Homepage -->
            <label
              class="relative flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer"
              [ngClass]="productForm.get('isFeatured')?.value ? 'border-amber-500 bg-amber-50/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'"
            >
              <div class="flex items-center h-5 mr-3 mt-0.5">
                <input
                  type="checkbox"
                  formControlName="isFeatured"
                  class="w-4 h-4 text-amber-600 border-slate-300 rounded focus:ring-amber-500 cursor-pointer"
                />
              </div>
              <div class="text-xs">
                <span class="font-bold text-slate-900 flex items-center gap-1.5">
                  <span class="text-amber-500 text-sm">★</span>
                  Featured Footwear (Homepage)
                </span>
                <p class="text-slate-500 mt-1 leading-relaxed">
                  Pin to the "Featured Footwear" handpicked carousel on the customer storefront.
                </p>
              </div>
            </label>

            <!-- Mark as Best Seller -->
            <label
              class="relative flex items-start p-4 rounded-xl border-2 transition-all cursor-pointer"
              [ngClass]="productForm.get('isBestSeller')?.value ? 'border-rose-500 bg-rose-50/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'"
            >
              <div class="flex items-center h-5 mr-3 mt-0.5">
                <input
                  type="checkbox"
                  formControlName="isBestSeller"
                  class="w-4 h-4 text-rose-600 border-slate-300 rounded focus:ring-rose-500 cursor-pointer"
                />
              </div>
              <div class="text-xs">
                <span class="font-bold text-slate-900 flex items-center gap-1.5">
                  <span class="text-rose-500 text-sm">🔥</span>
                  Best Sellers in Store
                </span>
                <p class="text-slate-500 mt-1 leading-relaxed">
                  Pin to the "Best Sellers in Store" customer favorites section with a prominent BESTSELLER badge.
                </p>
              </div>
            </label>
          </div>
        </div>

        <!-- Form Actions Bar -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
          <a
            routerLink="/products"
            class="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 text-center transition-colors"
          >
            Cancel
          </a>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              [disabled]="productForm.invalid || isSaving() || selectedSizes().length === 0"
              class="w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              @if (isSaving()) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Saving to database...</span>
              } @else {
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ isEditMode ? 'Update Product' : 'Save & Publish Product' }}</span>
              }
            </button>
          </div>
        </div>
      </form>

      <!-- Quick Add Category Modal Dialog -->
      @if (isQuickCategoryModalOpen()) {
        <div class="fixed inset-0 z-50 overflow-y-auto animate-fade-in" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" (click)="isQuickCategoryModalOpen.set(false)"></div>
          <div class="flex min-h-screen items-center justify-center p-4">
            <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md border border-slate-200 p-6 space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-base font-black text-slate-900">Add New Category</h3>
                  <p class="text-[11px] text-slate-500">Create a category and automatically set it for this footwear</p>
                </div>
                <button type="button" (click)="isQuickCategoryModalOpen.set(false)" class="text-slate-400 hover:text-slate-600">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Category Name <span class="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  [(ngModel)]="newCategoryName"
                  (input)="onNewCategoryNameChange()"
                  placeholder="e.g. Traditional Mojari, Hiking Boots, Flip-Flops"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 font-medium"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  [(ngModel)]="newCategorySlug"
                  placeholder="e.g. mojari, hiking-boots"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  [(ngModel)]="newCategoryDesc"
                  rows="2"
                  placeholder="Footwear collection details..."
                  class="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-orange-500 resize-none"
                ></textarea>
              </div>

              <div class="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  (click)="isQuickCategoryModalOpen.set(false)"
                  class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  (click)="saveAndSelectQuickCategory()"
                  [disabled]="!newCategoryName.trim() || isSavingCategory()"
                  class="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  @if (isSavingCategory()) {
                    <span>Creating...</span>
                  } @else {
                    <span>Add & Set for Product</span>
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(AdminProductService);
  private categoryService = inject(AdminCategoryService);
  private toastService = inject(ToastService);

  public isEditMode = false;
  public productId: number | null = null;
  public isSaving = signal<boolean>(false);
  public isUploadingImage = signal<boolean>(false);
  public isDragging = signal<boolean>(false);

  // Quick Category Creation State
  public isQuickCategoryModalOpen = signal<boolean>(false);
  public isSavingCategory = signal<boolean>(false);
  public newCategoryName = '';
  public newCategorySlug = '';
  public newCategoryDesc = '';

  public categories = signal<Category[]>([]);
  public selectedSizes = signal<string[]>(['6', '7', '8', '9', '10']);
  public selectedColors = signal<string[]>(['Tan', 'Dark Brown', 'Black']);
  public mainImagePreview = signal<string | null>(null);
  public calculatedDiscount = signal<number>(0);

  public readonly defaultSizes = ['4', '5', '6', '7', '8', '9', '10', '11', '12'];
  public allSizes = signal<string[]>(['4', '5', '6', '7', '8', '9', '10', '11', '12']);

  public readonly defaultColors: ProductColor[] = [
    { name: 'Tan', hex: '#8B4513' },
    { name: 'Dark Brown', hex: '#4A2511' },
    { name: 'Natural Gold', hex: '#DAA520' },
    { name: 'Black', hex: '#18181B' },
    { name: 'Navy Blue', hex: '#1E3A8A' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Olive Green', hex: '#556B2F' },
    { name: 'Grey', hex: '#64748B' }
  ];
  public availableColors = signal<ProductColor[]>([...this.defaultColors]);
  public customColorHex = '#1f4293';

  get safeColorHex(): string {
    if (/^#[0-9A-Fa-f]{6}$/.test(this.customColorHex)) {
      return this.customColorHex;
    }
    return '#1f4293';
  }

  public productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    sku: [''],
    brand: ['', [Validators.required, Validators.maxLength(100)]],
    category: ['chappals', [Validators.required]],
    price: [null, [Validators.required, Validators.min(0.01)]],
    originalPrice: [null],
    stockQuantity: [40, [Validators.required, Validators.min(0)]],
    description: ['', [Validators.required]],
    imageUrl: [''],
    active: [true],
    isFeatured: [false],
    isBestSeller: [false]
  }, { validators: this.discountValidator });

  isCategoryInList(val: string | null | undefined): boolean {
    if (!val) return false;
    const lower = val.toLowerCase();
    return this.categories().some(c =>
      (c.slug && c.slug.toLowerCase() === lower) ||
      (c.name && c.name.toLowerCase() === lower)
    );
  }

  ngOnInit(): void {
    // 1. Immediately populate categories dropdown from local storage (0ms latency!)
    const localCats = this.categoryService.getLocalCategories();
    if (localCats && localCats.length > 0) {
      this.categories.set(localCats);
    }

    // 2. Subscribe to reactive category stream so newly created categories show up instantly
    this.categoryService.categories$.subscribe(cats => {
      if (cats && cats.length > 0) {
        this.categories.set(cats);
      }
    });

    this.loadCategories();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.productId = Number(idParam);
      this.loadProductForEdit(this.productId);
    }
  }

  loadCategories(): void {
    this.categoryService.getCategories(true).subscribe({
      next: list => {
        if (list && list.length > 0) {
          this.categories.set(list);
        }
      },
      error: err => {
        console.error('Failed to load categories:', err);
      }
    });
  }

  openQuickCategoryModal(): void {
    this.newCategoryName = '';
    this.newCategorySlug = '';
    this.newCategoryDesc = '';
    this.isQuickCategoryModalOpen.set(true);
  }

  onNewCategoryNameChange(): void {
    if (!this.newCategoryName) {
      this.newCategorySlug = '';
      return;
    }
    this.newCategorySlug = this.newCategoryName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  saveAndSelectQuickCategory(): void {
    if (!this.newCategoryName.trim()) return;

    this.isSavingCategory.set(true);
    const catName = this.newCategoryName.trim();
    const slug = this.newCategorySlug.trim() || catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    this.categoryService.createCategory({
      name: catName,
      slug: slug,
      description: this.newCategoryDesc.trim() || undefined
    }).subscribe({
      next: created => {
        this.isSavingCategory.set(false);
        this.isQuickCategoryModalOpen.set(false);

        // Update list immediately & select the new category in 0ms!
        const allCats = this.categoryService.getLocalCategories();
        this.categories.set(allCats);
        this.productForm.patchValue({ category: created.slug || slug });

        this.toastService.success(`New category "${created.name}" created and assigned to this product!`);
      },
      error: () => {
        this.isSavingCategory.set(false);
        this.toastService.error('Failed to create category.');
      }
    });
  }

  loadProductForEdit(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: prod => {
        const rawCategory = prod.category || '';
        const cats = this.categories();
        const matched = cats.find(c =>
          (c.slug && c.slug.toLowerCase() === rawCategory.toLowerCase()) ||
          (c.name && c.name.toLowerCase() === rawCategory.toLowerCase())
        );
        const resolvedCategory = matched ? matched.slug : rawCategory;

        this.productForm.patchValue({
          name: prod.name,
          sku: prod.sku || '',
          brand: prod.brand,
          category: resolvedCategory,
          price: prod.price,
          originalPrice: prod.originalPrice,
          stockQuantity: prod.stockQuantity,
          description: prod.description,
          imageUrl: prod.imageUrl || '',
          active: prod.active,
          isFeatured: !!prod.isFeatured,
          isBestSeller: !!prod.isBestSeller
        });

        if (prod.availableSizes && Array.isArray(prod.availableSizes)) {
          const sizes = prod.availableSizes.map(String);
          this.selectedSizes.set(sizes);
          this.allSizes.update(curr => {
            const combined = [...curr];
            for (const s of sizes) {
              if (!combined.includes(s)) {
                combined.push(s);
              }
            }
            return this.sortSizes(combined);
          });
        }
        if (prod.availableColors && Array.isArray(prod.availableColors)) {
          const normalizedColors = prod.availableColors.map(c => {
            const trimmed = String(c).trim();
            if (/^#?[0-9A-Fa-f]{6}$/.test(trimmed)) {
              return this.getColorNameFromHex(trimmed);
            }
            return trimmed;
          });

          this.selectedColors.set(normalizedColors);
          this.availableColors.update(curr => {
            const combined = [...curr];
            for (const cName of normalizedColors) {
              if (!combined.some(c => c.name.toLowerCase() === cName.toLowerCase())) {
                combined.push({ name: cName, hex: this.getApproxColorHex(cName) });
              }
            }
            return combined;
          });
        }
        if (prod.imageUrl) {
          this.mainImagePreview.set(prod.imageUrl);
        }
        this.calculateDiscount();
      },
      error: err => {
        this.toastService.error('Could not load product details.');
        this.router.navigate(['/products']);
      }
    });
  }

  discountValidator(group: FormGroup): any {
    const price = group.get('price')?.value;
    const originalPrice = group.get('originalPrice')?.value;

    if (price && originalPrice && Number(originalPrice) < Number(price)) {
      return { discountInvalid: true };
    }
    return null;
  }

  calculateDiscount(): void {
    const price = Number(this.productForm.get('price')?.value);
    const originalPrice = Number(this.productForm.get('originalPrice')?.value);

    if (price > 0 && originalPrice > price) {
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      this.calculatedDiscount.set(discount);
    } else {
      this.calculatedDiscount.set(0);
    }
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.productForm.get(field);
    return !!(ctrl && ctrl.touched && ctrl.invalid);
  }

  private sortSizes(sizes: string[]): string[] {
    return [...sizes].sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      return a.localeCompare(b);
    });
  }

  formatSizeDisplay(size: string): string {
    if (!size) return '';
    const trimmed = size.trim();
    if (/^\d+(\.\d+)?$/.test(trimmed)) {
      return `UK ${trimmed}`;
    }
    return trimmed;
  }

  isCustomSize(size: string): boolean {
    return !this.defaultSizes.includes(size.trim());
  }

  toggleSize(size: string): void {
    const current = this.selectedSizes();
    if (current.includes(size)) {
      this.selectedSizes.set(current.filter(s => s !== size));
    } else {
      this.selectedSizes.set(this.sortSizes([...current, size]));
    }
  }

  selectAllSizes(): void {
    this.selectedSizes.set([...this.allSizes()]);
  }

  selectStandardSizes(): void {
    const standard = ['6', '7', '8', '9', '10', '11'].filter(s => this.allSizes().includes(s));
    this.selectedSizes.set(standard);
  }

  clearSizes(): void {
    this.selectedSizes.set([]);
  }

  restoreDefaultSizes(): void {
    this.allSizes.set([...this.defaultSizes]);
    this.selectedSizes.update(curr => {
      const valid = curr.filter(s => this.defaultSizes.includes(s));
      return valid.length > 0 ? valid : ['6', '7', '8', '9', '10'];
    });
    this.toastService.info('Default UK 4-12 sizes restored to palette.');
  }

  addCustomSize(input: HTMLInputElement): void {
    const raw = input.value?.trim();
    if (!raw) return;

    const existing = this.allSizes().find(s => s.toLowerCase() === raw.toLowerCase());
    const sizeToUse = existing || raw;

    if (!existing) {
      this.allSizes.update(list => this.sortSizes([...list, sizeToUse]));
    }
    if (!this.selectedSizes().includes(sizeToUse)) {
      this.selectedSizes.update(curr => this.sortSizes([...curr, sizeToUse]));
    }

    input.value = '';
  }

  removeSizeFromPalette(size: string, event: MouseEvent): void {
    event.stopPropagation();
    this.allSizes.update(list => list.filter(s => s !== size));
    this.selectedSizes.update(curr => curr.filter(s => s !== size));
  }

  isCustomColor(colorName: string): boolean {
    return !this.defaultColors.some(c => c.name.toLowerCase() === colorName.toLowerCase());
  }

  toggleColor(name: string): void {
    const current = this.selectedColors();
    if (current.includes(name)) {
      this.selectedColors.set(current.filter(c => c !== name));
    } else {
      this.selectedColors.set([...current, name]);
    }
  }

  clearColors(): void {
    this.selectedColors.set([]);
  }

  restoreDefaultColors(): void {
    this.availableColors.set([...this.defaultColors]);
    const defaultNames = this.defaultColors.map(c => c.name);
    this.selectedColors.update(curr => {
      const valid = curr.filter(c => defaultNames.includes(c));
      return valid.length > 0 ? valid : ['Tan', 'Dark Brown', 'Black'];
    });
    this.toastService.info('Default colour palette restored.');
  }

  private readonly colorPaletteDictionary: { name: string; r: number; g: number; b: number; hex: string }[] = [
    { name: 'Black', r: 24, g: 24, b: 27, hex: '#18181B' },
    { name: 'Jet Black', r: 0, g: 0, b: 0, hex: '#000000' },
    { name: 'Charcoal', r: 54, g: 69, b: 79, hex: '#36454F' },
    { name: 'Grey', r: 100, g: 116, b: 139, hex: '#64748B' },
    { name: 'Light Grey', r: 203, g: 213, b: 225, hex: '#CBD5E1' },
    { name: 'Silver', r: 192, g: 192, b: 192, hex: '#C0C0C0' },
    { name: 'White', r: 255, g: 255, b: 255, hex: '#FFFFFF' },
    { name: 'Off White', r: 250, g: 249, b: 246, hex: '#FAF9F6' },
    { name: 'Cream', r: 255, g: 253, b: 208, hex: '#FFFDD0' },
    { name: 'Beige', r: 245, g: 245, b: 220, hex: '#F5F5DC' },
    { name: 'Sand', r: 194, g: 178, b: 128, hex: '#C2B280' },
    { name: 'Khaki', r: 195, g: 176, b: 145, hex: '#C3B091' },
    { name: 'Camel', r: 193, g: 154, b: 107, hex: '#C19A6B' },
    { name: 'Tan', r: 139, g: 69, b: 19, hex: '#8B4513' },
    { name: 'Natural Gold', r: 218, g: 165, b: 32, hex: '#DAA520' },
    { name: 'Dark Brown', r: 74, g: 37, b: 17, hex: '#4A2511' },
    { name: 'Brown', r: 165, g: 42, b: 42, hex: '#A52A2A' },
    { name: 'Chocolate', r: 123, g: 63, b: 0, hex: '#7B3F00' },
    { name: 'Coffee', r: 111, g: 78, b: 55, hex: '#6F4E37' },
    { name: 'Cognac', r: 154, g: 70, b: 61, hex: '#9A463D' },
    { name: 'Caramel', r: 198, g: 139, b: 89, hex: '#C68B59' },
    { name: 'Rust', r: 183, g: 65, b: 14, hex: '#B7410E' },
    { name: 'Maroon', r: 128, g: 0, b: 0, hex: '#800000' },
    { name: 'Burgundy', r: 128, g: 0, b: 32, hex: '#800020' },
    { name: 'Wine', r: 114, g: 47, b: 55, hex: '#722F37' },
    { name: 'Navy Blue', r: 30, g: 58, b: 138, hex: '#1E3A8A' },
    { name: 'Royal Blue', r: 65, g: 105, b: 225, hex: '#4169E1' },
    { name: 'Blue', r: 37, g: 99, b: 235, hex: '#2563EB' },
    { name: 'Sky Blue', r: 135, g: 206, b: 235, hex: '#87CEEB' },
    { name: 'Teal', r: 0, g: 128, b: 128, hex: '#008080' },
    { name: 'Cyan', r: 6, g: 182, b: 212, hex: '#06B6D4' },
    { name: 'Olive Green', r: 85, g: 107, b: 47, hex: '#556B2F' },
    { name: 'Olive', r: 128, g: 128, b: 0, hex: '#808000' },
    { name: 'Lime Green', r: 151, g: 178, b: 16, hex: '#97B210' },
    { name: 'Green', r: 22, g: 163, b: 74, hex: '#16A34A' },
    { name: 'Forest Green', r: 34, g: 139, b: 34, hex: '#228B22' },
    { name: 'Mint Green', r: 152, g: 255, b: 152, hex: '#98FF98' },
    { name: 'Red', r: 220, g: 38, b: 38, hex: '#DC2626' },
    { name: 'Orange', r: 234, g: 88, b: 12, hex: '#EA580C' },
    { name: 'Coral', r: 255, g: 127, b: 80, hex: '#FF7F50' },
    { name: 'Peach', r: 255, g: 229, b: 180, hex: '#FFE5B4' },
    { name: 'Pink', r: 236, g: 72, b: 153, hex: '#EC4899' },
    { name: 'Rose Gold', r: 183, g: 110, b: 121, hex: '#B76E79' },
    { name: 'Purple', r: 147, g: 51, b: 234, hex: '#9333EA' },
    { name: 'Lavender', r: 230, g: 230, b: 250, hex: '#E6E6FA' },
    { name: 'Mustard Yellow', r: 225, g: 173, b: 1, hex: '#E1AD01' },
    { name: 'Yellow', r: 234, g: 179, b: 8, hex: '#EAB308' },
    { name: 'Gold', r: 255, g: 215, b: 0, hex: '#FFD700' }
  ];

  getColorNameFromHex(hex: string): string {
    if (!hex) return 'Custom';
    const clean = hex.replace('#', '').trim();
    if (clean.length !== 6 && clean.length !== 3) return hex;
    const fullHex = clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean;
    const r = parseInt(fullHex.substring(0, 2), 16);
    const g = parseInt(fullHex.substring(2, 4), 16);
    const b = parseInt(fullHex.substring(4, 6), 16);
    if (isNaN(r) || isNaN(g) || isNaN(b)) return 'Custom';

    let minDistance = Infinity;
    let closestName = 'Custom';

    for (const item of this.colorPaletteDictionary) {
      const dr = r - item.r;
      const dg = g - item.g;
      const db = b - item.b;
      const dist = (dr * dr * 0.3) + (dg * dg * 0.59) + (db * db * 0.11);
      if (dist < minDistance) {
        minDistance = dist;
        closestName = item.name;
      }
    }
    return closestName;
  }

  onColorPickerChange(event: Event, nameInput?: HTMLInputElement): void {
    const val = (event.target as HTMLInputElement).value;
    if (val) {
      this.customColorHex = val.toLowerCase();
      if (nameInput) {
        nameInput.value = this.getColorNameFromHex(this.customColorHex);
      }
    }
  }

  onColorNameInput(event: Event): void {
    const val = ((event.target as HTMLInputElement).value || '').trim();
    if (/^#?[0-9A-Fa-f]{6}$/.test(val)) {
      const hex = val.startsWith('#') ? val : '#' + val;
      this.customColorHex = hex.toLowerCase();
    } else if (val) {
      this.customColorHex = this.getApproxColorHex(val);
    }
  }

  addCustomColor(input: HTMLInputElement): void {
    let raw = input.value?.trim();
    let hex = this.customColorHex?.trim() || '#556B2F';

    // If input is empty or contains a hex code (e.g. #97b210, #1f4293)
    if (!raw || /^#?[0-9A-Fa-f]{6}$/.test(raw)) {
      if (raw && /^#?[0-9A-Fa-f]{6}$/.test(raw)) {
        hex = raw.startsWith('#') ? raw : '#' + raw;
        this.customColorHex = hex.toLowerCase();
      }
      // Never save a color code as the name: translate to pure color name!
      raw = this.getColorNameFromHex(hex);
    } else {
      hex = this.getApproxColorHex(raw);
    }

    // Capitalize words nicely (e.g. "lime green" -> "Lime Green")
    const name = raw.replace(/\b\w/g, l => l.toUpperCase());

    const existing = this.availableColors().find(c => c.name.toLowerCase() === name.toLowerCase());

    if (!existing) {
      this.availableColors.update(list => [...list, { name, hex }]);
    } else if (!existing.hex) {
      existing.hex = hex;
      this.availableColors.update(list => [...list]);
    }

    const finalName = existing ? existing.name : name;
    if (!this.selectedColors().includes(finalName)) {
      this.selectedColors.update(c => [...c, finalName]);
    }

    input.value = '';
  }

  removeColorFromPalette(colorName: string, event: MouseEvent): void {
    event.stopPropagation();
    this.availableColors.update(list => list.filter(c => c.name.toLowerCase() !== colorName.toLowerCase()));
    this.selectedColors.update(list => list.filter(c => c.toLowerCase() !== colorName.toLowerCase()));
  }

  getApproxColorHex(name: string): string {
    if (!name) return '#64748B';
    const lower = name.toLowerCase().trim();

    // Check exact match in dictionary
    const exact = this.colorPaletteDictionary.find(c => c.name.toLowerCase() === lower);
    if (exact) return exact.hex;

    // Check substring match in dictionary
    const sub = this.colorPaletteDictionary.find(c => lower.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(lower));
    if (sub) return sub.hex;

    return '#556B2F';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.processImageFile(file);
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    this.processImageFile(file);
    if (event.target) {
      event.target.value = '';
    }
  }

  private processImageFile(file: File): void {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.toastService.error('Only image files (JPEG, PNG, WEBP, GIF) are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('File size exceeds the 5MB maximum limit.');
      return;
    }

    this.isUploadingImage.set(true);

    this.productService.uploadImage(file).subscribe({
      next: res => {
        this.isUploadingImage.set(false);
        this.mainImagePreview.set(res.imageUrl);
        this.productForm.patchValue({ imageUrl: res.imageUrl });
        this.toastService.success('Image uploaded successfully!');
      },
      error: () => {
        this.isUploadingImage.set(false);
        // Fallback: Read file as Data URL locally so product creation is never blocked
        if (typeof FileReader !== 'undefined') {
          const reader = new FileReader();
          reader.onload = (e: any) => {
            const dataUrl = e.target.result as string;
            this.mainImagePreview.set(dataUrl);
            this.productForm.patchValue({ imageUrl: dataUrl });
            this.toastService.info('Backend upload unavailable. Image preserved locally as offline preview.');
          };
          reader.onerror = () => {
            this.toastService.error('Failed to read image file. You can paste an image URL instead.');
          };
          reader.readAsDataURL(file);
        } else {
          this.toastService.error('Failed to upload image. You can paste an image URL instead.');
        }
      }
    });
  }

  onUrlInput(url: string): void {
    if (url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/uploads/'))) {
      this.mainImagePreview.set(url);
    } else if (!url) {
      this.mainImagePreview.set(null);
    }
  }

  removeMainImage(): void {
    this.mainImagePreview.set(null);
    this.productForm.patchValue({ imageUrl: '' });
  }

  formatImageUrl(url: string | null | undefined): string {
    return this.productService.formatImageUrl(url);
  }

  resetForm(): void {
    this.productForm.reset({
      category: 'chappals',
      stockQuantity: 40,
      active: true,
      isFeatured: false,
      isBestSeller: false
    });
    this.allSizes.set([...this.defaultSizes]);
    this.availableColors.set([...this.defaultColors]);
    this.selectedSizes.set(['6', '7', '8', '9', '10']);
    this.selectedColors.set(['Tan', 'Dark Brown', 'Black']);
    this.customColorHex = '#1f4293';
    this.mainImagePreview.set(null);
    this.calculatedDiscount.set(0);
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.selectedSizes().length === 0 || this.selectedColors().length === 0) {
      this.productForm.markAllAsTouched();
      this.toastService.error('Please complete all required fields and select at least one size and colour.');
      return;
    }

    this.isSaving.set(true);
    const formVal = this.productForm.value;

    const price = Number(formVal.price);
    const originalPrice = formVal.originalPrice ? Number(formVal.originalPrice) : price;
    const discountPercentage = this.calculatedDiscount();

    const requestPayload: ProductRequest = {
      name: formVal.name.trim(),
      sku: formVal.sku ? formVal.sku.trim() : undefined,
      brand: formVal.brand.trim(),
      category: formVal.category,
      price,
      originalPrice,
      discountPercentage,
      stockQuantity: Number(formVal.stockQuantity),
      description: formVal.description.trim(),
      imageUrl: formVal.imageUrl ? formVal.imageUrl.trim() : (this.mainImagePreview() || undefined),
      availableSizes: this.selectedSizes(),
      availableColors: this.selectedColors(),
      active: formVal.active,
      isFeatured: !!formVal.isFeatured,
      isBestSeller: !!formVal.isBestSeller
    };

    if (this.isEditMode && this.productId) {
      this.productService.updateProduct(this.productId, requestPayload).subscribe({
        next: updated => {
          this.productService.setProductShowcase(this.productId!, !!formVal.isFeatured, !!formVal.isBestSeller);
          this.isSaving.set(false);
          this.toastService.success(`Product "${updated.name}" updated successfully! Changes are live on customer site.`);
          this.router.navigate(['/products']);
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message || 'Failed to update product in database.');
        }
      });
    } else {
      this.productService.createProduct(requestPayload).subscribe({
        next: created => {
          if (created && created.id) {
            this.productService.setProductShowcase(created.id, !!formVal.isFeatured, !!formVal.isBestSeller);
          }
          this.isSaving.set(false);
          this.toastService.success(`Product "${created.name}" created successfully! Now visible on customer site.`);
          this.router.navigate(['/products']);
        },
        error: err => {
          this.isSaving.set(false);
          this.toastService.error(err?.error?.message || 'Failed to create product in database.');
        }
      });
    }
  }
}
