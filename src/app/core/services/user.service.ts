import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Author } from '../models/types';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiService = inject(ApiService);

  // GET /api/v1/users/me
  getMyProfile(): Observable<Author> {
    return this.apiService.get<Author>('/users/me');
  }

  // PUT /api/v1/users/me
  updateProfile(profileData: Author): Observable<Author> {
    return this.apiService.put<Author>('/users/me', profileData);
  }

  // DELETE /api/v1/users/me
  deleteAccount(): Observable<void> {
    return this.apiService.delete<void>('/users/me');
  }
}
