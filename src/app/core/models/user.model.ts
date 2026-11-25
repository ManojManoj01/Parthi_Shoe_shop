export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  role?: 'customer' | 'admin';
  // Profile Setup & Delivery Details
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  shoeSize?: string | number;
  preferredCategory?: string;
  gender?: 'male' | 'female' | 'unspecified';
  bio?: string;
  notifyPromotions?: boolean;
  notifyOrderUpdates?: boolean;
  isProfileComplete?: boolean;
}

export interface UserProfileUpdateDto {
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  shoeSize?: string | number;
  preferredCategory?: string;
  gender?: 'male' | 'female' | 'unspecified';
  bio?: string;
  notifyPromotions?: boolean;
  notifyOrderUpdates?: boolean;
  newPassword?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  acceptTerms?: boolean;
}
