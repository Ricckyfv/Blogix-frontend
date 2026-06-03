import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe, AsyncPipe } from '@angular/common';
import { PostService } from '../../../core/services/post.service';
import { CategoryService } from '../../../core/services/category.service';
import { TagService } from '../../../core/services/tag.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, Category, Tag } from '../../../core/models/types';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [RouterLink, DatePipe, AsyncPipe],
  templateUrl: './post-list.component.html'
})
export class PostListComponent implements OnInit {
  private postService = inject(PostService);
  private categoryService = inject(CategoryService);
  private tagService = inject(TagService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  posts: Post[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];

  selectedCategory: string | null = null;
  selectedTag: string | null = null;
  isDraftsView = false;
  isMyPostsView = false;
  isLoading = false;
  isPostsLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    // Check if the current route is for drafts or my-posts
    this.route.url.subscribe(urlSegments => {
      this.isDraftsView = urlSegments.some(segment => segment.path === 'drafts');
      this.isMyPostsView = urlSegments.some(segment => segment.path === 'my-posts');

      // Listen to query params for category or tag filters
      this.route.queryParams.subscribe(params => {
        this.selectedCategory = params['category'] || null;
        this.selectedTag = params['tag'] || null;
        
        // Optimally fetch filters metadata once on page initialization
        if (this.categories.length === 0 || this.tags.length === 0) {
          this.loadAllData();
        } else {
          this.loadPosts();
        }
      });
    });
  }

  private sanitizer = inject(DomSanitizer);

  sanitizeHtml(htmlContent: string): SafeHtml {
    const cleanText = htmlContent.replace(/<[^>]*>/g, '');
    return this.sanitizer.bypassSecurityTrustHtml(cleanText);
  }

  loadAllData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Parallel fetch categories and tags (only on init/if empty, but forkJoin is clean)
    const sidebar$ = forkJoin({
      categories: this.categoryService.getCategories(),
      tags: this.tagService.getTags()
    });

    sidebar$.subscribe({
      next: (data) => {
        this.categories = data.categories;
        this.tags = data.tags;
        this.loadPosts();
      },
      error: (err) => {
        console.error('Error loading filters data:', err);
        // Still try to load posts even if sidebar fails
        this.loadPosts();
      }
    });
  }

  loadPosts(): void {
    // Only trigger secondary skeleton loader if initial full load has completed
    if (this.isLoading) {
      this.isPostsLoading = false;
    } else {
      this.isPostsLoading = true;
    }
    this.errorMessage = '';

    let categoryParamForBackend: string | undefined = undefined;
    if (this.selectedCategory) {
      const foundCategory = this.categories.find(c => 
        c.id === this.selectedCategory || 
        c.name.toLowerCase() === this.selectedCategory?.toLowerCase()
      );
      categoryParamForBackend = foundCategory ? foundCategory.id : this.selectedCategory;
    }

    let tagParamForBackend: string | undefined = undefined;
    if (this.selectedTag) {
      const foundTag = this.tags.find(t => t.name.toLowerCase() === this.selectedTag?.toLowerCase());
      tagParamForBackend = foundTag ? foundTag.id : undefined;
    }

    const fetch$ = this.isDraftsView
      ? this.postService.getDrafts()
      : this.isMyPostsView
        ? this.postService.getMyPosts()
        : this.postService.getAllPosts(categoryParamForBackend, tagParamForBackend);

    fetch$.subscribe({
      next: (posts) => {
        this.posts = posts;
        this.isLoading = false;
        this.isPostsLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.isPostsLoading = false;
        this.errorMessage = err.message || 'Error loading posts. Please try again later.';
      }
    });
  }

  filterByCategory(categoryName: string | null): void {
    if (this.selectedCategory === categoryName) {
      this.selectedCategory = null;
    } else {
      this.selectedCategory = categoryName;
    }
    this.updateRouteParams();
  }

  filterByTag(tagName: string | null): void {
    if (this.selectedTag === tagName) {
      this.selectedTag = null;
    } else {
      this.selectedTag = tagName;
    }
    this.updateRouteParams();
  }

  clearFilters(): void {
    this.selectedCategory = null;
    this.selectedTag = null;
    this.updateRouteParams();
  }

  private updateRouteParams(): void {
    const queryParams: any = {};
    if (this.selectedCategory) queryParams.category = this.selectedCategory;
    if (this.selectedTag) queryParams.tag = this.selectedTag;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams
    });
  }

  getPostImage(post: Post): string {
    if (post.postImage) {
      return post.postImage;
    }
    const title = post.title.toLowerCase();
    const cat = post.category.name.toLowerCase();
    if (cat.includes('front') || title.includes('react') || title.includes('css') || title.includes('html') || cat.includes('design') || cat.includes('diseño') || title.includes('angular')) {
      return 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=800&auto=format&fit=crop&q=60';
    }
    if (cat.includes('back') || title.includes('spring') || title.includes('java') || title.includes('api') || title.includes('microservice') || title.includes('monolith')) {
      return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60';
    }
    if (cat.includes('data') || cat.includes('science') || title.includes('python') || title.includes('pandas') || title.includes('sql') || cat.includes('base') || cat.includes('db') || title.includes('database')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60';
    }
    if (cat.includes('cloud') || cat.includes('sys') || title.includes('docker') || title.includes('kubernetes') || title.includes('aws') || cat.includes('architecture') || cat.includes('arquitectura')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60';
    }
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60';
  }

  getCategoryName(nameOrId: string): string {
    const cat = this.categories.find(c => c.id === nameOrId || c.name.toLowerCase() === nameOrId.toLowerCase());
    return cat ? cat.name : nameOrId;
  }

  getTagNames(tags: Tag[]): string[] {
    return tags.map(t => t.name);
  }
}
