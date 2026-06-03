export interface Author {
  id: string;
  name: string;
  description?: string;
  profileImage?: string;
  email?: string;
}

export interface Category {
  id: string;
  name: string;
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  postCount?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  category: Category;
  tags: Tag[];
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  postImage?: string;
  likesCount?: number;
  likedByMe?: boolean;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: 'DRAFT' | 'PUBLISHED';
  postImage?: string;
}

export interface UpdatePostRequest {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: 'DRAFT' | 'PUBLISHED';
  postImage?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  description: string;
  profileImage: string;
}
