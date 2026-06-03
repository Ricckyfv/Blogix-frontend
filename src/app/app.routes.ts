import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'posts',
    loadComponent: () => import('./features/posts/post-list/post-list.component').then(m => m.PostListComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'tags',
    loadComponent: () => import('./features/tags/tags.component').then(m => m.TagsComponent)
  },
  {
    path: 'posts/my-posts',
    loadComponent: () => import('./features/posts/post-list/post-list.component').then(m => m.PostListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/drafts',
    loadComponent: () => import('./features/posts/post-list/post-list.component').then(m => m.PostListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/create',
    loadComponent: () => import('./features/posts/post-form/post-form.component').then(m => m.PostFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/edit/:id',
    loadComponent: () => import('./features/posts/post-form/post-form.component').then(m => m.PostFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/:id',
    loadComponent: () => import('./features/posts/post-detail/post-detail.component').then(m => m.PostDetailComponent)
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/posts',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/posts'
  }
];
