import { Component, OnInit, inject, signal, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { User, UserProfileUpdateDto } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in space-y-8">
      
      <!-- PROFILE HEADER CARD -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
        
        <!-- Avatar Section with Selector -->
        <div class="relative group shrink-0 text-center">
          <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-orange-500/20 shadow-lg bg-slate-100 relative">
            <img
              [src]="selectedAvatar() || currentAvatarFallback"
              alt="Profile Avatar"
              class="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            (click)="showAvatarPicker.set(!showAvatarPicker())"
            class="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 rounded-xl text-xs font-bold transition-all shadow-xs">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Change Photo</span>
          </button>

          <!-- Avatar Picker Modal/Flyout -->
          @if (showAvatarPicker()) {
            <div class="absolute left-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 w-72 z-50 animate-fade-in text-left">
              <p class="text-xs font-bold text-slate-800 mb-2">Choose an Avatar</p>
              <div class="grid grid-cols-4 gap-2 mb-3">
                @for (avatar of presetAvatars; track avatar) {
                  <button
                    type="button"
                    (click)="selectPresetAvatar(avatar)"
                    class="w-12 h-12 rounded-xl overflow-hidden border-2 transition-transform hover:scale-105"
                    [ngClass]="selectedAvatar() === avatar ? 'border-orange-500 ring-2 ring-orange-400' : 'border-slate-200'">
                    <img [src]="avatar" class="w-full h-full object-cover" />
                  </button>
                }
              </div>
              <div class="space-y-1.5">
                <label class="text-[11px] font-bold text-slate-600">Or Paste Image URL:</label>
                <input
                  type="text"
                  #customUrlInput
                  placeholder="https://..."
                  class="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
                <button
                  type="button"
                  (click)="applyCustomAvatar(customUrlInput.value)"
                  class="w-full mt-1 py-1 text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white rounded-lg">
                  Apply URL
                </button>
              </div>
            </div>
          }
        </div>

        <!-- User Identity & Quick Metrics -->
        <div class="flex-1 text-center md:text-left space-y-3">
          <div class="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {{ profileForm.get('firstName')?.value }} {{ profileForm.get('lastName')?.value }}
            </h1>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
              <svg class="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
              Verified Member
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold uppercase tracking-wider">
              StepStyle Palani
            </span>
          </div>

          <p class="text-xs text-slate-500 font-medium">
            &#64;{{ authService.currentUser()?.username }} &bull; {{ authService.currentUser()?.email }}
          </p>

          <!-- Profile Completion Bar -->
          <div class="max-w-md pt-2 space-y-1.5">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-slate-700">Profile Setup Progress</span>
              <span class="font-extrabold text-orange-600">{{ authService.profileCompletion() }}%</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                class="bg-gradient-to-r from-orange-500 to-amber-500 h-2.5 rounded-full transition-all duration-500"
                [style.width.%]="authService.profileCompletion()">
              </div>
            </div>
            @if (authService.profileCompletion() < 100) {
              <p class="text-[11px] text-slate-500">
                Tip: Add your delivery address and shoe size to reach 100% and speed up checkout!
              </p>
            } @else {
              <p class="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                Your footwear profile is 100% complete!
              </p>
            }
          </div>
        </div>

        <!-- Quick Store Stats -->
        <div class="w-full md:w-auto flex md:flex-col justify-around gap-2 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 shrink-0">
          <div class="text-center md:text-left">
            <span class="block text-[11px] font-bold uppercase text-slate-400">Shoe Size</span>
            <span class="text-base font-black text-slate-900">{{ profileForm.get('shoeSize')?.value || 'Not set' }}</span>
          </div>
          <div class="text-center md:text-left">
            <span class="block text-[11px] font-bold uppercase text-slate-400">Default City</span>
            <span class="text-base font-black text-slate-900">{{ profileForm.get('city')?.value || 'Palani' }}</span>
          </div>
          <div class="text-center md:text-left">
            <span class="block text-[11px] font-bold uppercase text-slate-400">Preference</span>
            <span class="text-base font-black text-orange-600 capitalize">{{ profileForm.get('preferredCategory')?.value || 'Slippers' }}</span>
          </div>
        </div>

      </div>

      <!-- MAIN PROFILE SETUP FORM -->
      <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="space-y-8">
        
        <!-- SECTION 1: Personal Information -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              👤
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">Personal Information</h2>
              <p class="text-xs text-slate-500">Your core account identity details</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <!-- First Name -->
            <div>
              <label for="firstName" class="block text-xs font-bold text-slate-700 mb-1">First Name *</label>
              <input
                id="firstName"
                type="text"
                formControlName="firstName"
                placeholder="e.g. Manoj"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                [ngClass]="{ 'border-rose-400 bg-rose-50/20': isInvalid('firstName') }"
              />
              @if (isInvalid('firstName')) {
                <p class="text-[11px] text-rose-600 mt-1">First name is required.</p>
              }
            </div>

            <!-- Last Name -->
            <div>
              <label for="lastName" class="block text-xs font-bold text-slate-700 mb-1">Last Name *</label>
              <input
                id="lastName"
                type="text"
                formControlName="lastName"
                placeholder="e.g. Kumar"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                [ngClass]="{ 'border-rose-400 bg-rose-50/20': isInvalid('lastName') }"
              />
              @if (isInvalid('lastName')) {
                <p class="text-[11px] text-rose-600 mt-1">Last name is required.</p>
              }
            </div>

            <!-- Email (Read-Only) -->
            <div>
              <label for="email" class="block text-xs font-bold text-slate-700 mb-1">
                Email Address
                <span class="text-[10px] text-slate-400 font-normal ml-1">(Primary Login)</span>
              </label>
              <div class="relative">
                <input
                  id="email"
                  type="email"
                  [value]="authService.currentUser()?.email"
                  disabled
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500 cursor-not-allowed font-medium"
                />
                <span class="absolute right-3.5 top-3 text-emerald-600 text-[11px] font-bold flex items-center gap-1">
                  Verified ✓
                </span>
              </div>
            </div>

            <!-- Phone Number -->
            <div>
              <label for="phone" class="block text-xs font-bold text-slate-700 mb-1">
                Phone Number *
                <span class="text-[10px] text-slate-400 font-normal ml-1">(For delivery SMS & OTP)</span>
              </label>
              <input
                id="phone"
                type="tel"
                formControlName="phone"
                placeholder="e.g. +91 98421 23456"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                [ngClass]="{ 'border-rose-400 bg-rose-50/20': isInvalid('phone') }"
              />
              @if (isInvalid('phone')) {
                <p class="text-[11px] text-rose-600 mt-1">Please provide a valid phone number (min 10 digits).</p>
              }
            </div>

            <!-- Gender -->
            <div>
              <label for="gender" class="block text-xs font-bold text-slate-700 mb-1">Gender / Fit Preference</label>
              <select
                id="gender"
                formControlName="gender"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium">
                <option value="unspecified">Prefer not to say</option>
                <option value="male">Male (Men's Sizing)</option>
                <option value="female">Female (Women's Sizing)</option>
              </select>
            </div>

            <!-- Short Bio / Notes -->
            <div>
              <label for="bio" class="block text-xs font-bold text-slate-700 mb-1">Personal Note / Preferences</label>
              <input
                id="bio"
                type="text"
                formControlName="bio"
                placeholder="e.g. Looking for lightweight daily temple walking slippers"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <!-- SECTION 2: Shipping & Delivery Address -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              📍
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">Default Shipping & Delivery Address</h2>
              <p class="text-xs text-slate-500">Auto-filled during checkout for instant 1-click orders</p>
            </div>
          </div>

          <div class="space-y-4">
            <!-- Street Address -->
            <div>
              <label for="address" class="block text-xs font-bold text-slate-700 mb-1">
                Street Address / Door No. / Landmark *
              </label>
              <textarea
                id="address"
                rows="2"
                formControlName="address"
                placeholder="e.g. No. 14, Adivaram Road, Near Palani Murugan Temple"
                class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium resize-none"
                [ngClass]="{ 'border-rose-400 bg-rose-50/20': isInvalid('address') }"></textarea>
              @if (isInvalid('address')) {
                <p class="text-[11px] text-rose-600 mt-1">Shipping address is required for shoe deliveries.</p>
              }
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <!-- City -->
              <div>
                <label for="city" class="block text-xs font-bold text-slate-700 mb-1">City / Town *</label>
                <input
                  id="city"
                  type="text"
                  formControlName="city"
                  placeholder="e.g. Palani"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  [ngClass]="{ 'border-rose-400 bg-rose-50/20': isInvalid('city') }"
                />
                <!-- Quick City Selector Chips -->
                <div class="flex flex-wrap gap-1.5 mt-2">
                  @for (c of popularCities; track c) {
                    <button
                      type="button"
                      (click)="setCity(c)"
                      class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 hover:bg-orange-50 text-slate-600 hover:text-orange-600 transition-colors">
                      {{ c }}
                    </button>
                  }
                </div>
              </div>

              <!-- State -->
              <div>
                <label for="state" class="block text-xs font-bold text-slate-700 mb-1">State *</label>
                <input
                  id="state"
                  type="text"
                  formControlName="state"
                  placeholder="Tamil Nadu"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>

              <!-- PIN / Postal Code -->
              <div>
                <label for="postalCode" class="block text-xs font-bold text-slate-700 mb-1">PIN / Postal Code *</label>
                <input
                  id="postalCode"
                  type="text"
                  formControlName="postalCode"
                  placeholder="e.g. 624601"
                  maxlength="6"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                  [ngClass]="{ 'border-rose-400 bg-rose-50/20': isInvalid('postalCode') }"
                />
                @if (isInvalid('postalCode')) {
                  <p class="text-[11px] text-rose-600 mt-1">Enter a valid 6-digit PIN code.</p>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- SECTION 3: Footwear Fit & Shopping Preferences -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div class="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              👟
            </div>
            <div>
              <h2 class="text-lg font-black text-slate-900">Footwear Fit & Shopping Preferences</h2>
              <p class="text-xs text-slate-500">Helps us recommend the best fitting slippers and footwear</p>
            </div>
          </div>

          <!-- Shoe Size Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              Preferred Footwear Size (India / UK Sizing)
            </label>
            <div class="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
              @for (size of availableSizes; track size) {
                <button
                  type="button"
                  (click)="selectShoeSize(size)"
                  class="py-3 px-2 rounded-2xl border-2 font-black text-xs sm:text-sm text-center transition-all flex flex-col items-center justify-center gap-0.5"
                  [ngClass]="profileForm.get('shoeSize')?.value === size ? 'border-orange-600 bg-orange-50 text-orange-600 shadow-sm' : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'">
                  <span>{{ size }}</span>
                  <span class="text-[9px] font-bold text-slate-400">UK/IND</span>
                </button>
              }
            </div>
          </div>

          <!-- Category Preference -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-2">
              Favorite Footwear Category
            </label>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
              @for (cat of categoryOptions; track cat.id) {
                <button
                  type="button"
                  (click)="selectCategory(cat.id)"
                  class="p-3.5 rounded-2xl border-2 text-left transition-all flex items-center gap-3"
                  [ngClass]="profileForm.get('preferredCategory')?.value === cat.id ? 'border-orange-600 bg-orange-50/60 shadow-xs' : 'border-slate-100 bg-white hover:border-slate-300'">
                  <span class="text-xl">{{ cat.icon }}</span>
                  <div>
                    <span class="block text-xs font-extrabold text-slate-900">{{ cat.name }}</span>
                    <span class="block text-[10px] text-slate-500">{{ cat.subtext }}</span>
                  </div>
                </button>
              }
            </div>
          </div>

          <!-- Notifications Toggles -->
          <div class="pt-4 border-t border-slate-100 space-y-3">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                formControlName="notifyPromotions"
                class="rounded w-4 h-4 accent-orange-600 cursor-pointer"
              />
              <span class="text-xs font-medium text-slate-700">
                Notify me about Palani festival sales, Thai Poosam shoe discounts, and exclusive seasonal coupons
              </span>
            </label>
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                formControlName="notifyOrderUpdates"
                class="rounded w-4 h-4 accent-orange-600 cursor-pointer"
              />
              <span class="text-xs font-medium text-slate-700">
                Send SMS & Email updates on my footwear order tracking and delivery status
              </span>
            </label>
          </div>
        </div>

        <!-- SECTION 4: Change Password (Optional) -->
        <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-6">
          <div class="flex items-center justify-between pb-4 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                🔒
              </div>
              <div>
                <h2 class="text-lg font-black text-slate-900">Security & Password</h2>
                <p class="text-xs text-slate-500">Keep your account protected with a strong password</p>
              </div>
            </div>
            <button
              type="button"
              (click)="changePasswordOpen.set(!changePasswordOpen())"
              class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
              {{ changePasswordOpen() ? 'Cancel' : 'Change Password' }}
            </button>
          </div>

          @if (changePasswordOpen()) {
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              <div>
                <label for="newPassword" class="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  formControlName="newPassword"
                  placeholder="At least 6 characters"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
              <div>
                <label for="confirmNewPassword" class="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  formControlName="confirmNewPassword"
                  placeholder="Repeat new password"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium"
                />
              </div>
            </div>
          }
        </div>

        <!-- FORM ACTION BUTTONS -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div class="flex items-center gap-2">
            <a
              routerLink="/products"
              class="px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-all">
              &larr; Back to Products
            </a>
            <button
              type="button"
              (click)="resetForm()"
              class="px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-800 text-xs font-semibold">
              Discard Changes
            </button>
          </div>

          <div class="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              [disabled]="isSaving()"
              class="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-600/25 transition-all flex items-center justify-center gap-2 transform active:scale-95">
              @if (isSaving()) {
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Profile...</span>
              } @else {
                <span>Save Profile Setup ✓</span>
              }
            </button>
          </div>
        </div>

      </form>

      <!-- MY ORDERS SECTION (Strictly Scoped to Current User in Supabase) -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-lg font-black text-slate-900">My Orders</h2>
            <p class="text-xs text-slate-500">Orders placed from your account only</p>
          </div>
          <button
            type="button"
            (click)="loadMyOrders()"
            class="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Refresh
          </button>
        </div>

        @if (isLoadingOrders()) {
          <p class="text-xs text-slate-500 py-4 text-center">Loading your orders...</p>
        } @else if (myOrders().length === 0) {
          <div class="text-center py-6 space-y-2">
            <p class="text-xs text-slate-500">You have not placed any orders yet.</p>
            <a routerLink="/products" class="inline-block text-xs font-bold text-orange-600 hover:underline">
              Browse Footwear &rarr;
            </a>
          </div>
        } @else {
          <div class="space-y-3">
            @for (ord of myOrders(); track ord.id) {
              <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-black text-slate-900">{{ ord.orderNumber }}</span>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">{{ ord.status }}</span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-1">
                    {{ ord.orderDate | date:'medium' }} &bull; {{ ord.items?.length || 0 }} item(s) &bull; {{ ord.paymentMethod }}
                  </p>
                </div>
                <div class="text-left sm:text-right">
                  <span class="text-sm font-black text-orange-600">₹{{ ord.totalAmount }}</span>
                </div>
              </div>
            }
          </div>
        }
      </div>

    </div>
  `
})
export class ProfileComponent implements OnInit {
  public authService = inject(AuthService);
  private cartService = inject(CartService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isSaving = signal(false);
  public isSetupMode = signal(false);
  public showAvatarPicker = signal(false);
  public changePasswordOpen = signal(false);
  public selectedAvatar = signal<string>('');
  public myOrders = signal<any[]>([]);
  public isLoadingOrders = signal(false);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      untracked(() => {
        if (user) {
          this.populateForm(user);
        }
      });
    });
  }

  public currentAvatarFallback = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

  public presetAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80'
  ];

  public availableSizes = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11', 'UK 12'];

  public popularCities = ['Palani', 'Dindigul', 'Madurai', 'Coimbatore', 'Chennai', 'Bengaluru'];

  public categoryOptions = [
    { id: 'chappals', name: 'Palani Slippers', subtext: 'Traditional handcrafted slippers & slides', icon: '🩴' },
    { id: 'men', name: 'Men’s Footwear', subtext: 'Casual & leather collections', icon: '👞' },
    { id: 'women', name: 'Women’s Footwear', subtext: 'Comfort heels & sandals', icon: '👠' },
    { id: 'sports', name: 'Sports & Running', subtext: 'Cushioned daily trainers', icon: '👟' },
    { id: 'formal', name: 'Formal Shoes', subtext: 'Office & celebration attire', icon: '👔' },
    { id: 'kids', name: 'Kids Collections', subtext: 'Soft sole active shoes', icon: '🧒' }
  ];

  public profileForm: FormGroup = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    gender: ['unspecified'],
    bio: [''],
    address: ['', [Validators.required, Validators.minLength(5)]],
    city: ['Palani', [Validators.required]],
    state: ['Tamil Nadu', [Validators.required]],
    postalCode: ['624601', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
    shoeSize: ['UK 8'],
    preferredCategory: ['chappals'],
    notifyPromotions: [true],
    notifyOrderUpdates: [true],
    newPassword: [''],
    confirmNewPassword: ['']
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.isSetupMode.set(params['setup'] === 'true');
    });

    const user = this.authService.currentUser();
    if (user) {
      this.populateForm(user);
      this.loadMyOrders();
    }
  }

  public loadMyOrders(): void {
    if (!this.authService.isLoggedIn()) return;
    this.isLoadingOrders.set(true);
    this.cartService.getMyOrders().subscribe({
      next: orders => {
        this.myOrders.set(Array.isArray(orders) ? orders : []);
        this.isLoadingOrders.set(false);
      },
      error: () => {
        this.myOrders.set([]);
        this.isLoadingOrders.set(false);
      }
    });
  }

  private populateForm(user: User): void {
    this.selectedAvatar.set(user.avatar || this.currentAvatarFallback);
    this.profileForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      gender: user.gender || 'unspecified',
      bio: user.bio || '',
      address: user.address || '',
      city: user.city || 'Palani',
      state: user.state || 'Tamil Nadu',
      postalCode: user.postalCode || '624601',
      shoeSize: user.shoeSize || 'UK 8',
      preferredCategory: user.preferredCategory || 'chappals',
      notifyPromotions: user.notifyPromotions ?? true,
      notifyOrderUpdates: user.notifyOrderUpdates ?? true
    });
  }

  public isInvalid(field: string): boolean {
    const ctrl = this.profileForm.get(field);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }

  public selectShoeSize(size: string): void {
    this.profileForm.patchValue({ shoeSize: size });
    this.profileForm.markAsDirty();
  }

  public selectCategory(catId: string): void {
    this.profileForm.patchValue({ preferredCategory: catId });
    this.profileForm.markAsDirty();
  }

  public setCity(city: string): void {
    this.profileForm.patchValue({ city });
    this.profileForm.markAsDirty();
  }

  public selectPresetAvatar(avatarUrl: string): void {
    this.selectedAvatar.set(avatarUrl);
    this.showAvatarPicker.set(false);
    this.profileForm.markAsDirty();
  }

  public applyCustomAvatar(url: string): void {
    if (url && url.startsWith('http')) {
      this.selectedAvatar.set(url.trim());
      this.showAvatarPicker.set(false);
      this.profileForm.markAsDirty();
    } else {
      this.toastService.warning('Please enter a valid image URL (e.g. https://...)');
    }
  }

  public resetForm(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.populateForm(user);
      this.toastService.info('Profile changes reset to current saved values.');
    }
  }

  public onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastService.warning('Please review and fill the required profile fields.');
      return;
    }

    const val = this.profileForm.value;

    if (val.newPassword && val.newPassword !== val.confirmNewPassword) {
      this.toastService.error('New passwords do not match.');
      return;
    }

    this.isSaving.set(true);

    const updatePayload: UserProfileUpdateDto = {
      firstName: val.firstName.trim(),
      lastName: val.lastName.trim(),
      phone: val.phone.trim(),
      gender: val.gender,
      bio: val.bio?.trim() || '',
      address: val.address.trim(),
      city: val.city.trim(),
      state: val.state.trim(),
      postalCode: val.postalCode.trim(),
      shoeSize: val.shoeSize,
      preferredCategory: val.preferredCategory,
      avatar: this.selectedAvatar(),
      notifyPromotions: val.notifyPromotions,
      notifyOrderUpdates: val.notifyOrderUpdates,
      ...(val.newPassword ? { newPassword: val.newPassword } : {})
    };

    this.authService.updateProfile(updatePayload).subscribe({
      next: (updatedUser) => {
        this.isSaving.set(false);
        this.toastService.success('Profile and footwear preferences saved successfully! 🎉');

        if (this.isSetupMode()) {
          this.isSetupMode.set(false);
          this.router.navigate(['/products'], {
            queryParams: { category: updatedUser.preferredCategory }
          });
        }
      },
      error: (err) => {
        this.isSaving.set(false);
        this.toastService.error(err?.message || 'Could not save profile changes.');
      }
    });
  }
}

