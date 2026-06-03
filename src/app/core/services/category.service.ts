import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Category } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiService = inject(ApiService);

  getCategories(): Observable<Category[]> {
    return this.apiService.get<Category[]>('/categories');
  }

  createCategory(name: string): Observable<Category> {
    return this.apiService.post<Category>('/categories', { name });
  }

  updateCategory(id: string, name: string): Observable<Category> {
    return this.apiService.put<Category>(`/categories/${id}`, { id, name });
  }

  deleteCategory(id: string): Observable<void> {
    return this.apiService.delete<void>(`/categories/${id}`);
  }
}
