import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../../../core/services/post.service';
import { AuthService } from '../../../core/services/auth.service';
import { Post, Comment } from '../../../core/models/types';
import { SafeHtmlPipe } from '../../../core/pipes/safe-html.pipe';
import { ConfirmModalComponent } from '../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, SafeHtmlPipe, ConfirmModalComponent, ReactiveFormsModule],
  templateUrl: './post-detail.component.html'
})
export class PostDetailComponent implements OnInit {
  private postService = inject(PostService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  post: Post | null = null;
  isLoading = false;
  errorMessage = '';

  // Comments state
  comments: Comment[] = [];
  commentForm!: FormGroup;
  isSubmittingComment = false;

  // Confirm Modal state
  isDeleteModalOpen = false;
  isCommentDeleteModalOpen = false;
  commentToDeleteId: string | null = null;
  showCopiedToast = false;

  ngOnInit(): void {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(1000)]]
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPost(id);
    } else {
      this.errorMessage = 'Invalid post identifier.';
    }
  }

  loadPost(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.postService.getPost(id).subscribe({
      next: (post) => {
        this.post = post;
        this.isLoading = false;
        this.loadComments(post.id);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Could not find post.';
      }
    });
  }

  loadComments(postId: string): void {
    this.postService.getComments(postId).subscribe({
      next: (comments) => {
        this.comments = comments;
      },
      error: (err) => {
        console.error('Error loading comments:', err);
      }
    });
  }

  toggleLike(): void {
    if (!this.post || !this.authService.isAuthenticated()) return;

    const originalLiked = this.post.likedByMe || false;
    const originalCount = this.post.likesCount || 0;

    // Optimistic UI update
    this.post.likedByMe = !originalLiked;
    this.post.likesCount = originalLiked ? originalCount - 1 : originalCount + 1;

    this.postService.toggleLike(this.post.id).subscribe({
      next: (updatedPost) => {
        if (this.post) {
          this.post.likedByMe = updatedPost.likedByMe;
          this.post.likesCount = updatedPost.likesCount;
        }
      },
      error: (err) => {
        // Rollback on failure
        if (this.post) {
          this.post.likedByMe = originalLiked;
          this.post.likesCount = originalCount;
        }
        console.error('Error toggling like:', err);
      }
    });
  }

  submitComment(): void {
    if (!this.post || this.commentForm.invalid) return;

    this.isSubmittingComment = true;
    const content = this.commentForm.get('content')?.value;

    this.postService.createComment(this.post.id, content).subscribe({
      next: (newComment) => {
        this.comments.push(newComment);
        this.commentForm.reset();
        this.isSubmittingComment = false;
      },
      error: (err) => {
        this.isSubmittingComment = false;
        alert(err.message || 'Error publishing comment.');
      }
    });
  }

  deleteComment(commentId: string): void {
    this.commentToDeleteId = commentId;
    this.isCommentDeleteModalOpen = true;
  }

  onCommentDeleteConfirmed(): void {
    if (!this.post || !this.commentToDeleteId) return;
    const commentId = this.commentToDeleteId;
    this.isCommentDeleteModalOpen = false;
    this.commentToDeleteId = null;

    this.postService.deleteComment(this.post.id, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
      },
      error: (err) => {
        alert(err.message || 'Error deleting comment.');
      }
    });
  }

  onDeleteRequested(): void {
    this.isDeleteModalOpen = true;
  }

  onDeleteConfirmed(): void {
    if (!this.post) return;
    this.isDeleteModalOpen = false;
    this.isLoading = true;
    this.postService.deletePost(this.post.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/posts']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.message || 'Error deleting post.';
      }
    });
  }

  onShare(): void {
    if (!this.post) return;

    const shareData = {
      title: this.post.title,
      text: this.post.title + ' - Read this post on LUCID blog.',
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('Successful share'))
        .catch((error) => {
          console.log('Error sharing', error);
          // Fallback to clipboard if share was cancelled or failed but we still want to copy
          this.copyToClipboardFallback();
        });
    } else {
      this.copyToClipboardFallback();
    }
  }

  copyToClipboardFallback(): void {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        this.showCopiedToast = true;
        setTimeout(() => {
          this.showCopiedToast = false;
        }, 3000);
      })
      .catch(err => {
        console.error('Could not copy text: ', err);
      });
  }

  getPostImage(post: Post): string {
    if (post.postImage) {
      return post.postImage;
    }
    const title = post.title.toLowerCase();
    const cat = post.category.name.toLowerCase();
    if (cat.includes('front') || title.includes('react') || title.includes('css') || title.includes('html') || cat.includes('design') || cat.includes('diseño') || title.includes('angular')) {
      return 'https://images.unsplash.com/photo-1547082299-de196ea013d6?w=1000&auto=format&fit=crop&q=60';
    }
    if (cat.includes('back') || title.includes('spring') || title.includes('java') || title.includes('api') || title.includes('microservice') || title.includes('monolith')) {
      return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=60';
    }
    if (cat.includes('data') || cat.includes('science') || title.includes('python') || title.includes('pandas') || title.includes('sql') || cat.includes('base') || cat.includes('db') || title.includes('database')) {
      return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&auto=format&fit=crop&q=60';
    }
    if (cat.includes('cloud') || cat.includes('sys') || title.includes('docker') || title.includes('kubernetes') || title.includes('aws') || cat.includes('architecture') || cat.includes('arquitectura')) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1000&auto=format&fit=crop&q=60';
    }
    return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1000&auto=format&fit=crop&q=60';
  }
}
