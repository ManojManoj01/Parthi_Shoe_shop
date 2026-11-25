import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { AdminUser, LoginCredentials, AuthResponse } from '../models/auth.model';
import { environment } from '../../../environments/environment';

const ADMIN_STORAGE_KEY = 'stepstyle_admin_user';
const ADMIN_TOKEN_KEY = 'stepstyle_admin_token';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<AdminUser | null>(this.getInitialUser());
  private tokenSignal = signal<string | null>(this.getInitialToken());
  public isLoading = signal<boolean>(false);

  public currentUser = this.currentUserSignal.asReadonly();
  public token = this.tokenSignal.asReadonly();
  public isLoggedIn = computed(() => {
    const user = this.currentUserSignal();
    const token = this.tokenSignal();
    return !!token && !!user && user.role === 'ROLE_ADMIN';
  });

  private adminAuthApiUrl = `${environment.apiUrl}/admin`;

  constructor() {
    if (this.isBrowser) {
      const user = this.currentUserSignal();
      const token = this.tokenSignal();
      if (user && token) {
        try {
          document.cookie = `stepstyle_admin_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=2592000; SameSite=Lax`;
          document.cookie = `stepstyle_admin_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax`;
        } catch (e) {}
      }
    }
  }

  private getInitialUser(): AdminUser | null {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY) || sessionStorage.getItem(ADMIN_STORAGE_KEY);
      if (!stored) return null;
      const user: AdminUser = JSON.parse(stored);
      if (user.role !== 'ROLE_ADMIN') {
        this.clearStorage();
        return null;
      }
      return user;
    } catch {
      return null;
    }
  }

  private getInitialToken(): string | null {
    if (!this.isBrowser) return null;
    try {
      return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public login(credentials: LoginCredentials): Observable<AuthResponse> {
    this.isLoading.set(true);

    const payload = {
      usernameOrEmail: credentials.usernameOrEmail.trim(),
      password: credentials.password
    };

    // Dedicated admin-only endpoint: POST /api/admin/login
    return this.http.post<any>(`${this.adminAuthApiUrl}/login`, payload).pipe(
      map(res => {
        const rawUser = res?.user || res?.data || {};
        const role = String(rawUser.role || '');

        if (role !== 'ROLE_ADMIN') {
          throw new Error('Access denied. Administrator privileges required.');
        }

        const adminUser: AdminUser = {
          id: rawUser.id,
          username: rawUser.username || credentials.usernameOrEmail,
          email: rawUser.email || '',
          firstName: rawUser.firstName || 'System',
          lastName: rawUser.lastName || 'Administrator',
          role: 'ROLE_ADMIN'
        };

        const token = res?.accessToken || res?.token;
        if (!token) {
          throw new Error('No authentication token returned from server.');
        }

        return {
          accessToken: token,
          tokenType: res?.tokenType || 'Bearer',
          expiresIn: res?.expiresIn,
          user: adminUser,
          message: res?.message || 'Authenticated successfully'
        };
      }),
      tap(authRes => {
        this.isLoading.set(false);
        this.saveSession(authRes.user, authRes.accessToken, credentials.rememberMe ?? true);
      }),
      catchError((err: HttpErrorResponse | Error) => {
        this.isLoading.set(false);
        let errorMsg = 'Invalid admin username/email or password.';
        if (err instanceof HttpErrorResponse) {
          if (err.error?.message) {
            errorMsg = err.error.message;
          } else if (err.status === 0) {
            errorMsg = 'Cannot connect to Spring Boot backend (http://localhost:8080). Please ensure server is running.';
          }
        } else if (err.message) {
          errorMsg = err.message;
        }
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  public logout(): void {
    const hadToken = !!this.tokenSignal();
    this.clearStorage();
    this.currentUserSignal.set(null);
    this.tokenSignal.set(null);

    if (hadToken) {
      this.http.post(`${this.adminAuthApiUrl}/logout`, {}).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    this.router.navigate(['/login']);
  }

  private clearStorage(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_STORAGE_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    try {
      document.cookie = 'stepstyle_admin_user=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'stepstyle_admin_token=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {}
  }

  private saveSession(user: AdminUser, token: string, remember: boolean): void {
    this.currentUserSignal.set(user);
    this.tokenSignal.set(token);

    if (this.isBrowser) {
      const storage = remember ? localStorage : sessionStorage;
      const otherStorage = remember ? sessionStorage : localStorage;

      storage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(user));
      storage.setItem(ADMIN_TOKEN_KEY, token);

      otherStorage.removeItem(ADMIN_STORAGE_KEY);
      otherStorage.removeItem(ADMIN_TOKEN_KEY);

      try {
        const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24;
        document.cookie = `stepstyle_admin_user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${maxAge}; SameSite=Lax`;
        document.cookie = `stepstyle_admin_token=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
      } catch (e) {}
    }
  }
}
