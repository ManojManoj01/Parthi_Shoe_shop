import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ProductsComponent } from './pages/products/products.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { ContactComponent } from './pages/contact/contact.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    title: 'StepStyle Footwear Store | Palani Shoes'
  },
  {
    path: 'products',
    component: ProductsComponent,
    canActivate: [authGuard],
    title: 'Footwear & Slippers Collections | StepStyle'
  },
  {
    path: 'product/:id',
    component: ProductDetailComponent,
    canActivate: [authGuard],
    title: 'Product Details | StepStyle'
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [authGuard],
    title: 'Shopping Cart & Checkout | StepStyle'
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'My Profile & Footwear Preferences | StepStyle'
  },
  {
    path: 'contact',
    component: ContactComponent,
    canActivate: [authGuard],
    title: 'Contact Store & Directions | Palani Shoes'
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Sign In | StepStyle Footwear'
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard],
    title: 'Create Account | StepStyle Footwear'
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
    title: 'Forgot Password | StepStyle'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
