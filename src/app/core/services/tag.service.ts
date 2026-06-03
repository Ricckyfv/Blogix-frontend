import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Tag } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class TagService {
  private apiService = inject(ApiService);

  getTags(): Observable<Tag[]> {
    return this.apiService.get<Tag[]>('/tags');
  }

  createTags(names: string[]): Observable<Tag[]> {
    return this.apiService.post<Tag[]>('/tags', { names });
  }

  deleteTag(id: string): Observable<void> {
    return this.apiService.delete<void>(`/tags/${id}`);
  }
}
