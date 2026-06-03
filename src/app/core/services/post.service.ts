import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Post, CreatePostRequest, UpdatePostRequest, Comment } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiService = inject(ApiService);

  getAllPosts(categoryId?: string, tagId?: string): Observable<Post[]> {
    let params = new HttpParams();
    if (categoryId) {
      params = params.set('categoryId', categoryId);
    }
    if (tagId) {
      params = params.set('tagId', tagId);
    }
    return this.apiService.get<Post[]>('/posts', params);
  }

  getDrafts(): Observable<Post[]> {
    return this.apiService.get<Post[]>('/posts/drafts');
  }

  getMyPosts(): Observable<Post[]> {
    return this.apiService.get<Post[]>('/posts/my-posts');
  }

  getPost(id: string): Observable<Post> {
    return this.apiService.get<Post>(`/posts/${id}`);
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    return this.apiService.post<Post>('/posts', request);
  }

  updatePost(id: string, request: UpdatePostRequest): Observable<Post> {
    return this.apiService.put<Post>(`/posts/${id}`, request);
  }

  deletePost(id: string): Observable<void> {
    return this.apiService.delete<void>(`/posts/${id}`);
  }

  toggleLike(postId: string): Observable<Post> {
    return this.apiService.post<Post>(`/posts/${postId}/like`, {});
  }

  getComments(postId: string): Observable<Comment[]> {
    return this.apiService.get<Comment[]>(`/posts/${postId}/comments`);
  }

  createComment(postId: string, content: string): Observable<Comment> {
    return this.apiService.post<Comment>(`/posts/${postId}/comments`, { content });
  }

  deleteComment(postId: string, commentId: string): Observable<void> {
    return this.apiService.delete<void>(`/posts/${postId}/comments/${commentId}`);
  }
}
