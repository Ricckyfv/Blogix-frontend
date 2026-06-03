import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LoginRequest, AuthResponse, RegisterRequest } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  
  private currentUserSubject = new BehaviorSubject<string | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private currentUserNameSubject = new BehaviorSubject<string | null>(null);
  public currentUserName$ = this.currentUserNameSubject.asObservable();

  private currentUserPhotoSubject = new BehaviorSubject<string | null>(null);
  public currentUserPhoto$ = this.currentUserPhotoSubject.asObservable();

  private currentUserDescSubject = new BehaviorSubject<string | null>(null);
  public currentUserDesc$ = this.currentUserDescSubject.asObservable();

  private currentUserIdSubject = new BehaviorSubject<string | null>(null);
  public currentUserId$ = this.currentUserIdSubject.asObservable();

  constructor() {
    this.checkToken();
  }

  private checkToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decoded = this.decodeToken(token);
        // Check expiration
        if (decoded && decoded.exp * 1000 > Date.now()) {
          this.currentUserSubject.next(decoded.sub || 'Usuario');
          this.currentUserIdSubject.next(decoded.id || null);
          this.fetchUserProfile().subscribe({
            error: () => this.logout()
          });
        } else {
          this.logout();
        }
      } catch (e) {
        this.logout();
      }
    }
  }

  fetchUserProfile(): Observable<any> {
    return this.apiService.get<any>('/users/me')
      .pipe(
        tap(profile => {
          if (profile) {
            this.currentUserSubject.next(profile.email || this.currentUserSubject.value || 'Usuario');
            this.currentUserNameSubject.next(profile.name || this.currentUserSubject.value || 'Usuario');
            this.currentUserPhotoSubject.next(profile.profileImage || null);
            this.currentUserDescSubject.next(profile.description || null);
          }
        })
      );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            const decoded = this.decodeToken(response.token);
            this.currentUserSubject.next(decoded.sub || 'Usuario');
            this.currentUserIdSubject.next(decoded.id || null);
            this.fetchUserProfile().subscribe();
          }
        })
      );
  }

  loginWithGoogle(idToken: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/google', { idToken })
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            const decoded = this.decodeToken(response.token);
            this.currentUserSubject.next(decoded.sub || 'Usuario');
            this.currentUserIdSubject.next(decoded.id || null);
            this.fetchUserProfile().subscribe();
          }
        })
      );
  }

  forgotPassword(email: string): Observable<any> {
    return this.apiService.post<any>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.apiService.post<any>('/auth/reset-password', { token, newPassword });
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', request)
      .pipe(
        tap(response => {
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            const decoded = this.decodeToken(response.token);
            this.currentUserSubject.next(decoded.sub || 'Usuario');
            this.currentUserIdSubject.next(decoded.id || null);
            this.fetchUserProfile().subscribe();
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.currentUserSubject.next(null);
    this.currentUserNameSubject.next(null);
    this.currentUserPhotoSubject.next(null);
    this.currentUserDescSubject.next(null);
    this.currentUserIdSubject.next(null);
  }

  updateCurrentUserDetails(name: string, photo: string | null, desc: string | null): void {
    if (name) this.currentUserNameSubject.next(name);
    this.currentUserPhotoSubject.next(photo);
    this.currentUserDescSubject.next(desc);
  }

  getCurrentUserId(): string | null {
    return this.currentUserIdSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const decoded = this.decodeToken(token);
      return decoded && decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}
