import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/v1/users/me';

  // GET /api/v1/users/me
  getMyProfile(): Observable<Author> {
    return this.http.get<Author>(this.apiUrl);
  }

  // PUT /api/v1/users/me
  updateProfile(profileData: Author): Observable<Author> {
    return this.http.put<Author>(this.apiUrl, profileData);
  }

  // DELETE /api/v1/users/me
  deleteAccount(): Observable<void> {
    return this.http.delete<void>(this.apiUrl);
  }
}
